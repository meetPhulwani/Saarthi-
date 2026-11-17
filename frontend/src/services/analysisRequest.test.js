import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYSIS_MAX_ATTEMPTS,
  AnalysisRequestError,
  requestNoticeAnalysis,
} from "./analysisRequest.js";

function response(status, data = {}, headers = {}) {
  const normalizedHeaders = new Map(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value])
  );
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) {
        return normalizedHeaders.get(name.toLowerCase()) ?? null;
      },
    },
    async json() {
      return data;
    },
  };
}

const successfulAnalysis = {
  summary: "Grounded summary.",
  key_points: ["First.", "Second.", "Third."],
  important_dates: [],
  action_items: [],
};

test("retries a marked 503 once and returns a later successful analysis", async () => {
  let calls = 0;
  const retryStates = [];
  const delays = [];
  const result = await requestNoticeAnalysis({
    url: "/analyze",
    extractedText: "Notice text",
    language: "english",
    fetchImpl: async (_url, init) => {
      calls += 1;
      assert.deepEqual(JSON.parse(init.body), {
        extracted_text: "Notice text",
        language: "english",
      });
      return calls === 1
        ? response(
            503,
            { detail: "Gemini is temporarily unavailable." },
            { "X-Notiva-Retryable": "true" }
          )
        : response(200, successfulAnalysis);
    },
    sleep: async (delay) => delays.push(delay),
    random: () => 0.5,
    onRetry: (state) => retryStates.push(state),
    now: () => 0,
  });

  assert.deepEqual(result, successfulAnalysis);
  assert.equal(calls, 2);
  assert.deepEqual(delays, [500]);
  assert.deepEqual(retryStates, [{ nextAttempt: 2, totalAttempts: 3 }]);
});

test("reads and parses a successful response body before the attempt timeout", async () => {
  const result = await requestNoticeAnalysis({
    url: "/analyze",
    extractedText: "Notice text",
    language: "english",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      async text() {
        return JSON.stringify(successfulAnalysis);
      },
    }),
    now: () => 0,
  });

  assert.deepEqual(result, successfulAnalysis);
});

test("exhausts exactly two automatic retries and returns the safe provider error", async () => {
  let calls = 0;
  const retryStates = [];
  await assert.rejects(
    requestNoticeAnalysis({
      url: "/analyze",
      extractedText: "Notice text",
      language: "english",
      fetchImpl: async () => {
        calls += 1;
        return response(
          503,
          { detail: "Gemini is temporarily unavailable. Please try again later." },
          { "X-Notiva-Retryable": "true" }
        );
      },
      sleep: async () => {},
      random: () => 0.5,
      onRetry: (state) => retryStates.push(state),
      now: () => 0,
    }),
    (error) =>
      error instanceof AnalysisRequestError &&
      error.status === 503 &&
      error.message.includes("temporarily unavailable")
  );

  assert.equal(calls, ANALYSIS_MAX_ATTEMPTS);
  assert.deepEqual(
    retryStates.map(({ nextAttempt }) => nextAttempt),
    [2, 3]
  );
});

test("does not retry authentication, bad request, or quota errors without Retry-After", async () => {
  for (const [status, detail] of [
    [400, "Invalid request."],
    [401, "Authentication failed."],
    [429, "Quota reached."],
  ]) {
    let calls = 0;
    await assert.rejects(
      requestNoticeAnalysis({
        url: "/analyze",
        extractedText: "Notice text",
        language: "english",
        fetchImpl: async () => {
          calls += 1;
          return response(
            status,
            { detail },
            { "X-Notiva-Retryable": "true" }
          );
        },
        sleep: async () => {},
        now: () => 0,
      }),
      (error) => error.status === status
    );
    assert.equal(calls, 1, `status ${status} should not retry`);
  }
});

test("honors Retry-After for an explicitly retryable quota response", async () => {
  let calls = 0;
  const delays = [];
  const result = await requestNoticeAnalysis({
    url: "/analyze",
    extractedText: "Notice text",
    language: "hindi",
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? response(
            429,
            { detail: "Quota is temporarily exhausted." },
            { "X-Notiva-Retryable": "true", "Retry-After": "2" }
          )
        : response(200, successfulAnalysis);
    },
    sleep: async (delay) => delays.push(delay),
    random: () => 0.5,
    now: () => 0,
  });

  assert.deepEqual(result, successfulAnalysis);
  assert.equal(calls, 2);
  assert.deepEqual(delays, [2000]);
});

