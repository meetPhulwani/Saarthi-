import { useEffect, useReducer, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  FileCheck2,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  formatFileSize,
  isImageFile,
  isPdfFile,
  validateNoticeFile,
} from "../services/noticeFile";
import {
  isUrgencyStale,
  sortDeadlines,
  sortEventDates,
} from "../services/deadlineUtils";
import { ANALYSIS_MAX_ATTEMPTS } from "../services/analysisRequest";
import {
  hasUsableExtraction,
  acquireNoticeWorkflow,
  NoticeExtractionError,
  runNoticeAnalysis,
} from "../services/noticeWorkflow";
import {
  initialOriginalTextState,
  originalTextReducer,
} from "../services/originalTextState";

const languages = [
  { id: "english", label: "English", nativeLabel: "English" },
  { id: "hindi", label: "Hindi", nativeLabel: "हिन्दी" },
  { id: "marathi", label: "Marathi", nativeLabel: "मराठी" },
];

const BACKEND_URL = "http://127.0.0.1:8001";
const urgencyLabels = {
  overdue: "Overdue",
  due_today: "Due Today",
  urgent: "Urgent",
  upcoming: "Upcoming",
  later: "Later",
  unknown: "Date Unverified",
};
const urgencyStyles = {
  overdue:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-200",
  due_today: "border-[#C7F0BD] bg-[#C7F0BD] text-[#202124]",
  urgent:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-amber-950/30 dark:text-amber-100",
  upcoming:
    "border-[#B8BDC4]/35 bg-[#B8BDC4]/15 text-[#202124] dark:text-[#F5F5F5]",
  later:
    "border-[#B8BDC4]/35 bg-transparent text-[#6B7280] dark:text-[#B8BDC4]",
  unknown:
    "border-[#B8BDC4]/45 bg-transparent text-[#6B7280] dark:text-[#B8BDC4]",
  refresh:
    "border-[#B8BDC4]/45 bg-transparent text-[#6B7280] dark:text-[#B8BDC4]",
};

