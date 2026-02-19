export type ApiErrorShape = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: RequestMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  retryOnUnauthorized?: boolean;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const params = new URLSearchParams();

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      params.set(key, String(value));
    }
  }

  const search = params.toString();
  return `/api/proxy${normalized}${search ? `?${search}` : ""}`;
}

function parseErrorMessage(data: ApiErrorShape | null, status: number) {
  if (!data) return `Error ${status}`;
  const msg = data.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.trim().length > 0) return msg;
  if (typeof data.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }
  return `Error ${status}`;
}

async function parseResponse<T>(resp: Response): Promise<T> {
  const contentType = resp.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const text = await resp.text();

  if (!resp.ok) {
    let data: ApiErrorShape | null = null;
    if (isJson && text) {
      try {
        data = JSON.parse(text) as ApiErrorShape;
      } catch {
        data = null;
      }
    }
    throw new ApiError(parseErrorMessage(data, resp.status), resp.status, data);
  }

  if (!text) return null as T;
  if (!isJson) {
    throw new ApiError(
      `Respuesta no esperada (${contentType || "sin content-type"})`,
      resp.status,
    );
  }
  return JSON.parse(text) as T;
}

async function tryRefreshToken() {
  const resp = await fetch("/api/auth/refresh", { method: "POST" });
  return resp.ok;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    query,
    body,
    headers,
    cache = "no-store",
    retryOnUnauthorized = true,
  } = options;

  const url = buildUrl(path, query);
  const resp = await fetch(url, {
    method,
    cache,
    headers: {
      accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (resp.status === 401 && retryOnUnauthorized) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  return parseResponse<T>(resp);
}
