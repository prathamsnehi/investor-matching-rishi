import importlib
import sys
from types import ModuleType, SimpleNamespace
from typing import Any

import pytest
from fastapi import HTTPException, status
from jose import jwt
from pydantic import ValidationError

from src_api.schemas.auth import AccountBase, AccountRole, ChangePasswordRequest


@pytest.fixture(name="security_module")
def fixture_security_module(monkeypatch: pytest.MonkeyPatch) -> Any:
    monkeypatch.setenv("JWT_SECRET_KEY", "unit-test-secret")

    import src_api.core.security as security_module

    return importlib.reload(security_module)


def test_password_hash_round_trip(security_module: Any) -> None:
    engine: Any = security_module.SecurityEngine()
    password: str = "CorrectHorseBatteryStaple"

    hashed_password: str = engine.get_password_hash(password)

    assert hashed_password != password
    assert engine.verify_password(password, hashed_password) is True
    assert engine.verify_password("wrong-password", hashed_password) is False


def test_access_token_contains_expected_auth_claims(security_module: Any) -> None:
    engine: Any = security_module.SecurityEngine()
    token: str = engine.create_access_token(
        data={"sub": "acct_123", "tokenVersion": 4, "role": AccountRole.FOUNDER.value}
    )

    payload: dict[str, Any] = jwt.decode(
        token,
        "unit-test-secret",
        algorithms=[security_module.ALGORITHM],
    )

    assert payload["sub"] == "acct_123"
    assert payload["tokenVersion"] == 4
    assert payload["role"] == AccountRole.FOUNDER.value
    assert "exp" in payload


def test_signup_schema_accepts_valid_account() -> None:
    account: AccountBase = AccountBase(
        role=AccountRole.INVESTOR,
        full_name="Ada Lovelace",
        email_address="ada@example.com",
        mobile_number="+15555550123",
        password="strongpass",
        linkedin_profile_url="https://www.linkedin.com/in/ada/",
    )

    assert account.role is AccountRole.INVESTOR
    assert account.email_address == "ada@example.com"
    assert str(account.linkedin_profile_url) == "https://www.linkedin.com/in/ada/"


@pytest.mark.parametrize(
    ("payload", "field_name"),
    [
        (
            {
                "role": AccountRole.FOUNDER,
                "full_name": "Grace Hopper",
                "email_address": "not-an-email",
                "mobile_number": "+15555550124",
                "password": "strongpass",
            },
            "email_address",
        ),
        (
            {
                "role": AccountRole.FOUNDER,
                "full_name": "Grace Hopper",
                "email_address": "grace@example.com",
                "mobile_number": "+15555550124",
                "password": "short",
            },
            "password",
        ),
    ],
)
def test_signup_schema_rejects_invalid_account_data(
    payload: dict[str, Any],
    field_name: str,
) -> None:
    with pytest.raises(ValidationError) as exc_info:
        AccountBase(**payload)

    invalid_fields: set[str] = {str(error["loc"][0]) for error in exc_info.value.errors()}
    assert field_name in invalid_fields


def test_change_password_schema_requires_strong_new_password() -> None:
    with pytest.raises(ValidationError) as exc_info:
        ChangePasswordRequest(old_password="old-password", new_password="short")

    invalid_fields: set[str] = {str(error["loc"][0]) for error in exc_info.value.errors()}
    assert "new_password" in invalid_fields


def import_auth_endpoint_with_fake_db(monkeypatch: pytest.MonkeyPatch, fake_db: SimpleNamespace) -> Any:
    fake_prisma_client_module: ModuleType = ModuleType("prisma_db.prisma_client")
    fake_prisma_client_module.db = fake_db
    monkeypatch.setitem(sys.modules, "prisma_db.prisma_client", fake_prisma_client_module)

    import src_api.endpoints.auth as auth_endpoint

    return importlib.reload(auth_endpoint)


@pytest.mark.asyncio
async def test_change_password_rejects_incorrect_old_password(
    monkeypatch: pytest.MonkeyPatch,
    security_module: Any,
) -> None:
    async def fail_update(*args: Any, **kwargs: Any) -> None:
        raise AssertionError("password update should not run when old password is invalid")

    fake_account: SimpleNamespace = SimpleNamespace(update=fail_update)
    fake_client: SimpleNamespace = SimpleNamespace(account=fake_account)
    fake_db: SimpleNamespace = SimpleNamespace(client=fake_client)
    auth_endpoint: Any = import_auth_endpoint_with_fake_db(monkeypatch, fake_db)
    auth_endpoint.auth = security_module.SecurityEngine()
    current_user: SimpleNamespace = SimpleNamespace(
        id="acct_123",
        hashed_password=auth_endpoint.auth.get_password_hash("actual-old-password"),
    )
    payload: ChangePasswordRequest = ChangePasswordRequest(
        old_password="wrong-old-password",
        new_password="new-secure-password",
    )

    with pytest.raises(HTTPException) as exc_info:
        await auth_endpoint.change_password(payload=payload, current_user=current_user)

    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert exc_info.value.detail == "Incorrect password"


@pytest.mark.asyncio
async def test_change_password_updates_hash_and_revokes_existing_tokens(
    monkeypatch: pytest.MonkeyPatch,
    security_module: Any,
) -> None:
    update_calls: list[dict[str, Any]] = []

    async def record_update(**kwargs: Any) -> None:
        update_calls.append(kwargs)

    fake_account: SimpleNamespace = SimpleNamespace(update=record_update)
    fake_client: SimpleNamespace = SimpleNamespace(account=fake_account)
    fake_db: SimpleNamespace = SimpleNamespace(client=fake_client)
    auth_endpoint: Any = import_auth_endpoint_with_fake_db(monkeypatch, fake_db)
    auth_endpoint.auth = security_module.SecurityEngine()
    current_user: SimpleNamespace = SimpleNamespace(
        id="acct_123",
        hashed_password=auth_endpoint.auth.get_password_hash("actual-old-password"),
    )
    payload: ChangePasswordRequest = ChangePasswordRequest(
        old_password="actual-old-password",
        new_password="new-secure-password",
    )

    response: dict[str, Any] = await auth_endpoint.change_password(
        payload=payload,
        current_user=current_user,
    )

    assert response == {"status": 200, "message": "success"}
    assert len(update_calls) == 1
    assert update_calls[0]["where"] == {"id": "acct_123"}
    assert update_calls[0]["data"]["token_version"] == {"increment": 1}
    assert auth_endpoint.auth.verify_password(
        "new-secure-password",
        update_calls[0]["data"]["hashed_password"],
    )
