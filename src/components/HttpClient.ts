type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  body?: any;
}

type RequestInterceptor = (options: RequestOptions) => Promise<RequestOptions>;

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private interceptor?: RequestInterceptor;

  constructor(
    baseURL: string,
    defaultHeaders: Record<string, string> = {},
    interceptor?: RequestInterceptor
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.interceptor = interceptor;
  }

  private buildUrl(url: string, params?: Record<string, string | number>) {
    if (!params) return url;
    const query = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    );
    return `${url}?${query.toString()}`;
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    if (this.interceptor) {
      options = await this.interceptor(options);
    }

    const normalizedBaseUrl = this.baseURL.endsWith("/")
      ? this.baseURL
      : this.baseURL
      ? `${this.baseURL}/`
      : "";
    const fullUrl = normalizedBaseUrl + this.buildUrl(url, options.params);

    const res = await fetch(fullUrl, {
      method,
      headers: { ...this.defaultHeaders, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => null);

    // Convert headers to simple object
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      data: data as T,
      status: res.status,
      headers,
    };
  }

  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>("GET", url, options);
  }

  post<T>(url: string, body?: any, options?: RequestOptions) {
    return this.request<T>("POST", url, { ...options, body });
  }

  put<T>(url: string, body?: any, options?: RequestOptions) {
    return this.request<T>("PUT", url, { ...options, body });
  }

  patch<T>(url: string, body?: any, options?: RequestOptions) {
    return this.request<T>("PATCH", url, { ...options, body });
  }

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>("DELETE", url, options);
  }
}

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

const axios = new HttpClient("", {
  "Content-Type": "application/json",
  Accept: "application/json",
});
export { axios };
