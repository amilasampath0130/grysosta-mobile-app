import Constants from 'expo-constants';

const DEFAULT_API_URL = 'https://grysosta-backend.onrender.com/api';
const DEFAULT_PORT = 5000;

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const ensureApiSuffix = (baseUrl: string) => {
  const normalized = stripTrailingSlashes(baseUrl.trim());
  if (!normalized) return normalized;
  return /\/api$/i.test(normalized) ? normalized : `${normalized}/api`;
};

const extractHostIp = (hostUri: unknown): string | null => {
  if (typeof hostUri !== 'string') return null;
  const withoutProtocol = hostUri.replace(/^https?:\/\//i, '');
  const host = withoutProtocol.split('/')[0] ?? '';
  const ipOrHost = host.split(':')[0] ?? '';
  return ipOrHost.trim().length > 0 ? ipOrHost.trim() : null;
};

const getExpoDevHostIp = (): string | null => {
  // Expo has changed where host info lives across SDKs / build types.
  // We intentionally probe a few likely locations.
  const anyConstants = Constants as any;

  const candidates = [
    anyConstants?.expoConfig?.hostUri,
    anyConstants?.expoConfig?.debuggerHost,
    anyConstants?.manifest?.hostUri,
    anyConstants?.manifest?.debuggerHost,
    anyConstants?.manifest2?.extra?.expoClient?.hostUri,
    anyConstants?.manifest2?.extra?.expoClient?.debuggerHost,
  ];

  for (const candidate of candidates) {
    const ip = extractHostIp(candidate);
    if (ip) return ip;
  }

  return null;
};

/**
 * Resolves the base API URL that includes `/api`.
 *
 * Priority:
 * 1) `process.env.EXPO_PUBLIC_API_URL`
 * 2) Expo dev host IP (same machine running Metro) + `:${DEFAULT_PORT}/api` when local API is explicitly enabled
 * 3) Hosted Render backend
 */
export const getApiBaseUrl = (): string => {
  const envValue = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envValue) {
    return ensureApiSuffix(envValue);
  }

  if (process.env.EXPO_PUBLIC_USE_LOCAL_API === 'true') {
    const devHostIp = getExpoDevHostIp();
    if (devHostIp) {
      return `http://${devHostIp}:${DEFAULT_PORT}/api`;
    }
  }

  return DEFAULT_API_URL;
};
