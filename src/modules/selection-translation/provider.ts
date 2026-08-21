const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const REQUEST_TIMEOUT_MS = 30000;
const ERROR_BODY_SUMMARY_LIMIT = 500;

export const DEFAULT_SELECTION_TRANSLATION_MODEL = "deepseek-v4-flash";
const FORBIDDEN_SELECTION_TRANSLATION_MODELS = new Set(["deepseek-reasoner"]);
export const DEFAULT_SELECTION_TRANSLATION_THINKING_MODE = "disabled";
const SELECTION_TRANSLATION_THINKING_MODES = new Set([
  "disabled",
  "high",
  "max",
]);

export type SelectionTranslationThinkingMode = "disabled" | "high" | "max";

export type SelectionTranslationErrorCode =
  | "auth"
  | "rate-limit"
  | "bad-request"
  | "server"
  | "network"
  | "timeout"
  | "empty"
  | "malformed";

export type SelectionTranslationProviderResult =
  | { ok: true; translation: string }
  | { ok: false; code: SelectionTranslationErrorCode };

export type SelectionTranslationApiLogEntry = {
  timestamp: number;
  phase:
    | "request-created"
    | "fetch-start"
    | "response-status"
    | "response-error-body"
    | "parse-start"
    | "parse-success"
    | "parse-error"
    | "success"
    | "timeout"
    | "network";
  model?: string;
  thinkingMode?: SelectionTranslationThinkingMode;
  targetLanguage?: string;
  selectedTextLength?: number;
  url?: string;
  request?: {
    stream: boolean;
    responseFormat: string;
    thinkingType: "disabled" | "enabled";
    reasoningEffort?: SelectionTranslationThinkingMode;
    messageCount: number;
  };
  status?: number;
  statusText?: string;
  elapsedMs?: number;
  errorCode?: SelectionTranslationErrorCode;
  summary?: string;
};

type DeepSeekMessage = {
  content?: unknown;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: DeepSeekMessage;
  }>;
};

export function normalizeSelectionTranslationModel(model: unknown): string {
  if (typeof model !== "string") {
    return DEFAULT_SELECTION_TRANSLATION_MODEL;
  }
  const trimmed = model.trim();
  if (!trimmed) {
    return DEFAULT_SELECTION_TRANSLATION_MODEL;
  }
  if (FORBIDDEN_SELECTION_TRANSLATION_MODELS.has(trimmed.toLowerCase())) {
    return DEFAULT_SELECTION_TRANSLATION_MODEL;
  }
  return trimmed;
}

export function normalizeSelectionTranslationThinkingMode(
  thinkingMode: unknown,
): SelectionTranslationThinkingMode {
  if (typeof thinkingMode !== "string") {
    return DEFAULT_SELECTION_TRANSLATION_THINKING_MODE;
  }
  const normalized = thinkingMode.trim().toLowerCase();
  return SELECTION_TRANSLATION_THINKING_MODES.has(normalized)
    ? (normalized as SelectionTranslationThinkingMode)
    : DEFAULT_SELECTION_TRANSLATION_THINKING_MODE;
}

