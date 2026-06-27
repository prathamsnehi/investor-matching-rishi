import Constants from "expo-constants";

/**
 * Base URL for the Fundmatch backend API (see docs/api_schemas.md).
 *
 * Defaults to localhost, which works as-is on the iOS Simulator (it shares the
 * host machine's network). For other targets, override via app.json
 * `extra.apiBaseUrl` or change the default below:
 *   - Physical iPhone (dev client): use your Mac's LAN IP, e.g.
 *       http://192.168.1.50:8000/api/v1   (phone + Mac on the same Wi-Fi)
 *   - Android emulator: http://10.0.2.2:8000/api/v1
 *
 * Run the backend locally with: `cd backend && docker compose up`.
 */
const DEFAULT_API_BASE_URL = "http://localhost:8000/api/v1";

const overrideFromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)
  ?.apiBaseUrl;

export const API_BASE_URL = overrideFromExtra || DEFAULT_API_BASE_URL;