function NoticeUpload({ language, onLanguageChange }) {
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const previewUrlRef = useRef(null);
  const pipelineRequestRef = useRef(0);
  const pipelineControllerRef = useRef(null);
  const isPipelineRunningRef = useRef(false);
  const pipelineStageRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Extraction state
  const [originalTextState, dispatchOriginalText] = useReducer(
    originalTextReducer,
    initialOriginalTextState
  );
  const extractionResult = originalTextState.result;
  const [extractionError, setExtractionError] = useState(null);

  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisRetryAttempt, setAnalysisRetryAttempt] = useState(null);
  const [deadlineClock, setDeadlineClock] = useState(() => new Date());

  const urgencyCalculatedOn = analysisResult?.urgency_calculated_on;
  const deadlineStatusStale =
    Boolean(urgencyCalculatedOn) && isUrgencyStale(urgencyCalculatedOn, deadlineClock);
  const deadlineDates = sortDeadlines(analysisResult?.important_dates);
  const eventDates = sortEventDates(analysisResult?.important_dates);

  useEffect(() => {
    if (!urgencyCalculatedOn) return undefined;
    const intervalId = window.setInterval(() => setDeadlineClock(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, [urgencyCalculatedOn]);

  // Revoke preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
      pipelineControllerRef.current?.abort();
    };
  }, []);

  function clearPreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setPreviewUrl(null);
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function cancelPipeline() {
    pipelineRequestRef.current += 1;
    pipelineControllerRef.current?.abort();
    pipelineControllerRef.current = null;
    isPipelineRunningRef.current = false;
    pipelineStageRef.current = null;
    setIsPipelineRunning(false);
    setPipelineStage(null);
    setAnalysisRetryAttempt(null);
  }

  function clearAnalysisState() {
    setAnalysisResult(null);
    setAnalysisError(null);
  }

  function clearExtractionState() {
    cancelPipeline();
    clearAnalysisState();
    dispatchOriginalText({ type: "fileChanged" });
    setExtractionError(null);
  }

  function handleLanguageChange(nextLanguage) {
    if (nextLanguage !== language) {
      const extractionInProgress = pipelineStageRef.current === "extracting";
      cancelPipeline();
      if (extractionInProgress) {
        dispatchOriginalText({ type: "extractionStarted" });
      }
      dispatchOriginalText({ type: "languageChanged" });
      clearAnalysisState();
      onLanguageChange(nextLanguage);
    }
  }

  function applyFile(nextFile) {
    const result = validateNoticeFile(nextFile);
    if (!result.ok) {
      clearPreviewUrl();
      setFile(null);
      setError(result.message);
      resetInput();
      clearExtractionState();
      return;
    }
    setError("");
    clearPreviewUrl();
    clearExtractionState();
    if (isImageFile(nextFile)) {
      const url = URL.createObjectURL(nextFile);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    }
    setFile(nextFile);
  }

  function onInputChange(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    applyFile(selected);
  }

  function onDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function onDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function onDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files;
    if (!dropped?.length) return;
    if (dropped.length > 1) {
      clearPreviewUrl();
      setFile(null);
      setError("Please add one notice at a time.");
      resetInput();
      clearExtractionState();
      return;
    }
    applyFile(dropped[0]);
  }

  function clearFile() {
    clearPreviewUrl();
    setFile(null);
    setError("");
    resetInput();
    clearExtractionState();
    if (dropZoneRef.current) {
      dropZoneRef.current.focus();
    }
  }

  async function handleAnalyze() {
    if (
      !file ||
      (!isPdfFile(file) && !isImageFile(file)) ||
      !acquireNoticeWorkflow(isPipelineRunningRef)
    ) {
      return;
    }

    const cachedExtraction = hasUsableExtraction(extractionResult)
      ? extractionResult
      : null;
    if (!cachedExtraction) {
      dispatchOriginalText({ type: "extractionStarted" });
      setExtractionError(null);
    }
    clearAnalysisState();

    const requestId = pipelineRequestRef.current + 1;
    pipelineRequestRef.current = requestId;
    const controller = new AbortController();
    pipelineControllerRef.current = controller;
    const initialStage = cachedExtraction ? "analyzing" : "extracting";
    pipelineStageRef.current = initialStage;
    setPipelineStage(initialStage);
    setIsPipelineRunning(true);
    setAnalysisError(null);
    setAnalysisRetryAttempt(null);

    try {
      const params = new URLSearchParams({ language });
      const { analysis } = await runNoticeAnalysis({
        file,
        language,
        existingExtraction: cachedExtraction,
        extractUrl: `${BACKEND_URL}/extract?${params.toString()}`,
        analyzeUrl: `${BACKEND_URL}/analyze`,
        signal: controller.signal,
        onStage: (stage) => {
          if (requestId === pipelineRequestRef.current) {
            pipelineStageRef.current = stage;
            setPipelineStage(stage);
            if (stage === "analyzing") setAnalysisRetryAttempt(null);
          }
        },
        onExtracted: (result) => {
          if (requestId === pipelineRequestRef.current) {
            dispatchOriginalText({ type: "extracted", result });
          }
        },
        onRetry: ({ nextAttempt }) => {
          if (requestId === pipelineRequestRef.current) {
            pipelineStageRef.current = "retrying";
            setPipelineStage("retrying");
            setAnalysisRetryAttempt(nextAttempt);
          }
        },
      });
      if (
        !analysis ||
        typeof analysis.summary !== "string" ||
        !Array.isArray(analysis.key_points) ||
        !Array.isArray(analysis.important_dates) ||
        !Array.isArray(analysis.action_items)
      ) {
        throw new Error("The AI returned an incomplete analysis. Please try again.");
      }
      if (requestId === pipelineRequestRef.current) {
        setAnalysisResult(analysis);
      }
    } catch (requestError) {
      if (
        requestId === pipelineRequestRef.current &&
        !controller.signal.aborted
      ) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Could not analyze this notice. Please try again.";
        if (requestError instanceof NoticeExtractionError) {
          setExtractionError(message);
        } else {
          setAnalysisError(message);
        }
      }
    } finally {
      if (requestId === pipelineRequestRef.current) {
        isPipelineRunningRef.current = false;
        pipelineControllerRef.current = null;
        pipelineStageRef.current = null;
        setAnalysisRetryAttempt(null);
        setPipelineStage(null);
        setIsPipelineRunning(false);
      }
    }
  }

  function triggerFilePicker() {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      triggerFilePicker();
    }
  }

  return (
    <section
      id="workspace"
      aria-labelledby="workspace-heading"
      className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 pb-12"
    >
      {/* Creative Document Canvas Container */}
      <div className="relative rounded-3xl border-2 border-[#B8BDC4]/35 bg-white p-5 sm:p-8 shadow-[0_12px_36px_-15px_rgba(32,33,36,0.08)] transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]">
        {/* Workspace Header Strip: Title + Integrated Compact Language Selector */}
        <div className="flex flex-col gap-4 border-b border-[#B8BDC4]/20 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-[#B8BDC4]/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#C7F0BD] text-[#202124] dark:bg-[#C7F0BD] dark:text-[#202124]">
                <FileCheck2 className="size-4" aria-hidden="true" />
              </span>
              <h2
                id="workspace-heading"
                className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5]"
              >
                Smart Notice Workspace
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#6B7280] dark:text-[#B8BDC4]">
              Review college notices, exam notifications, and timetables more clearly.
            </p>
          </div>

          {/* Integrated Compact Language Selector (English / हिन्दी / मराठी) */}
          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-[#6B7280] dark:text-[#B8BDC4]" aria-hidden="true" />
              <span className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider dark:text-[#B8BDC4]">
                Target Language
              </span>
            </div>

            <div
              role="group"
              aria-label="Analysis language"
              className="inline-flex max-w-full flex-wrap rounded-xl border border-[#B8BDC4]/35 bg-[#F5F5F5] p-1 dark:border-[#B8BDC4]/40 dark:bg-[#202124]"
            >
              {languages.map((lang) => {
                const isSelected = language === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleLanguageChange(lang.id)}
                    className={`flex scroll-mt-20 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202124] dark:focus-visible:outline-[#C7F0BD] sm:px-3 ${
                      isSelected
                        ? "bg-[#C7F0BD] text-[#202124] font-bold shadow-2xs"
                        : "text-[#6B7280] hover:text-[#202124] dark:text-[#B8BDC4] dark:hover:text-[#202124]"
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[10px] opacity-80">({lang.nativeLabel})</span>
                    {isSelected && <Check className="size-3 stroke-[2.5]" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-[#6B7280] dark:text-[#B8BDC4]">
              Analysis language · Choose a language before analyzing
            </span>
          </div>
        </div>

        {/* Drop Canvas / Upload Area */}
        {!file ? (
          <div
            ref={dropZoneRef}
            role="button"
            tabIndex={0}
            aria-label="Upload notice file. Press Enter or Space to choose a file, or drag and drop here."
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={triggerFilePicker}
            onKeyDown={handleKeyDown}
            className={`group mt-6 relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F5F5] ${
              isDragging
                ? "border-[#F5F5F5] bg-[#C7F0BD]/25 scale-[0.99] dark:border-[#C7F0BD] dark:bg-[#C7F0BD]/15"
                : "border-[#B8BDC4]/35 bg-[#F5F5F5]/80 hover:border-[#F5F5F5]/60 hover:bg-[#3A3D42]/20 dark:border-[#B8BDC4]/40 dark:bg-[#202124]/50 dark:hover:border-[#C7F0BD]/40"
            }`}
          >
            {/* Visual Icon Badge */}
            <div className="relative flex size-14 items-center justify-center rounded-2xl bg-white shadow-xs border border-[#B8BDC4]/30 group-hover:scale-105 group-hover:border-[#F5F5F5] transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]">
              <Upload
                className="size-6 text-[#202124] transition-colors dark:text-[#C7F0BD]"
                aria-hidden="true"
              />
            </div>

            {/* Instruction Headline */}
            <p className="mt-4 font-display text-base font-semibold text-[#202124] dark:text-[#F5F5F5]">
              Drag and drop your college notice here, or{" "}
              <span className="text-[#202124] underline decoration-[#C7F0BD] underline-offset-4 font-bold dark:text-[#C7F0BD]">
                browse
              </span>
            </p>

            <p className="mt-1.5 max-w-sm text-xs text-[#6B7280] dark:text-[#B8BDC4]">
              Accepts administrative PDF circulars and document photos (PNG, JPG, JPEG) up to 10 MB.
            </p>

            {/* Formats Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {["PDF", "PNG", "JPG", "JPEG"].map((format) => (
                <span
                  key={format}
                  className="rounded-md border border-[#B8BDC4]/30 bg-white px-2 py-0.5 text-[11px] font-mono text-[#202124] dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5]"
                >
                  {format}
                </span>
              ))}
              <span className="text-[11px] text-[#6B7280] dark:text-[#B8BDC4]">
                · max 10 MB
              </span>
            </div>

            {/* Primary upload button */}
            <div className="mt-6">
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-6 py-2.5 text-xs font-semibold text-[#202124] shadow-xs hover:bg-[#3A3D42] active:scale-95 transition-all dark:bg-[#C7F0BD] dark:text-[#202124] dark:hover:bg-white"
              >
                <Upload className="size-4" aria-hidden="true" />
                Select Notice File
              </span>
            </div>

            <input
              ref={inputRef}
              id="notice-file-input"
              type="file"
              aria-label="Choose a PDF, PNG, JPG, or JPEG notice"
              tabIndex={-1}
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="sr-only"
              onChange={onInputChange}
            />
          </div>
        ) : (
          /* Selected File Canvas Presentation */
          <div className="mt-6 rounded-2xl border border-[#B8BDC4]/35 bg-[#F5F5F5] p-5 dark:border-[#B8BDC4]/40 dark:bg-[#202124]/80 transition-all">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                {/* Thumbnail Preview or Document Badge */}
                {previewUrl ? (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-[#B8BDC4]/30 bg-white shadow-xs sm:size-24 dark:border-[#B8BDC4]/40">
                    <img
                      src={previewUrl}
                      alt="Notice thumbnail preview"
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-[#202124]/85 py-0.5 text-center text-[10px] font-bold text-[#F5F5F5]">
                      IMAGE
                    </div>
                  </div>
                ) : (
                  <div className="flex size-20 shrink-0 flex-col items-center justify-center rounded-xl border border-[#B8BDC4]/30 bg-white text-[#202124] shadow-xs sm:size-24 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#C7F0BD]">
                    {isPdfFile(file) ? (
                      <>
                        <FileText className="size-8 text-[#54794E] dark:text-[#C7F0BD]" aria-hidden="true" />
                        <span className="mt-1 font-mono text-[10px] font-bold text-[#54794E] dark:text-[#C7F0BD]">
                          PDF
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="size-8" aria-hidden="true" />
                        <span className="mt-1 font-mono text-[10px] font-bold text-[#202124] dark:text-[#F5F5F5]">
                          NOTICE
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#C7F0BD] px-2 py-0.5 text-[11px] font-bold text-[#202124]">
                      <FileCheck2 className="size-3" aria-hidden="true" />
                      Validated Document
                    </span>
                    <span className="text-xs text-[#6B7280] dark:text-[#B8BDC4]">·</span>
                    <span className="text-xs font-mono font-medium text-[#6B7280] dark:text-[#B8BDC4]">
                      {formatFileSize(file.size)}
                    </span>
                  </div>

                  <h3
                    className="mt-1.5 break-all font-display text-base font-bold text-[#202124] dark:text-[#F5F5F5]"
                    title={file.name}
                  >
                    {file.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#6B7280] dark:text-[#B8BDC4]">
                    {isPdfFile(file)
                      ? "Document validated. Ready for text extraction and OCR."
                      : "Image verified. Ready for text extraction and OCR."}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-[#6B7280] dark:text-[#B8BDC4]">
                    <span className="size-1.5 rounded-full bg-[#C7F0BD] dark:bg-[#C7F0BD]" />
                    <span>Your notice is validated before processing.</span>
                  </div>
                </div>
              </div>

              {/* Actions: Replace / Remove */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#B8BDC4]/35 bg-white px-3 py-2 text-xs font-semibold text-[#202124] shadow-2xs hover:bg-[#3A3D42]/30 transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5] dark:hover:bg-[#3A3D42]"
                >
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                  Replace
                </button>
                <button
                  type="button"
                  onClick={clearFile}
                  aria-label="Remove selected notice file"
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-[#B8BDC4]/35 bg-white text-[#6B7280] shadow-2xs hover:border-[#C7F0BD] hover:bg-[#C7F0BD]/10 hover:text-[#54794E] transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5]"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <input
              ref={inputRef}
              id="notice-file-replace-input"
              type="file"
              aria-label="Choose a PDF, PNG, JPG, or JPEG notice"
              tabIndex={-1}
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="sr-only"
              onChange={onInputChange}
            />

            {/* ── Analyze Notice ───────────────────────────────────── */}
            {(isPdfFile(file) || isImageFile(file)) && (
              <div className="mt-4 border-t border-[#B8BDC4]/20 pt-4 dark:border-[#B8BDC4]/30">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isPipelineRunning}
                  aria-busy={isPipelineRunning}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-5 py-3 text-sm font-bold text-[#202124] shadow-xs hover:bg-[#3A3D42] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202124] dark:bg-[#C7F0BD] dark:text-[#202124] dark:hover:bg-white dark:focus-visible:outline-[#C7F0BD]"
                >
                  {isPipelineRunning ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="size-4" aria-hidden="true" />
                  )}
                  Analyze with AI
                </button>
                {isPipelineRunning && (
                  <p role="status" aria-live="polite" className="mt-3 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5]">
                    {pipelineStage === "extracting"
                      ? "Reading your notice..."
                      : pipelineStage === "retrying"
                        ? `AI is busy — retrying automatically... (attempt ${analysisRetryAttempt} of ${ANALYSIS_MAX_ATTEMPTS})`
                        : "Analyzing with AI..."}
                  </p>
                )}

                {/* Extraction error */}
                {extractionError && (
                  <div
                    role="alert"
                    className="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-3.5 text-sm leading-relaxed text-red-700 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-200"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <span className="font-bold">Extraction Error: </span>
                      <span>{extractionError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExtractionError(null)}
                      className="text-red-700 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-red-200"
                    >
                      <span className="sr-only">Dismiss</span>
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Extraction result */}
                {extractionResult && (
                  <div className="mt-3 rounded-2xl border border-[#B8BDC4]/35 bg-white p-4 dark:border-[#B8BDC4]/40 dark:bg-[#202124]">
                    <div
                      role="status"
                      aria-label={`Text extracted from ${extractionResult.filename}, ${extractionResult.pageCount} page${extractionResult.pageCount !== 1 ? "s" : ""}.`}
                      className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#6B7280] dark:text-[#B8BDC4]"
                    >
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#C7F0BD] px-2 py-0.5 text-[11px] font-bold text-[#202124]">
                        <FileCheck2 className="size-3" aria-hidden="true" />
                        Extracted
                      </span>
                      <span>{extractionResult.pageCount} page{extractionResult.pageCount !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span className="min-w-0 break-all font-mono">{extractionResult.filename}</span>
                      {extractionResult.extractionMethod !== "text" && (
                        <>
                          <span>·</span>
                          <span className="font-semibold uppercase">
                            {extractionResult.extractionMethod === "mixed"
                              ? `OCR pages ${extractionResult.ocrPages.join(", ")}`
                              : "OCR"}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5]">
                        Original notice text is available for verification.
                      </p>
                      <button
                        type="button"
                        aria-expanded={originalTextState.isExpanded}
                        aria-controls="original-notice-text"
                        onClick={() => dispatchOriginalText({ type: "toggle" })}
                        className="inline-flex items-center rounded-lg border border-[#B8BDC4]/40 px-3 py-2 text-sm font-semibold text-[#202124] hover:border-[#C7F0BD] hover:bg-[#C7F0BD]/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#202124] dark:text-[#F5F5F5] dark:focus-visible:outline-[#C7F0BD]"
                      >
                        {originalTextState.isExpanded
                          ? "Hide Original Text"
                          : "View Original Text"}
                      </button>
                    </div>
                    <div
                      id="original-notice-text"
                      hidden={!originalTextState.isExpanded}
                      className="max-h-[28rem] overflow-auto rounded-xl border border-[#B8BDC4]/25 bg-[#F5F5F5] p-4 dark:border-[#B8BDC4]/35 dark:bg-[#2B2D31] sm:p-5"
                    >
                      <pre className="mx-auto max-w-[80ch] whitespace-pre-wrap break-words font-sans text-base leading-[1.6] text-[#202124] [overflow-wrap:anywhere] dark:text-[#F5F5F5] sm:text-[17px]">
                        {extractionResult.text}
                      </pre>
                    </div>

                    {analysisError && (
                      <div
                        role="alert"
                        className="mt-3 flex items-start gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-3.5 text-sm leading-relaxed text-red-700 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-200"
                      >
                        <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                        <div className="flex-1">
                          <span className="font-bold">Analysis Error: </span>
                          <span>{analysisError}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnalysisError(null)}
                          className="hover:opacity-80"
                        >
                          <span className="sr-only">Dismiss analysis error</span>
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}

                    {analysisResult && (
                      <div className="mt-4 space-y-3">
                        {analysisResult.summary && (
                          <section className="rounded-2xl border border-[#B8BDC4]/30 bg-[#F5F5F5] p-5 dark:border-[#C7F0BD]/30 dark:bg-[#2B2D31] sm:p-6">
                            <h4 className="font-display text-lg font-bold text-[#202124] dark:text-[#F5F5F5] sm:text-xl">
                              Simple Summary
                            </h4>
                            <p className="mt-3 max-w-[70ch] whitespace-pre-wrap break-words text-base leading-relaxed text-[#202124] [overflow-wrap:anywhere] dark:text-[#F5F5F5] sm:text-lg">
                              {analysisResult.summary}
                            </p>
                          </section>
                        )}

                        {analysisResult.key_points?.length > 0 && (
                          <section className="rounded-2xl border border-[#B8BDC4]/30 bg-[#F5F5F5] p-5 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] sm:p-6">
                            <h4 className="font-display text-lg font-bold text-[#202124] dark:text-[#F5F5F5] sm:text-xl">
                              Key Points
                            </h4>
                            <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-lg">
                              {analysisResult.key_points.map((point, index) => (
                                <li
                                  key={`${index}-${point}`}
                                  className="break-words [overflow-wrap:anywhere]"
                                >
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {analysisResult.important_dates?.length > 0 && (
                          <section className="rounded-2xl border border-[#B8BDC4]/30 bg-[#F5F5F5] p-5 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] sm:p-6">
                            <h4 className="font-display text-lg font-bold text-[#202124] dark:text-[#F5F5F5] sm:text-xl">
                              Important Dates
                            </h4>
                            <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-lg">
                              {analysisResult.important_dates.map((item, index) => (
                                <li
                                  key={`${index}-${item.date}`}
                                  className="break-words [overflow-wrap:anywhere]"
                                >
                                  <span className="font-semibold text-[#202124] dark:text-[#F5F5F5]">
                                    {item.label}: {item.date}
                                  </span>
                                  {item.type && (
                                    <span className="ml-2 text-xs font-semibold uppercase tracking-wide">
                                      {item.type === "deadline"
                                        ? "Action deadline"
                                        : item.type === "unknown"
                                          ? "Classification unverified"
                                          : item.type}
                                    </span>
                                  )}
                                  {item.verified === false && (
                                    <span className="ml-2 text-xs font-semibold">
                                      Date unverified
                                    </span>
                                  )}
                                  {item.context && <span> — {item.context}</span>}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {(deadlineDates.length > 0 || eventDates.length > 0) && (
                          <section
                            aria-labelledby="deadline-tracker-heading"
                            className="rounded-2xl border border-[#B8BDC4]/30 bg-[#F5F5F5] p-5 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] sm:p-6"
                          >
                            <h4
                              id="deadline-tracker-heading"
                              className="font-display text-lg font-bold text-[#202124] dark:text-[#F5F5F5] sm:text-xl"
                            >
                              Deadline Tracker
                            </h4>
                            <p className="mt-2 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5]">
                              Action deadlines are separate from dates when events take place.
                            </p>

                            {deadlineStatusStale && (
                              <p
                                role="status"
                                className="mt-3 rounded-lg border border-[#B8BDC4]/40 px-3 py-2 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5]"
                              >
                                Urgency was calculated for {urgencyCalculatedOn} in Asia/Kolkata.
                                Re-analyze to refresh it for today.
                              </p>
                            )}

                            {deadlineDates.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-sm font-bold uppercase tracking-wide text-[#202124] dark:text-[#F5F5F5] sm:text-base">
                                  Action Deadlines
                                </h5>
                                <ul className="mt-2 space-y-2">
                                  {deadlineDates.map((item, index) => {
                                    const verifiedDate =
                                      item.verified === true && item.normalized_date;
                                    const urgency = verifiedDate
                                      ? item.urgency ?? "unknown"
                                      : "unknown";
                                    const visibleStatus = deadlineStatusStale
                                      ? "refresh"
                                      : urgency;
                                    const daysRemaining = item.days_remaining;

                                    return (
                                      <li
                                        key={`${index}-${item.label}-${item.date}`}
                                        className="flex flex-col gap-3 rounded-xl border border-[#B8BDC4]/25 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#B8BDC4]/25 dark:bg-[#202124]/60"
                                      >
                                        <div className="min-w-0">
                                          <p className="break-words text-base font-semibold leading-relaxed text-[#202124] [overflow-wrap:anywhere] dark:text-[#F5F5F5] sm:text-lg">
                                            {item.label}
                                          </p>
                                          <p className="mt-1 break-words text-base leading-relaxed text-[#202124] [overflow-wrap:anywhere] dark:text-[#F5F5F5] sm:text-lg">
                                            {verifiedDate
                                              ? item.original_date ?? item.date
                                              : "Full date not verified; check the original notice."}
                                          </p>
                                          {!deadlineStatusStale &&
                                            verifiedDate &&
                                            Number.isInteger(daysRemaining) &&
                                            daysRemaining > 0 && (
                                              <p className="mt-1 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-base">
                                                {daysRemaining} calendar day
                                                {daysRemaining === 1 ? "" : "s"} remaining
                                              </p>
                                            )}
                                          {!deadlineStatusStale &&
                                            verifiedDate &&
                                            daysRemaining === 0 &&
                                            urgency === "overdue" &&
                                            item.normalized_datetime && (
                                              <p className="mt-1 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-base">
                                                Stated deadline time has passed
                                              </p>
                                            )}
                                          {!deadlineStatusStale &&
                                            verifiedDate &&
                                            Number.isInteger(daysRemaining) &&
                                            daysRemaining < 0 && (
                                              <p className="mt-1 text-sm leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-base">
                                                {Math.abs(daysRemaining)} calendar day
                                                {Math.abs(daysRemaining) === 1 ? "" : "s"} overdue
                                              </p>
                                            )}
                                        </div>
                                        <span
                                          className={`inline-flex w-fit shrink-0 items-center rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide sm:text-sm ${urgencyStyles[visibleStatus] ?? urgencyStyles.unknown}`}
                                        >
                                          {deadlineStatusStale
                                            ? "Refresh to update"
                                            : urgencyLabels[urgency] ?? urgencyLabels.unknown}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}

                            {eventDates.length > 0 && (
                              <div
                                className={`${deadlineDates.length > 0 ? "mt-4 border-t border-[#B8BDC4]/25 pt-3" : "mt-3"}`}
                              >
                                <h5 className="text-sm font-bold uppercase tracking-wide text-[#202124] dark:text-[#F5F5F5] sm:text-base">
                                  Event Dates · Not Deadlines
                                </h5>
                                <ul className="mt-3 space-y-3 text-base leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-lg">
                                  {eventDates.map((item, index) => (
                                    <li
                                      key={`${index}-${item.label}-${item.date}`}
                                      className="flex flex-wrap justify-between gap-x-3 gap-y-1 break-words [overflow-wrap:anywhere]"
                                    >
                                      <span className="font-semibold text-[#202124] dark:text-[#F5F5F5]">
                                        {item.label}
                                      </span>
                                      <span className="text-[#202124] dark:text-[#F5F5F5]">
                                        {item.verified === true
                                          ? item.original_date ?? item.date
                                          : "Date unverified"}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </section>
                        )}

                        {analysisResult.action_items?.length > 0 && (
                          <section className="rounded-2xl border border-[#B8BDC4]/30 bg-[#F5F5F5] p-5 dark:border-[#C7F0BD]/30 dark:bg-[#2B2D31] sm:p-6">
                            <h4 className="font-display text-lg font-bold text-[#202124] dark:text-[#F5F5F5] sm:text-xl">
                              What You Need To Do
                            </h4>
                            <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-relaxed text-[#202124] dark:text-[#F5F5F5] sm:text-lg">
                              {analysisResult.action_items.map((item, index) => (
                                <li
                                  key={`${index}-${item}`}
                                  className="break-words [overflow-wrap:anywhere]"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                        <p className="text-[11px] text-[#6B7280] dark:text-[#B8BDC4]">
                          AI explanations can be inaccurate. Check dates, eligibility, and requirements against the original notice.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-2xl border border-red-300 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-200 transition-all"
          >
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-[#54794E] dark:text-[#C7F0BD]" aria-hidden="true" />
            <div className="flex-1">
              <span className="font-bold">Notice Error: </span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-[#54794E] dark:text-[#C7F0BD] hover:opacity-80"
            >
              <span className="sr-only">Dismiss error</span>
              <X className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Canvas Footer */}
        <div className="mt-5 flex flex-col items-start justify-between gap-2 border-t border-[#B8BDC4]/20 pt-4 text-xs text-[#6B7280] sm:flex-row sm:items-center dark:border-[#B8BDC4]/30 dark:text-[#B8BDC4]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#C7F0BD] dark:bg-[#C7F0BD]" />
            Extracted notice text can be analyzed in English, Hindi, or Marathi.
          </span>
          <span className="text-[11px] font-mono text-[#6B7280] dark:text-[#B8BDC4]">
            Max file size: 10 MB · Supported: PDF, PNG, JPG, JPEG
          </span>
        </div>
      </div>
    </section>
  );
}

export default NoticeUpload;