export async function requestDeepSeekSelectionTranslation(options: {
  apiKey: string;
  text: string;
  targetLanguage: string;
  model: string;
  thinkingMode: SelectionTranslationThinkingMode;
  onLog?: (entry: SelectionTranslationApiLogEntry) => void;
}): Promise<SelectionTranslationProviderResult> {
  const controller = createAbortController();
  let timedOut = false;
  let timeoutID: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutID = setTimeout(() => {
      timedOut = true;
      controller?.abort();
      reject(new Error("timeout"));
    }, REQUEST_TIMEOUT_MS);
  });
  const complete = <T extends SelectionTranslationProviderResult>(
    result: T,
  ): T => {
    if (timeoutID !== undefined) {
      clearTimeout(timeoutID);
    }
    return result;
  };
  const startedAt = Date.now();
  const thinkingMode = normalizeSelectionTranslationThinkingMode(
    options.thinkingMode,
  );
  const model = normalizeSelectionTranslationModel(options.model);
  const thinkingType: "disabled" | "enabled" =
    thinkingMode === "disabled" ? "disabled" : "enabled";
  const requestBody = {
    model,
    stream: false,
    response_format: { type: "json_object" },
    thinking: {
      type: thinkingType,
    },
    ...(thinkingMode === "disabled" ? {} : { reasoning_effort: thinkingMode }),
    messages: [
      {
        role: "system",
        content:
          "Translate the user text into the requested target language. Return only a compact JSON object with a string field named translation.",
      },
      {
        role: "user",
        content: JSON.stringify({
          targetLanguage: options.targetLanguage,
          text: options.text,
        }),
      },
    ],
  };
  const requestLogContext = {
    model,
    thinkingMode,
    targetLanguage: options.targetLanguage,
    selectedTextLength: options.text.length,
    url: getSafeUrl(DEEPSEEK_API_URL),
  };

  options.onLog?.({
    timestamp: Date.now(),
    phase: "request-created",
    ...requestLogContext,
    request: {
      stream: requestBody.stream,
      responseFormat: requestBody.response_format.type,
      thinkingType: requestBody.thinking.type,
      ...(thinkingMode === "disabled" ? {} : { reasoningEffort: thinkingMode }),
      messageCount: requestBody.messages.length,
    },
  });

  let response: Response;
  try {
    options.onLog?.({
      timestamp: Date.now(),
      phase: "fetch-start",
      ...requestLogContext,
    });
    const requestInit: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      ...(controller ? { signal: controller.signal } : {}),
    };
    response = await Promise.race([
      fetch(DEEPSEEK_API_URL, requestInit),
      timeoutPromise,
    ]);
  } catch (error) {
    if (timedOut || isAbortError(error)) {
      options.onLog?.({
        timestamp: Date.now(),
        phase: "timeout",
        ...requestLogContext,
        elapsedMs: Date.now() - startedAt,
        errorCode: "timeout",
      });
      return complete({ ok: false, code: "timeout" });
    }
    options.onLog?.({
      timestamp: Date.now(),
      phase: "network",
      ...requestLogContext,
      elapsedMs: Date.now() - startedAt,
      errorCode: "network",
      summary: sanitizeErrorSummary(error),
    });
    return complete({ ok: false, code: "network" });
  }

  options.onLog?.({
    timestamp: Date.now(),
    phase: "response-status",
    ...requestLogContext,
    status: response.status,
    statusText: response.statusText,
    elapsedMs: Date.now() - startedAt,
  });

  if (response.status === 401 || response.status === 403) {
    const logResult = await logErrorBody(
      response,
      options.onLog,
      requestLogContext,
      startedAt,
      "auth",
      options.text,
      timeoutPromise,
      () => timedOut,
    );
    if (logResult === "timeout") {
      return complete({ ok: false, code: "timeout" });
    }
    return complete({ ok: false, code: "auth" });
  }
  if (response.status === 429) {
    const logResult = await logErrorBody(
      response,
      options.onLog,
      requestLogContext,
      startedAt,
      "rate-limit",
      options.text,
      timeoutPromise,
      () => timedOut,
    );
    if (logResult === "timeout") {
      return complete({ ok: false, code: "timeout" });
    }
    return complete({ ok: false, code: "rate-limit" });
  }
  if (response.status >= 400 && response.status < 500) {
    const logResult = await logErrorBody(
      response,
      options.onLog,
      requestLogContext,
      startedAt,
      "bad-request",
      options.text,
      timeoutPromise,
      () => timedOut,
    );
    if (logResult === "timeout") {
      return complete({ ok: false, code: "timeout" });
    }
    return complete({ ok: false, code: "bad-request" });
  }
  if (!response.ok) {
    const logResult = await logErrorBody(
      response,
      options.onLog,
      requestLogContext,
      startedAt,
      "server",
      options.text,
      timeoutPromise,
      () => timedOut,
    );
    if (logResult === "timeout") {
      return complete({ ok: false, code: "timeout" });
    }
    return complete({ ok: false, code: "server" });
  }

  let data: DeepSeekResponse;
  try {
    options.onLog?.({
      timestamp: Date.now(),
      phase: "parse-start",
      ...requestLogContext,
      elapsedMs: Date.now() - startedAt,
    });
    data = (await Promise.race([
      response.json() as Promise<DeepSeekResponse>,
      timeoutPromise,
    ])) as DeepSeekResponse;
  } catch (error) {
    const code: SelectionTranslationErrorCode = isProviderTimeoutError(
      error,
      timedOut,
    )
      ? "timeout"
      : "malformed";
    options.onLog?.({
      timestamp: Date.now(),
      phase: code === "timeout" ? "timeout" : "parse-error",
      ...requestLogContext,
      elapsedMs: Date.now() - startedAt,
      errorCode: code,
    });
    return complete({ ok: false, code });
  }

  options.onLog?.({
    timestamp: Date.now(),
    phase: "parse-success",
    ...requestLogContext,
    elapsedMs: Date.now() - startedAt,
  });

  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    options.onLog?.({
      timestamp: Date.now(),
      phase: "parse-error",
      ...requestLogContext,
      elapsedMs: Date.now() - startedAt,
      errorCode: "empty",
    });
    return complete({ ok: false, code: "empty" });
  }

  const parsedTranslation = parseTranslationContent(content);
  if (!parsedTranslation.translation) {
    options.onLog?.({
      timestamp: Date.now(),
      phase: "parse-error",
      ...requestLogContext,
      elapsedMs: Date.now() - startedAt,
      errorCode: "malformed",
      summary: `parser=${parsedTranslation.parser} contentLength=${content.length}`,
    });
    return complete({ ok: false, code: "malformed" });
  }

  options.onLog?.({
    timestamp: Date.now(),
    phase: "success",
    ...requestLogContext,
    elapsedMs: Date.now() - startedAt,
    summary: `parser=${parsedTranslation.parser} contentLength=${content.length}`,
  });
  return complete({ ok: true, translation: parsedTranslation.translation });
}

