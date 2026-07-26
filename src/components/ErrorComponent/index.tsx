import { useState } from "react";

// Type definitions for error detection
type ErrorType = "AXIOS" | "FETCH" | "NETWORK" | "API" | "RUNTIME" | "UNKNOWN";

interface ParsedError {
  type: ErrorType;
  message: string;
  statusCode?: string;
  stack?: string;
  request?: {
    url?: string;
    method?: string;
    baseURL?: string;
  };
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
    headers?: any;
  };
  timestamp: string;
}

/**
 * Deteksi tipe error berdasarkan struktur object error
 */
const detectErrorType = (error: any): ErrorType => {
  // Axios error detection
  if (error?.isAxiosError || error?.config) {
    return "AXIOS";
  }

  // Fetch API error detection
  if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
    return "FETCH";
  }

  // Network error detection
  const networkKeywords = [
    "network",
    "connection",
    "offline",
    "net::",
    "failed to fetch",
  ];
  if (
    networkKeywords.some((keyword) =>
      error?.message?.toLowerCase()?.includes(keyword),
    )
  ) {
    return "NETWORK";
  }

  // API/HTTP error detection (has response with status)
  if (error?.response?.status || error?.status) {
    return "API";
  }

  // Runtime error (standard JavaScript error)
  if (error?.name && error?.message && error?.stack) {
    return "RUNTIME";
  }

  return "UNKNOWN";
};

/**
 * Parse error object menjadi structured data
 */
const parseError = (error: any): ParsedError => {
  const type = detectErrorType(error);

  return {
    type,
    message: error?.message || "Unknown error",
    statusCode: String(
      error?.status || error?.response?.status || error?.statusCode || "500",
    ),
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    request:
      error?.config || error?.request
        ? {
            url:
              error?.config?.url ||
              error?.request?.responseURL ||
              error?.request?.url,
            method: error?.config?.method || error?.request?.method,
            baseURL: error?.config?.baseURL,
          }
        : undefined,
    response: error?.response
      ? {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        }
      : undefined,
  };
};

/**
 * Badge component untuk error type
 */
const ErrorTypeBadge = ({ type }: { type: ErrorType }) => {
  const colors = {
    AXIOS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    FETCH: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    NETWORK: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    API: "bg-red-500/10 text-red-500 border-red-500/20",
    RUNTIME: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    UNKNOWN: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${colors[type]}`}
    >
      {type} Error
    </span>
  );
};

/**
 * Section component dengan copy button
 */
const ErrorSection = ({
  title,
  children,
  value,
}: {
  title: string;
  children: React.ReactNode;
  value?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-divider rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between px-4 py-2 bg-bg-paper border-b border-divider">
        <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          {title}
        </h4>
        {value && (
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary bg-divider/50 hover:bg-divider rounded transition-all"
          >
            {copied ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-3.5 h-3.5 text-success-main"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
      <div className="p-4 bg-bg-default">{children}</div>
    </div>
  );
};

/**
 * JSON display component dengan formatting
 */
const JsonBlock = ({ data }: { data: any }) => {
  if (!data) return null;

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <pre className="text-xs font-mono text-text-primary whitespace-pre-wrap break-all">
      {jsonString}
    </pre>
  );
};

/**
 * Main DetailError component
 */
export default function DetailError({ error }: { error: any }) {
  const parsedError = parseError(error);
  const isDevelopment = import.meta.env.DEV;

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="w-full mt-8 max-w-4xl mx-auto">
      {/* Header dengan badges */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <ErrorTypeBadge type={parsedError.type} />
        {parsedError.statusCode && (
          <span className="inline-block px-3 py-1 text-xs font-bold text-error-main bg-error-main/10 border border-error-main/20 rounded-full">
            HTTP {parsedError.statusCode}
          </span>
        )}
        <span className="inline-block px-3 py-1 text-xs font-mono text-text-secondary bg-bg-paper border border-divider rounded-full">
          {parsedError.timestamp}
        </span>
      </div>

      {/* Error Message */}
      <ErrorSection title="Error Message" value={parsedError.message}>
        <p className="text-sm font-medium text-error-main">
          {parsedError.message}
        </p>
      </ErrorSection>

      {/* Stack Trace */}
      {parsedError.stack && (
        <ErrorSection title="Stack Trace" value={parsedError.stack}>
          <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
            {parsedError.stack}
          </pre>
        </ErrorSection>
      )}

      {/* Request Details */}
      {parsedError.request && (
        <ErrorSection
          title="Request Details"
          value={JSON.stringify(parsedError.request, null, 2)}
        >
          <div className="grid grid-cols-1 gap-3 text-xs">
            {parsedError.request.method && (
              <div>
                <span className="text-text-secondary font-medium">Method:</span>
                <span className="ml-2 px-2 py-0.5 bg-primary-main/10 text-primary-main rounded font-mono">
                  {parsedError.request.method}
                </span>
              </div>
            )}
            {parsedError.request.url && (
              <div>
                <span className="text-text-secondary font-medium">URL:</span>
                <p className="mt-1 font-mono text-text-primary break-all bg-bg-paper px-3 py-2 rounded border border-divider">
                  {parsedError.request.url}
                </p>
              </div>
            )}
            {parsedError.request.baseURL && (
              <div>
                <span className="text-text-secondary font-medium">
                  Base URL:
                </span>
                <p className="mt-1 font-mono text-text-primary break-all bg-bg-paper px-3 py-2 rounded border border-divider">
                  {parsedError.request.baseURL}
                </p>
              </div>
            )}
          </div>
        </ErrorSection>
      )}

      {/* Response Details */}
      {parsedError.response && (
        <ErrorSection
          title="Response Details"
          value={JSON.stringify(parsedError.response, null, 2)}
        >
          <div className="space-y-4">
            {parsedError.response.status && (
              <div className="flex items-center gap-3">
                <span className="text-text-secondary text-xs font-medium">
                  Status:
                </span>
                <span
                  className={`px-2 py-1 text-xs font-bold rounded ${
                    parsedError.response.status >= 500
                      ? "bg-error-main/10 text-error-main"
                      : parsedError.response.status >= 400
                        ? "bg-warning-main/10 text-warning-main"
                        : "bg-success-main/10 text-success-main"
                  }`}
                >
                  {parsedError.response.status}{" "}
                  {parsedError.response.statusText}
                </span>
              </div>
            )}
            {parsedError.response.data && (
              <div>
                <span className="text-text-secondary text-xs font-medium block mb-2">
                  Response Data:
                </span>
                <div className="bg-bg-paper border border-divider rounded-lg p-3 max-h-48 overflow-y-auto">
                  <JsonBlock data={parsedError.response.data} />
                </div>
              </div>
            )}
          </div>
        </ErrorSection>
      )}
    </div>
  );
}
