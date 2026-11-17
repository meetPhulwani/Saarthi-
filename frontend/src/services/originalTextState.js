export const initialOriginalTextState = {
  result: null,
  isExpanded: false,
};

export function originalTextReducer(state, action) {
  switch (action.type) {
    case "extracted":
      return { result: action.result, isExpanded: false };
    case "toggle":
      return state.result
        ? { ...state, isExpanded: !state.isExpanded }
        : state;
    case "fileChanged":
    case "extractionStarted":
      return initialOriginalTextState;
    case "languageChanged":
      return state;
    default:
      throw new Error(`Unknown original-text action: ${action.type}`);
  }
}
