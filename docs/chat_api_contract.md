# Fundmatch Chat Service API Contract

## Base URL

- HTTP: `http://<your-domain>:8008`
- WebSocket: `ws://<your-domain>:8008`

## Authentication

Authentication uses JSON Web Tokens (JWT).

- HTTP requests use standard Bearer headers.
- WebSocket connections require the token in the URL query string because browser WebSockets do not support custom authorization headers.

---

## 1. Real-Time Chat (WebSocket)

Establishes a persistent, two-way real-time communication channel between the user and the server for a specific conversation.

### Endpoint

`WS /chat/{conversation_id}`

### Connection Parameters

| Type | Name | Data Type | Required | Description |
| --- | --- | --- | --- | --- |
| Path | `conversation_id` | UUID | Yes | The unique ID of the matched conversation. |
| Query | `token` | String | Yes | The user's active JWT. Standard headers are not supported by browser WebSockets. Example: `ws://.../chat/123?token=eyJhbG...` |

### Connection Handshake Behaviors

#### Success

The connection upgrades to `101 Switching Protocols`.

#### Failure: `1008 Policy Violation`

The socket immediately closes with code `1008` if:

- The token is missing, expired, or invalid.
- The user does not exist in the database.
- The user has not completed their onboarding profiles, such as Founder or Investor.

### Message Payload: Client to Server

When sending a message to the chat, the frontend must emit a JSON string with the following structure.

The frontend must generate the message `id` as a UUIDv4 so it can optimistically render the message on screen without waiting for a server round trip.

```JSON
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hey Rishi, loved the pitch deck. Are you open to a call?",
  "recipientId": "investor_account_uuid_here",
  "createdAt": "2026-06-30T14:21:00Z"
}
```

### Message Payload: Server to Client

When the server broadcasts an incoming message to a connected client, it enriches the payload with the sender's verified identity and the conversation ID.

```JSON
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "conversationId": "matched_conversation_uuid_here",
  "senderId": "founder_account_uuid_here",
  "content": "Hey Rishi, loved the pitch deck. Are you open to a call?",
  "createdAt": "2026-06-30T14:21:00Z"
}
```

---

## 2. Retrieve Chat History (HTTP GET)

Fetches the chronological message history for a conversation.

This hybrid endpoint automatically merges unsaved "hot" messages from the Redis buffer with "cold" historical messages from PostgreSQL.

### Endpoint

`GET /chat/{conversation_id}/history`

### Request Parameters

| Type | Name | Data Type | Required | Default | Description |
| --- | --- | --- | --- | --- | --- |
| Header | `Authorization` | String | Yes | N/A | Format: `Bearer <JWT_TOKEN>` |
| Path | `conversation_id` | UUID | Yes | N/A | The unique ID of the conversation. |
| Query | `limit` | Integer | No | `50` | The maximum number of historical messages to return. |

### Responses

#### `200 OK`

Returns an array of message objects sorted chronologically from oldest to newest, so the frontend can map them directly top-to-bottom on the UI.

```JSON
{
  "conversation_id": "matched_conversation_uuid_here",
  "messages": [
    {
      "id": "b3f2e1a0-7c9d-482f-9b1a-2e4d6f8a9c01",
      "conversationId": "matched_conversation_uuid_here",
      "senderId": "founder_account_uuid_here",
      "content": "Hi, thanks for matching!",
      "createdAt": "2026-06-30T14:15:00Z"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "conversationId": "matched_conversation_uuid_here",
      "senderId": "investor_account_uuid_here",
      "content": "Hey, loved the pitch deck. Are you open to a call?",
      "createdAt": "2026-06-30T14:21:00Z"
    }
  ]
}
```

#### `403 Forbidden`

Returned if the authenticated user requesting the history is not a participant, Founder or Investor, belonging to this specific conversation.

```JSON
{
  "detail": "Not authorized to view this chat"
}
```

#### `404 Not Found`

Returned if the `conversation_id` does not exist in the database.

```JSON
{
  "detail": "Conversation not found"
}
```

---

## 3. Health Check (HTTP GET)

Used by Docker health checks and external monitors to ensure the chat service and its dependencies are responsive.

### Endpoint

`GET /ping`

### Responses

#### `200 OK`

```JSON
{
  "status": "ok",
  "redis_ping": true
}
```
