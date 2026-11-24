import assert from "node:assert/strict";
import test from "node:test";
import {
  ANALYSIS_MAX_ATTEMPTS,
  requestNoticeAnalysis,
} from "./analysisRequest.js";
import {
  acquireNoticeWorkflow,
  extractNoticeText,
  NoticeExtractionError,
  runNoticeAnalysis,
} from "./noticeWorkflow.js";

const extraction = {
  text: "Notice text\nमराठी मजकूर — 20 November 2026",
  pageCount: 1,
  filename: "notice.pdf",
  extractionMethod: "text",
  ocrPages: [],
};
const analysis = {
  summary: "Grounded summary.",
  key_points: ["First point."],
  important_dates: [],
  action_items: ["Review the notice."],
};

test("duplicate click guard admits only one in-flight workflow", () => {
  const lock = { current: false };
  assert.equal(acquireNoticeWorkflow(lock), true);
  assert.equal(acquireNoticeWorkflow(lock), false);

  lock.current = false;
  assert.equal(acquireNoticeWorkflow(lock), true);
});

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

test("one run extracts a PDF or image before analyzing the exact returned text", async () => {
  for (const [file, method] of [
    [{ name: "notice.pdf", type: "application/pdf" }, "text"],
    [{ name: "notice.png", type: "image/png" }, "ocr"],
  ]) {
    const calls = [];
    const savedExtractions = [];
    const stages = [];
    const result = await runNoticeAnalysis({
      file,
      language: "marathi",
      extractUrl: "/extract?language=marathi",
      analyzeUrl: "/analyze",
      extract: async (request) => {
        calls.push(["extract", request.file, request.language]);
        return { ...extraction, extractionMethod: method };
      },
      analyze: async (request) => {
        calls.push(["analyze", request.extractedText, request.language]);
        return analysis;
      },
      onStage: (stage) => stages.push(stage),
      onExtracted: (result) => savedExtractions.push(result),
    });

    assert.deepEqual(calls, [
      ["extract", file, "marathi"],
      ["analyze", extraction.text, "marathi"],
    ]);
    assert.deepEqual(stages, ["extracting", "analyzing"]);
    assert.equal(savedExtractions[0].text, extraction.text);
    assert.equal(result.analysis, analysis);
  }
});

test("cached extraction is reused for a language change without another extract", async () => {
  let extractionCalls = 0;
  const analysisLanguages = [];
  await runNoticeAnalysis({
    file: { name: "notice.pdf", type: "application/pdf" },
    language: "hindi",
    existingExtraction: extraction,
    extract: async () => {
      extractionCalls += 1;
      return extraction;
    },
    analyze: async ({ extractedText, language }) => {
      assert.equal(extractedText, extraction.text);
      analysisLanguages.push(language);
      return analysis;
    },
  });

  assert.equal(extractionCalls, 0);
  assert.deepEqual(analysisLanguages, ["hindi"]);
});

test("empty or malformed extracted text never reaches analysis", async () => {
  for (const invalidExtraction of [
    { ...extraction, text: " \n " },
    { ...extraction, text: null },
    { ...extraction, pageCount: 0 },
  ]) {
    let analysisCalls = 0;
    let extractionSaved = false;
    await assert.rejects(
      runNoticeAnalysis({
        file: { name: "notice.pdf", type: "application/pdf" },
        language: "english",
        extract: async () => invalidExtraction,
        analyze: async () => {
          analysisCalls += 1;
          return analysis;
        },
        onExtracted: () => {
          extractionSaved = true;
        },
      }),
      NoticeExtractionError
    );
    assert.equal(analysisCalls, 0);
    assert.equal(extractionSaved, false);
  }
});