test("retries marked provider network errors but avoids uncertain client-side duplicates", async () => {
  let networkCalls = 0;
  const networkResult = await requestNoticeAnalysis({
    url: "/analyze",
    extractedText: "Notice text",
    language: "marathi",
    fetchImpl: async () => {
      networkCalls += 1;
      return networkCalls === 1
        ? response(
            502,
            { detail: "Could not connect to Gemini. Check your network connection." },
            { "X-Notiva-Retryable": "true" }
          )
        : response(200, successfulAnalysis);
    },
    sleep: async () => {},
    random: () => 0.5,
    now: () => 0,
  });
  assert.deepEqual(networkResult, successfulAnalysis);
  assert.equal(networkCalls, 2);

  let clientNetworkCalls = 0;
  await assert.rejects(
    requestNoticeAnalysis({
      url: "/analyze",
      extractedText: "Notice text",
      language: "marathi",
      fetchImpl: async () => {
        clientNetworkCalls += 1;
        throw new TypeError("Failed to fetch");
      },
      sleep: async () => {},
      now: () => 0,
    }),
    (error) =>
      error instanceof AnalysisRequestError &&
      error.kind === "network" &&
      error.message.includes("Saarthi backend")
  );
  assert.equal(clientNetworkCalls, 1);
});

test("respects the total time budget while retrying", async () => {
  let budgetCalls = 0;
  await assert.rejects(
    requestNoticeAnalysis({
      url: "/analyze",
      extractedText: "Notice text",
      language: "english",
      fetchImpl: async () => {
        budgetCalls += 1;
        return response(
          503,
          { detail: "Gemini is temporarily unavailable." },
          { "X-Notiva-Retryable": "true", "Retry-After": "2" }
        );
      },
      sleep: async () => {},
      now: () => 0,
      totalBudgetMs: 1000,
    }),
    (error) => error.status === 503
  );
  assert.equal(budgetCalls, 1);
});

test("attempt timeouts are bounded and cancel cleanly when the caller aborts", async () => {
  let timeoutCalls = 0;
  await assert.rejects(
    requestNoticeAnalysis({
      url: "/analyze",
      extractedText: "Notice text",
      language: "english",
      fetchImpl: (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          timeoutCalls += 1;
          signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
      sleep: async () => {},
      random: () => 0.5,
      totalBudgetMs: 5000,
      attemptTimeoutMs: 5,
    }),
    (error) =>
      error instanceof AnalysisRequestError &&
      error.kind === "timeout" &&
      error.message.includes("3 attempts")
  );
  assert.equal(timeoutCalls, ANALYSIS_MAX_ATTEMPTS);

  let responseBodyTimeoutCalls = 0;
  await assert.rejects(
    requestNoticeAnalysis({
      url: "/analyze",
      extractedText: "Notice text",
      language: "english",
      fetchImpl: (_url, { signal }) => ({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: () =>
          new Promise((_resolve, reject) => {
            responseBodyTimeoutCalls += 1;
            signal.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          }),
      }),
      sleep: async () => {},
      random: () => 0.5,
      totalBudgetMs: 5000,
      attemptTimeoutMs: 5,
    }),
    (error) =>
      error instanceof AnalysisRequestError &&
      error.kind === "timeout" &&
      error.message.includes("3 attempts")
  );
  assert.equal(responseBodyTimeoutCalls, ANALYSIS_MAX_ATTEMPTS);

  const controller = new AbortController();
  let started;
  const fetchStarted = new Promise((resolve) => {
    started = resolve;
  });
  const pending = requestNoticeAnalysis({
    url: "/analyze",
    extractedText: "Notice text",
    language: "english",
    signal: controller.signal,
    fetchImpl: (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        started();
        signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      }),
  });
  await fetchStarted;
  controller.abort();
  await assert.rejects(pending, (error) => error.name === "AbortError");
});
