import assert from "node:assert/strict";
import test from "node:test";
import {
  initialOriginalTextState,
  originalTextReducer,
} from "./originalTextState.js";

const extraction = {
  text: "Notice line 1\nमराठी मजकूर — 20 November 2026\nhttps://example.edu/a-very-long-url",
  pageCount: 1,
  filename: "notice.pdf",
  extractionMethod: "text",
  ocrPages: [],
};

test("newly extracted text starts collapsed and is retained when toggled", () => {
  let state = originalTextReducer(initialOriginalTextState, {
    type: "extracted",
    result: extraction,
  });

  assert.equal(state.isExpanded, false);
  assert.equal(state.result.text, extraction.text);

  state = originalTextReducer(state, { type: "toggle" });
  assert.equal(state.isExpanded, true);
  assert.equal(state.result.text, extraction.text);

  state = originalTextReducer(state, { type: "toggle" });
  assert.equal(state.isExpanded, false);
  assert.equal(state.result.text, extraction.text);
});

test("language changes preserve extracted text and its expanded state", () => {
  const state = {
    result: extraction,
    isExpanded: true,
  };

  assert.equal(
    originalTextReducer(state, { type: "languageChanged" }),
    state
  );
});

test("file replacement and extraction restart reset text and expansion", () => {
  const expandedState = {
    result: extraction,
    isExpanded: true,
  };

  for (const type of ["fileChanged", "extractionStarted"]) {
    assert.deepEqual(originalTextReducer(expandedState, { type }), {
      result: null,
      isExpanded: false,
    });
  }
});