test("analysis retry reuses extraction and does not repeat the extraction request", async () => {
  let extractionCalls = 0;
  let analysisCalls = 0;
  const retryStates = [];
  const result = await runNoticeAnalysis({
    file: { name: "notice.pdf", type: "application/pdf" },
    language: "english",
    extract: async () => {
      extractionCalls += 1;
      return extraction;
    },
    analyze: (request) =>
      requestNoticeAnalysis({
        ...request,
        fetchImpl: async () => {
          analysisCalls += 1;
          return analysisCalls === 1
            ? response(
                503,
                { detail: "Gemini is temporarily unavailable." },
                { "X-Notiva-Retryable": "true" }
              )
            : response(200, analysis);
        },
        sleep: async () => {},
        random: () => 0.5,
        now: () => 0,
      }),
    onRetry: (retry) => retryStates.push(retry),
  });

  assert.equal(extractionCalls, 1);
  assert.equal(analysisCalls, 2);
  assert.equal(retryStates.length, 1);
  assert.equal(retryStates[0].totalAttempts, ANALYSIS_MAX_ATTEMPTS);
  assert.equal(result.analysis, analysis);
});

test("successful extraction is saved before an analysis failure", async () => {
  let savedExtraction;
  await assert.rejects(
    runNoticeAnalysis({
      file: { name: "notice.pdf", type: "application/pdf" },
      language: "english",
      extract: async () => extraction,
      analyze: async () => {
        throw new Error("Analysis unavailable.");
      },
      onExtracted: (result) => {
        savedExtraction = result;
      },
    }),
    /Analysis unavailable/
  );
  assert.equal(savedExtraction, extraction);
});

test("cancellation prevents stale extraction or analysis from being committed", async () => {
  const extractionController = new AbortController();
  let resolveExtraction;
  let savedExtraction = false;
  let analysisCalls = 0;
  const pendingExtraction = runNoticeAnalysis({
    file: { name: "notice.pdf", type: "application/pdf" },
    language: "english",
    signal: extractionController.signal,
    extract: () =>
      new Promise((resolve) => {
        resolveExtraction = resolve;
      }),
    analyze: async () => {
      analysisCalls += 1;
      return analysis;
    },
    onExtracted: () => {
      savedExtraction = true;
    },
  });
  extractionController.abort();
  resolveExtraction(extraction);
  await assert.rejects(pendingExtraction, { name: "AbortError" });
  assert.equal(savedExtraction, false);
  assert.equal(analysisCalls, 0);

  const analysisController = new AbortController();
  await assert.rejects(
    runNoticeAnalysis({
      file: { name: "notice.pdf", type: "application/pdf" },
      language: "english",
      existingExtraction: extraction,
      signal: analysisController.signal,
      analyze: async () => {
        analysisController.abort();
        return analysis;
      },
    }),
    { name: "AbortError" }
  );
});

test("extraction request forwards file and OCR language without altering response text", async () => {
  for (const file of [
    { name: "notice.pdf", type: "application/pdf" },
    { name: "notice.png", type: "image/png" },
  ]) {
    const formData = {
      fields: [],
      append(...args) {
        this.fields.push(args);
      },
    };
    const text = "  Original\nमराठी मजकूर  ";
    const result = await extractNoticeText({
      url: "/extract?language=marathi",
      file,
      language: "marathi",
      formDataFactory: () => formData,
      fetchImpl: async (url, options) => {
        assert.equal(url, "/extract?language=marathi");
        assert.equal(options.method, "POST");
        assert.equal(formData.fields[0][0], "file");
        assert.equal(formData.fields[0][1], file);
        return response(200, {
          filename: file.name,
          extracted_text: text,
          page_count: 1,
          extraction_method: file.name.endsWith(".png") ? "ocr" : "text",
          ocr_pages: file.name.endsWith(".png") ? [1] : [],
        });
      },
    });

    assert.equal(result.text, text);
  }
});

test("extraction provider errors are clear and retain their extraction-specific type", async () => {
  await assert.rejects(
    extractNoticeText({
      url: "/extract?language=english",
      file: { name: "notice.pdf" },
      language: "english",
      formDataFactory: () => ({ append() {} }),
      fetchImpl: async () =>
        response(502, { detail: "Gemini OCR is temporarily unavailable." }),
    }),
    (error) =>
      error instanceof NoticeExtractionError &&
      error.message.includes("Gemini OCR")
  );
});
