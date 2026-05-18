import Constants from 'expo-constants';

// Centralized config for the Gemini backend URL.
//
// Priority order:
//   1. app.json > expo.extra.GEMINI_BASE_URL  (hard override, useful for production)
//   2. GEMINI_BASE_URL env var
//   3. Auto-detect from Expo's hostUri — extracts the dev-machine IP that Expo
//      already uses to serve the JS bundle, then replaces the Metro port with 3000.
//      This makes physical devices and emulators work without ngrok: they reach
//      the backend at the same IP Metro is reachable on (e.g. 192.168.1.5:3000).
//   4. Fallback to localhost:3000 (web browser / iOS Simulator)

function autoDetectUrl(backendPort = 3000): string {
  // hostUri looks like "192.168.1.5:8081" on device/emulator,
  // or "localhost:8081" in iOS Simulator / web.
  const hostUri: string | undefined =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.manifest2 as any)?.launchAsset?.url || // SDK 46+
    (Constants.manifest as any)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0]; // strip the Metro port
    return `http://${host}:${backendPort}`;
  }
  return `http://localhost:${backendPort}`;
}

const extras =
  (Constants.manifest && (Constants.manifest as any).extra) ||
  (Constants.expoConfig && (Constants.expoConfig as any).extra);

export const GEMINI_BASE_URL: string =
  (extras?.GEMINI_BASE_URL as string | undefined) ||
  process.env.GEMINI_BASE_URL ||
  autoDetectUrl(3000);

export default GEMINI_BASE_URL;