async function logErrorBody(
  response: Response,
  onLog: ((entry: SelectionTranslationApiLogEntry) => void) | undefined,
  context: Pick<
    SelectionTranslationApiLogEntry,
    "model" | "thinkingMode" | "targetLanguage" | "selectedTextLength" | "url"
  >,
  startedAt: number,
  errorCode: SelectionTranslationErrorCode,
  selectedText: string,
  timeoutPromise: Promise<never>,
  isTimedOut: () => boolean,
): Promise<SelectionTranslationErrorCode | undefined> {
  if (!onLog) {
    return undefined;
  }
  let summary = "";
  try {
    summary = sanitizeErrorSummary(
      await Promise.race([response.text(), timeoutPromise]),
      selectedText,
    );
  } catch (error) {
    if (isProviderTimeoutError(error, isTimedOut())) {
      onLog({
        timestamp: Date.now(),
        phase: "timeout",
        ...context,
        status: response.status,
        statusText: response.statusText,
        elapsedMs: Date.now() - startedAt,
        errorCode: "timeout",
      });
      return "timeout";
    }
    summary = sanitizeErrorSummary(error);
  }
  onLog({
    timestamp: Date.now(),
    phase: "response-error-body",
    ...context,
    status: response.status,
    statusText: response.statusText,
    elapsedMs: Date.now() - startedAt,
    errorCode,
    summary,
  });
  return undefined;
}

function getSafeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname}`;
  } catch (_error) {
    return "api.deepseek.com/chat/completions";
  }
}

function createAbortController(): AbortController | undefined {
  if (typeof AbortController === "undefined") {
    return undefined;
  }
  return new AbortController();
}

function sanitizeErrorSummary(value: unknown, selectedText?: string): string {
  const text = extractErrorSummaryText(value, Boolean(selectedText));
  const withoutSelectedText = selectedText
    ? text.split(selectedText).join("[selected text redacted]")
    : text;
  return withoutSelectedText
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9._-]+/gi, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ERROR_BODY_SUMMARY_LIMIT);
}

function extractErrorSummaryText(value: unknown, hideRawBody: boolean): string {
  if (typeof value !== "string") {
    if (value instanceof Error) {
      return `${value.name || "Error"} messageLength=${value.message.length}`;
    }
    return `Non-Error thrown type=${typeof value}`;
  }
  try {
    const parsed = JSON.parse(value) as {
      error?: { code?: unknown; message?: unknown; type?: unknown };
      code?: unknown;
      message?: unknown;
      type?: unknown;
    };
    const error = parsed.error || parsed;
    const safeSummary = [
      typeof error.code === "string" ? `code=${error.code}` : "",
      typeof error.type === "string" ? `type=${error.type}` : "",
      typeof error.message === "string"
        ? `messageLength=${error.message.length}`
        : "",
    ]
      .filter(Boolean)
      .join(" | ");
    return safeSummary || "Provider error body redacted";
  } catch (_error) {
    return hideRawBody
      ? `Non-JSON error body (${value.length} chars)`
      : `String error (${value.length} chars)`;
  }
}

function parseTranslationContent(content: string): {
  translation: string;
  parser: "json" | "fenced-json" | "balanced-json" | "plain-text" | "none";
} {
  const trimmed = content.trim();
  const direct = parseTranslationJson(trimmed);
  if (direct) {
    return { translation: direct, parser: "json" };
  }

  const unfenced = stripJsonFence(trimmed);
  if (unfenced !== trimmed) {
    const fenced = parseTranslationJson(unfenced);
    if (fenced) {
      return { translation: fenced, parser: "fenced-json" };
    }
    return { translation: "", parser: "none" };
  }

  const balancedObject = extractFirstBalancedJsonObject(trimmed);
  if (balancedObject) {
    const balanced = parseTranslationJson(balancedObject);
    if (balanced) {
      return { translation: balanced, parser: "balanced-json" };
    }
    return { translation: "", parser: "none" };
  }

  if (isSafePlainTranslation(trimmed)) {
    return { translation: trimmed, parser: "plain-text" };
  }

  return { translation: "", parser: "none" };
}

function parseTranslationJson(content: string): string {
  try {
    const parsed = JSON.parse(content) as { translation?: unknown };
    return typeof parsed.translation === "string"
      ? parsed.translation.trim()
      : "";
  } catch (_error) {
    return "";
  }
}

function stripJsonFence(content: string): string {
  const match = content.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() || content;
}

function extractFirstBalancedJsonObject(content: string): string {
  const start = content.indexOf("{");
  if (start < 0) {
    return "";
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < content.length; index++) {
    const char = content[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth++;
      continue;
    }
    if (char === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(start, index + 1);
      }
    }
  }
  return "";
}

function isSafePlainTranslation(content: string): boolean {
  if (!content || content.length > 20000) {
    return false;
  }
  const lowered = content.slice(0, 200).toLowerCase();
  if (
    content.includes("```") ||
    lowered.includes("<html") ||
    lowered.includes("<!doctype") ||
    lowered.includes("</") ||
    /^\s*<[a-z][\s>]/i.test(content) ||
    lowered.includes('"error"') ||
    lowered.includes("rate_limit") ||
    lowered.includes("invalid_request") ||
    /^\s*(error|api error|unauthorized|forbidden|rate limit|invalid api key|invalid request)\b/i.test(
      content,
    )
  ) {
    return false;
  }
  if (content.startsWith("{") || content.startsWith("[")) {
    return false;
  }
  return true;
}

function isAbortError(error: unknown): boolean {
  return (
    typeof DOMException !== "undefined" &&
    error instanceof DOMException &&
    error.name === "AbortError"
  );
}

function isProviderTimeoutError(error: unknown, timedOut: boolean): boolean {
  return timedOut || isAbortError(error) || isTimeoutSignal(error);
}

function isTimeoutSignal(error: unknown): boolean {
  return error instanceof Error && error.message === "timeout";
}
