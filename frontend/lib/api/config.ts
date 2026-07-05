const normalizeApiBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, "");

  if (!trimmed) {
    return "";
  }

  return trimmed.includes("/api/v1") ? trimmed : `${trimmed}/api/v1`;
};

export const getApiBaseUrl = () => {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configured) {
    return normalizeApiBaseUrl(configured);
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1`;
  }

  return "/api/v1";
};

export const getApiOrigin = () => {
  const baseUrl = getApiBaseUrl();
  return baseUrl.replace(/\/api\/v1\/?$/, "");
};

export const getStorageUrl = (filePath: string) => {
  const origin = getApiOrigin();
  if (!origin) {
    return `/storage/${filePath}`;
  }

  return `${origin}/storage/${filePath}`;
};
