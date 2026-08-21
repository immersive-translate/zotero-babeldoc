import { getString } from "../../utils/locale";
import { getPref } from "../../utils/prefs";
import {
  normalizeSelectionTranslationModel,
  normalizeSelectionTranslationThinkingMode,
  requestDeepSeekSelectionTranslation,
  type SelectionTranslationErrorCode,
  type SelectionTranslationThinkingMode,
} from "./provider";

const MAX_SELECTION_LENGTH = 5000;
const ROOT_CLASS = "immersivetranslate-selection-translation";
const STYLE_ID = "immersivetranslate-selection-translation-style";
const ANNOTATION_BLOCK_START = "[Immersive Translate Selection Translation]";
const ANNOTATION_BLOCK_END = "[/Immersive Translate Selection Translation]";
const ITEM_PANE_SECTION_ID = "immersivetranslate-selection-translation";
const MAX_AUTO_ANNOTATION_IDS_PER_NOTIFY = 1;
const MAX_AUTO_ANNOTATION_QUEUE_SIZE = 10;
const MAX_AUTO_ANNOTATION_REQUESTS_PER_WINDOW = 5;
const AUTO_ANNOTATION_REQUEST_DELAY_MS = 500;
const AUTO_ANNOTATION_REQUEST_WINDOW_MS = 60_000;
const RECENT_READER_SELECTION_WINDOW_MS = 15_000;
const MAX_RECENT_READER_SELECTIONS = 10;
const IMMERSIVE_TRANSLATE_ICON_PATH =
  "M116.705 75.100 L 116.600 89.000 88.900 89.103 L 61.200 89.205 61.200 137.600 L 61.200 185.995 88.900 186.097 L 116.600 186.200 116.704 207.100 L 116.807 228.000 130.604 228.000 L 144.400 228.000 144.400 207.000 L 144.400 186.000 172.200 186.000 L 200.000 186.000 200.000 137.600 L 200.000 89.200 172.200 89.200 L 144.400 89.200 144.400 75.200 L 144.400 61.200 130.605 61.200 L 116.810 61.200 116.705 75.100 M227.600 88.772 L 227.600 102.800 250.576 102.800 C 265.463 102.800,273.640 102.941,273.800 103.200 C 273.936 103.420,274.387 103.600,274.803 103.600 C 281.873 103.600,292.696 112.756,295.278 120.921 C 295.778 122.505,296.371 123.928,296.594 124.085 C 296.854 124.268,297.044 130.468,297.124 141.385 L 297.247 158.400 311.262 158.400 L 325.277 158.400 325.083 140.900 C 324.882 122.835,324.541 118.696,323.013 115.765 C 322.678 115.124,322.404 114.303,322.402 113.940 C 322.398 112.713,319.594 106.004,317.992 103.386 C 317.116 101.956,316.400 100.635,316.400 100.451 C 316.400 100.267,315.995 99.677,315.500 99.139 C 315.005 98.601,314.107 97.412,313.504 96.496 C 311.880 94.027,305.442 87.743,302.856 86.103 C 301.615 85.316,300.456 84.430,300.280 84.136 C 300.104 83.841,299.804 83.600,299.613 83.600 C 299.422 83.600,297.879 82.780,296.184 81.778 C 292.949 79.865,288.492 78.078,284.796 77.210 C 283.588 76.927,282.420 76.558,282.200 76.390 C 280.817 75.333,275.285 75.062,251.900 74.906 L 227.600 74.745 227.600 88.772 M116.600 137.600 L 116.600 158.200 102.700 158.305 L 88.800 158.410 88.800 137.600 L 88.800 116.790 102.700 116.895 L 116.600 117.000 116.600 137.600 M172.000 137.600 L 172.000 158.400 158.200 158.400 L 144.400 158.400 144.400 137.600 L 144.400 116.800 158.200 116.800 L 172.000 116.800 172.000 137.600 M255.091 172.900 C 254.773 174.314,252.711 179.778,252.412 180.000 C 252.263 180.110,251.461 182.090,250.628 184.400 C 249.795 186.710,248.891 188.960,248.619 189.400 C 248.166 190.130,246.935 193.348,245.328 198.000 C 244.986 198.990,244.579 199.890,244.424 200.000 C 244.269 200.110,243.461 202.090,242.628 204.400 C 241.795 206.710,240.891 208.960,240.619 209.400 C 240.166 210.130,238.935 213.348,237.328 218.000 C 236.986 218.990,236.579 219.890,236.424 220.000 C 236.269 220.110,235.461 222.090,234.628 224.400 C 233.795 226.710,232.891 228.960,232.619 229.400 C 232.166 230.130,230.935 233.348,229.328 238.000 C 228.986 238.990,228.579 239.890,228.424 240.000 C 228.269 240.110,227.461 242.090,226.628 244.400 C 225.795 246.710,224.883 248.969,224.600 249.421 C 224.317 249.872,223.808 251.042,223.468 252.021 C 221.781 256.882,220.655 259.819,220.412 260.000 C 220.263 260.110,219.461 262.090,218.628 264.400 C 217.795 266.710,216.883 268.969,216.600 269.421 C 216.317 269.872,215.808 271.042,215.468 272.021 C 213.781 276.882,212.655 279.819,212.412 280.000 C 212.263 280.110,211.461 282.090,210.628 284.400 C 209.795 286.710,208.891 288.960,208.619 289.400 C 208.166 290.130,206.935 293.348,205.328 298.000 C 204.986 298.990,204.579 299.890,204.424 300.000 C 204.269 300.110,203.461 302.090,202.628 304.400 C 201.795 306.710,200.891 308.960,200.619 309.400 C 200.166 310.130,198.935 313.348,197.328 318.000 C 196.986 318.990,196.583 319.890,196.433 320.000 C 196.191 320.178,194.400 324.617,194.400 325.040 C 194.400 325.133,201.186 325.162,209.480 325.105 L 224.560 325.000 225.465 322.471 C 225.963 321.079,226.659 319.369,227.011 318.671 C 227.637 317.428,230.057 311.085,230.587 309.300 C 230.734 308.805,231.001 308.400,231.180 308.400 C 231.360 308.400,231.597 307.995,231.708 307.500 C 231.993 306.224,234.272 300.138,235.022 298.649 C 235.639 297.423,238.062 291.071,238.587 289.300 C 238.734 288.805,239.022 288.400,239.227 288.400 C 239.432 288.400,239.600 288.145,239.600 287.833 C 239.600 287.521,239.954 286.441,240.386 285.433 L 241.172 283.600 269.531 283.600 L 297.891 283.600 298.546 285.313 C 298.906 286.256,299.200 287.175,299.200 287.355 C 299.200 287.536,299.629 288.537,300.152 289.580 C 300.676 290.623,301.788 293.349,302.623 295.638 C 303.458 297.927,304.269 299.890,304.424 300.000 C 304.579 300.110,304.987 301.010,305.331 302.000 C 306.989 306.773,307.765 308.786,308.800 311.000 C 310.009 313.586,311.554 317.639,311.888 319.100 C 312.001 319.595,312.238 320.000,312.416 320.000 C 312.593 320.000,312.945 320.675,313.198 321.500 C 313.452 322.325,313.847 323.495,314.078 324.100 L 314.497 325.200 329.449 325.200 C 346.303 325.200,345.174 325.457,343.448 322.020 C 342.924 320.977,341.812 318.251,340.977 315.962 C 340.142 313.673,339.337 311.710,339.188 311.600 C 338.945 311.419,337.819 308.482,336.132 303.621 C 335.792 302.642,335.283 301.472,335.000 301.021 C 334.717 300.569,333.805 298.310,332.972 296.000 C 332.139 293.690,331.337 291.710,331.188 291.600 C 330.945 291.419,329.819 288.482,328.132 283.621 C 327.792 282.642,327.283 281.472,327.000 281.021 C 326.717 280.569,325.805 278.310,324.972 276.000 C 324.139 273.690,323.337 271.710,323.188 271.600 C 322.945 271.419,321.819 268.482,320.132 263.621 C 319.792 262.642,319.283 261.472,319.000 261.021 C 318.717 260.569,317.805 258.310,316.972 256.000 C 316.139 253.690,315.337 251.710,315.188 251.600 C 314.945 251.419,313.819 248.482,312.132 243.621 C 311.792 242.642,311.283 241.472,311.000 241.021 C 310.717 240.569,309.805 238.310,308.972 236.000 C 308.139 233.690,307.337 231.710,307.188 231.600 C 306.945 231.419,305.819 228.482,304.132 223.621 C 303.792 222.642,303.283 221.472,303.000 221.021 C 302.717 220.569,301.805 218.310,300.972 216.000 C 300.139 213.690,299.331 211.710,299.176 211.600 C 299.021 211.490,298.614 210.590,298.272 209.600 C 296.665 204.948,295.434 201.730,294.981 201.000 C 294.709 200.560,293.805 198.310,292.972 196.000 C 292.139 193.690,291.331 191.710,291.176 191.600 C 291.021 191.490,290.614 190.590,290.272 189.600 C 288.667 184.953,287.434 181.730,286.982 181.000 C 286.710 180.560,285.905 178.580,285.192 176.600 C 284.480 174.620,283.718 172.775,283.500 172.500 C 283.195 172.117,279.842 172.000,269.198 172.000 L 255.293 172.000 255.091 172.900 M270.342 214.500 C 270.978 216.680,272.184 219.788,272.480 220.011 C 272.634 220.128,273.474 222.198,274.346 224.611 C 275.218 227.025,276.219 229.562,276.570 230.249 C 277.192 231.467,279.455 237.406,279.904 239.000 C 280.028 239.440,280.272 239.895,280.445 240.011 C 280.618 240.128,281.479 242.228,282.357 244.679 C 283.235 247.131,284.144 249.465,284.377 249.868 C 285.100 251.118,286.400 254.437,286.400 255.033 C 286.400 255.513,283.802 255.600,269.400 255.600 C 260.050 255.600,252.400 255.506,252.400 255.392 C 252.400 255.278,252.850 254.077,253.400 252.723 C 253.950 251.370,254.400 250.036,254.400 249.760 C 254.400 249.483,254.637 249.019,254.928 248.729 C 255.218 248.438,255.560 247.840,255.688 247.400 C 256.167 245.754,258.416 239.852,259.022 238.649 C 259.639 237.423,262.062 231.071,262.587 229.300 C 262.734 228.805,263.001 228.400,263.180 228.400 C 263.360 228.400,263.597 227.995,263.708 227.500 C 264.027 226.071,266.188 220.398,267.344 217.955 C 267.925 216.727,268.400 215.617,268.400 215.487 C 268.400 213.445,269.823 212.722,270.342 214.500 M74.908 258.900 C 75.078 275.176,75.446 280.965,76.390 282.200 C 76.558 282.420,76.925 283.590,77.205 284.800 C 78.005 288.246,79.979 293.127,81.870 296.333 C 82.821 297.946,83.600 299.422,83.600 299.613 C 83.600 299.804,83.841 300.104,84.136 300.280 C 84.430 300.456,85.316 301.615,86.103 302.856 C 87.894 305.679,94.229 312.056,96.838 313.661 C 97.917 314.325,98.800 315.003,98.800 315.167 C 98.800 315.331,99.295 315.718,99.900 316.027 C 100.505 316.336,102.122 317.262,103.493 318.086 C 106.058 319.626,112.767 322.398,113.940 322.402 C 114.303 322.404,115.124 322.678,115.765 323.013 C 118.974 324.686,122.332 324.902,147.900 325.085 L 172.400 325.259 172.400 311.245 L 172.400 297.230 148.585 297.115 C 133.034 297.040,124.671 296.859,124.485 296.593 C 124.328 296.370,123.304 295.955,122.210 295.671 C 113.434 293.396,105.109 284.270,103.791 275.479 C 103.635 274.440,103.348 273.492,103.154 273.371 C 102.958 273.251,102.800 266.091,102.800 257.376 L 102.800 241.600 88.764 241.600 L 74.728 241.600 74.908 258.900";

type ReaderSelectionEvent = {
  reader?: {
    type?: string;
    itemID?: number;
    annotationItemIDs?: number[];
    focus?: () => void;
    setAnnotations?: (items: Zotero.Item[]) => void;
  };
  doc: Document;
  params?: {
    annotation?: {
      id?: number | string;
      itemID?: number;
      key?: string;
      libraryID?: number;
      readOnly?: boolean;
      text?: string;
    };
    annotationID?: number | string;
    currentID?: number | string;
    id?: number | string;
    ids?: Array<number | string>;
  };
  append: (...nodes: Array<Node | string>) => void;
};

type ReaderContextMenuItem = {
  label: string;
  disabled?: boolean;
  onCommand: () => void;
};

type AnnotationContext = {
  key: string;
  libraryID: number;
  itemID?: number;
  readOnly: boolean;
  reader?: ReaderSelectionEvent["reader"];
};

type TranslationStatus =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "missing-key"
  | "length"
  | "empty";

type SelectionState = {
  id: number;
  requestID: number;
  itemID?: number;
  sourceText: string;
  translatedText: string;
  targetLanguage: string;
  model: string;
  thinkingMode: SelectionTranslationThinkingMode;
  status: TranslationStatus;
  message: string;
  annotation?: AnnotationContext;
};

type ItemPaneSectionRenderContext = {
  body?: HTMLElement;
  item?: Zotero.Item;
  refresh?: () => void;
};

type ItemPaneInitContext = ItemPaneSectionRenderContext | (() => void);

type PopupSession = SelectionState & {
  doc: Document;
  root: HTMLElement;
  body: HTMLElement;
  unloadWindow?: Window;
  unloadListener?: () => void;
};

type AutoAnnotationJob = {
  id: number;
  annotation: AnnotationContext;
  itemID: number;
  sourceText: string;
};

type ReaderEventGuard = {
  isAlive: () => boolean;
  dispose: () => void;
};

type SelectionTranslationResult = Awaited<
  ReturnType<typeof requestDeepSeekSelectionTranslation>
>;

type RecentSelectionTranslation =
  | {
      status: "pending";
      requestID: number;
      promise: Promise<SelectionTranslationResult>;
    }
  | {
      status: "success";
      requestID: number;
      translatedText: string;
    }
  | {
      status: "error";
      requestID: number;
    };

type RecentReaderSelection = {
  itemID?: number;
  sourceText: string;
  timestamp: number;
  translation?: RecentSelectionTranslation;
};

type ReaderEventRegistry = {
  registerEventListener?: (
    eventName: string,
    handler: (event: ReaderSelectionEvent) => void,
    pluginID: string,
  ) => void;
  unregisterEventListener?: (
    eventName: string,
    handler: (event: ReaderSelectionEvent) => void,
  ) => void;
};

let registered = false;
let itemPaneRegistered = false;
let annotationContextMenuRegistered = false;
let annotationHeaderRegistered = false;
let nextSessionID = 0;
let nextRequestID = 0;
let nextAutoAnnotationJobID = 0;
let activeSession: PopupSession | undefined;
let latestState: SelectionState | undefined;
let autoAnnotationProcessing = false;
const autoAnnotationQueue: AutoAnnotationJob[] = [];
const autoAnnotationRequestTimes: number[] = [];
const recentReaderSelections: RecentReaderSelection[] = [];
const pendingAutoAnnotationItemIDs = new Set<number>();
const itemPaneBodies = new Map<HTMLElement, Zotero.Item | undefined>();
const itemPaneRefreshCallbacks = new Set<() => void>();
let activeSpeech:
  | {
      ownerID: number;
      synth: SpeechSynthesis;
    }
  | undefined;

export function registerSelectionTranslation() {
  if (registered) {
    return;
  }
  if (!Zotero.Reader?.registerEventListener) {
    return;
  }
  Zotero.Reader.registerEventListener(
    "renderTextSelectionPopup",
    handleRenderTextSelectionPopup,
    addon.data.config.addonID,
  );
  try {
    (Zotero.Reader as unknown as ReaderEventRegistry).registerEventListener?.(
      "createAnnotationContextMenu",
      handleCreateAnnotationContextMenu,
      addon.data.config.addonID,
    );
    annotationContextMenuRegistered = true;
  } catch (_error) {
    annotationContextMenuRegistered = false;
  }
  try {
    (Zotero.Reader as unknown as ReaderEventRegistry).registerEventListener?.(
      "renderSidebarAnnotationHeader",
      handleRenderSidebarAnnotationHeader,
      addon.data.config.addonID,
    );
    annotationHeaderRegistered = true;
  } catch (_error) {
    annotationHeaderRegistered = false;
  }
  registerItemPaneSection();
  registered = true;
}

export function unregisterSelectionTranslation() {
  if (!registered) {
    return;
  }
  Zotero.Reader?.unregisterEventListener?.(
    "renderTextSelectionPopup",
    handleRenderTextSelectionPopup,
  );
  if (annotationContextMenuRegistered) {
    (Zotero.Reader as unknown as ReaderEventRegistry).unregisterEventListener?.(
      "createAnnotationContextMenu",
      handleCreateAnnotationContextMenu,
    );
    annotationContextMenuRegistered = false;
  }
  if (annotationHeaderRegistered) {
    (Zotero.Reader as unknown as ReaderEventRegistry).unregisterEventListener?.(
      "renderSidebarAnnotationHeader",
      handleRenderSidebarAnnotationHeader,
    );
    annotationHeaderRegistered = false;
  }
  unregisterItemPaneSection();
  registered = false;
  cleanupActiveSession();
  latestState = undefined;
  autoAnnotationQueue.length = 0;
  autoAnnotationRequestTimes.length = 0;
  recentReaderSelections.length = 0;
  pendingAutoAnnotationItemIDs.clear();
  autoAnnotationProcessing = false;
  itemPaneBodies.clear();
  itemPaneRefreshCallbacks.clear();
}

export function handleSelectionTranslationItemAdded(
  ids: Array<string | number>,
  extraData: { [key: string]: any } = {},
) {
  if (
    !registered ||
    getPref("selectionTranslationAutoTranslateNewAnnotations") !== true
  ) {
    return;
  }
  if (
    ids.length === 0 ||
    ids.length > MAX_AUTO_ANNOTATION_IDS_PER_NOTIFY ||
    ids.length !== 1 ||
    hasSyncImportOrBulkSignal(extraData)
  ) {
    return;
  }

  for (const id of ids) {
    const item = Zotero.Items.get(id);
    if (!isAutoTranslatableAnnotationItem(item)) {
      continue;
    }
    const sourceText = getAnnotationItemSourceText(item);
    if (
      !sourceText ||
      sourceText.length > MAX_SELECTION_LENGTH ||
      !matchesRecentReaderSelection(item, sourceText) ||
      hasExistingAnnotationTranslationBlock(item)
    ) {
      continue;
    }
    if (reuseRecentSelectionTranslationForAnnotation(item, sourceText)) {
      continue;
    }
    enqueueAutoAnnotationTranslation(item, sourceText);
  }
}

function handleCreateAnnotationContextMenu(event: ReaderSelectionEvent) {
  if (event.reader?.type !== "pdf") {
    return;
  }

  const annotation =
    getAnnotationContextFromIDs(event) ?? getAnnotationContext(event);
  const hasAnnotationCandidate = Boolean(
    annotation || getAnnotationPayloadIDs(event).length > 0,
  );
  if (!hasAnnotationCandidate) {
    return;
  }

  let started = false;
  const appendContextMenuItem = event.append as unknown as (
    item: ReaderContextMenuItem,
  ) => void;
  appendContextMenuItem({
    label: getString("selection-translation-sidebar-annotation-action"),
    disabled: annotation?.readOnly,
    onCommand: () => {
      const commandAnnotation =
        getAnnotationContextFromIDs(event) ?? getAnnotationContext(event);
      if (commandAnnotation?.readOnly) {
        return;
      }
      if (started) {
        return;
      }
      started = true;
      void translateAnnotationFromContextMenu(event, commandAnnotation);
    },
  });
}

function handleRenderSidebarAnnotationHeader(event: ReaderSelectionEvent) {
  if (event.reader?.type !== "pdf") {
    return;
  }

  const annotation =
    getAnnotationContextFromIDs(event) ?? getAnnotationContext(event);
  const hasAnnotationCandidate = Boolean(
    annotation || getAnnotationPayloadIDs(event).length > 0,
  );
  if (!hasAnnotationCandidate || typeof event.append !== "function") {
    return;
  }

  const doc = event.doc;
  if (!doc?.createElement) {
    return;
  }
  injectStyles(doc);

  const button = doc.createElement("button");
  button.type = "button";
  button.className = `${ROOT_CLASS}__annotation-header-button`;
  appendImmersiveTranslateButtonContent(
    button,
    getString("selection-translation-annotation-header-action"),
  );
  button.title = getString("selection-translation-annotation-header-action");
  button.setAttribute(
    "aria-label",
    getString("selection-translation-annotation-header-action"),
  );
  if (annotation?.readOnly) {
    button.disabled = true;
  }

  button.addEventListener("click", (event_) => {
    event_.preventDefault();
    event_.stopPropagation();
    const commandAnnotation =
      getAnnotationContextFromIDs(event) ?? getAnnotationContext(event);
    if (!commandAnnotation || commandAnnotation.readOnly) {
      return;
    }
    button.disabled = true;
    void translateAnnotationFromHeader(event, commandAnnotation, button);
  });

  try {
    event.append(button);
  } catch (_error) {
    // Annotation header hooks are runtime-version-sensitive. Keep the context
    // menu as the supported fallback if the header surface rejects our button.
  }
}

function handleRenderTextSelectionPopup(event: ReaderSelectionEvent) {
  if (event.reader?.type !== "pdf") {
    return;
  }

  cleanupActiveSession();
  const selectedText = event.params?.annotation?.text?.trim() || "";
  if (!selectedText) {
    return;
  }
  recordRecentReaderSelection(event, selectedText);

  injectStyles(event.doc);
  const autoTranslate =
    getPref("selectionTranslationAutoTranslateText") === true;
  const entry = createPopupEntry(event, selectedText, autoTranslate);
  event.append(entry);
  if (autoTranslate) {
    startSelectionTranslation(event, selectedText, {
      mount: entry,
      reveal: false,
    });
  }
}

function createPopupEntry(
  event: ReaderSelectionEvent,
  selectedText: string,
  autoTranslate: boolean,
): HTMLElement {
  const entry = event.doc.createElement("span");
  entry.className = `${ROOT_CLASS}__popup-entry`;

  if (autoTranslate) {
    return entry;
  }

  const button = event.doc.createElement("button");
  button.type = "button";
  button.className = `${ROOT_CLASS}__translate-button`;
  appendImmersiveTranslateButtonContent(
    button,
    getString("selection-translation-action"),
  );
  button.addEventListener("click", (event_) => {
    event_.preventDefault();
    event_.stopPropagation();
    button.remove();
    startSelectionTranslation(event, selectedText, {
      mount: entry,
      reveal: false,
    });
  });

  entry.append(button);
  return entry;
}

function startSelectionTranslation(
  event: ReaderSelectionEvent,
  sourceText: string,
  options: {
    mount?: HTMLElement;
    reveal?: boolean;
  } = {},
) {
  cleanupActiveSession();
  injectStyles(event.doc);

  const session = createSession(event, sourceText);
  activeSession = session;
  latestState = toSelectionState(session);
  options.mount?.append(session.root);
  renderPopupSession(session);
  bindReaderUnload(session);
  refreshItemPaneSections();

  if (sourceText.length > MAX_SELECTION_LENGTH) {
    updateSession(session, {
      status: "length",
      message: getString("selection-translation-error-length"),
    });
    return;
  }

  const apiKey =
    `${getPref("selectionTranslationDeepSeekApiKey") || ""}`.trim();
  if (!apiKey) {
    updateSession(session, {
      status: "missing-key",
      message: getString("selection-translation-missing-key"),
    });
    return;
  }

  updateSession(session, {
    status: "loading",
    message: getString("selection-translation-loading"),
  });
  if (options.reveal !== false) {
    revealItemPaneSection(toSelectionState(session));
  }
  void translateForSession(session, apiKey);
}

async function translateAnnotationFromContextMenu(
  event: ReaderSelectionEvent,
  annotation?: AnnotationContext,
) {
  const sourceText = getAnnotationSourceText(event, annotation);
  const state = createSelectionState(event, sourceText, annotation);
  const guard = createReaderEventGuard(event);
  try {
    await translateAnnotationState(state, sourceText, {
      autoWrite: "if-enabled",
      canAutoWrite: () =>
        guard.isAlive() &&
        isCurrentReaderEventRequest(event, state, sourceText),
      isCurrent: () =>
        guard.isAlive() &&
        isCurrentReaderEventRequest(event, state, sourceText),
      reveal: false,
    });
  } finally {
    guard.dispose();
  }
}

async function translateAnnotationFromHeader(
  event: ReaderSelectionEvent,
  annotation: AnnotationContext,
  button: HTMLButtonElement,
) {
  const defaultLabel = getString(
    "selection-translation-annotation-header-action",
  );
  const sourceText = getAnnotationSourceText(event, annotation);
  const state = createSelectionState(event, sourceText, annotation);
  const guard = createReaderEventGuard(event);
  try {
    await translateAnnotationState(state, sourceText, {
      autoWrite: "if-enabled",
      canAutoWrite: () =>
        button.isConnected &&
        guard.isAlive() &&
        isCurrentReaderEventRequest(event, state, sourceText),
      isCurrent: () =>
        button.isConnected &&
        guard.isAlive() &&
        isCurrentReaderEventRequest(event, state, sourceText),
      reveal: false,
      setStatus: (message, disabled) => {
        button.disabled = disabled === true;
        button.title = message || defaultLabel;
        button.setAttribute("aria-label", message || defaultLabel);
      },
    });
  } finally {
    guard.dispose();
    if (button.isConnected) {
      button.disabled = false;
    }
  }
}

async function translateAnnotationState(
  state: SelectionState,
  sourceText: string,
  options: {
    autoWrite?: "if-enabled" | "always";
    autoWriteSuccessKey?: string;
    canAutoWrite?: () => boolean;
    reveal?: boolean;
    setStatus?: (message: string, disabled?: boolean) => void;
    isCurrent: () => boolean;
  },
) {
  const requestedSourceText = sourceText;
  const requestID = ++nextRequestID;
  state.requestID = requestID;
  latestState = state;
  refreshItemPaneSections();

  if (!requestedSourceText) {
    updateLatestState(state, {
      status: "empty",
      message: getString("selection-translation-error-empty"),
    });
    options.setStatus?.(getString("selection-translation-error-empty"));
    return;
  }
  if (requestedSourceText.length > MAX_SELECTION_LENGTH) {
    updateLatestState(state, {
      status: "length",
      message: getString("selection-translation-error-length"),
    });
    options.setStatus?.(getString("selection-translation-error-length"));
    return;
  }

  const apiKey =
    `${getPref("selectionTranslationDeepSeekApiKey") || ""}`.trim();
  if (!apiKey) {
    updateLatestState(state, {
      status: "missing-key",
      message: getString("selection-translation-missing-key"),
    });
    options.setStatus?.(getString("selection-translation-missing-key"));
    return;
  }

  updateLatestState(state, {
    status: "loading",
    message: getString("selection-translation-loading"),
  });
  if (options.reveal === false) {
    refreshItemPaneSections();
  } else {
    revealItemPaneSection(state);
  }
  options.setStatus?.(getString("selection-translation-loading"), true);
  const result = await requestDeepSeekSelectionTranslation({
    apiKey,
    text: requestedSourceText,
    targetLanguage: state.targetLanguage,
    model: state.model,
    thinkingMode: state.thinkingMode,
  }).catch(() => {
    return { ok: false as const, code: "server" as const };
  });
  if (
    !options.isCurrent() ||
    latestState?.requestID !== requestID ||
    state.sourceText !== requestedSourceText
  ) {
    return;
  }
  options.setStatus?.(state.message, false);

  if (!result.ok) {
    const message = getProviderErrorMessage(result.code);
    updateLatestState(state, {
      status: result.code === "empty" ? "empty" : "error",
      message,
    });
    options.setStatus?.(message);
    return;
  }

  updateLatestState(state, {
    status: "success",
    translatedText: result.translation,
    message: getString("selection-translation-success"),
  });
  options.setStatus?.(getString("selection-translation-success"));
  if (options.autoWrite) {
    await maybeAutoWriteAnnotationComment(state, {
      canMutate: () =>
        options.isCurrent() && (options.canAutoWrite?.() ?? true),
      requirePref: options.autoWrite === "if-enabled",
      successKey:
        options.autoWriteSuccessKey ??
        "selection-translation-annotation-auto-write-success",
    });
  }
}

function getAnnotationSourceText(
  event: ReaderSelectionEvent,
  annotationContext?: AnnotationContext,
): string {
  const annotationText = event.params?.annotation?.text?.trim();
  if (annotationText) {
    return annotationText;
  }

  const annotation = annotationContext ?? getAnnotationContext(event);
  if (!annotation) {
    return "";
  }
  const item = getCurrentAnnotationItem(annotation);
  return typeof item?.annotationText === "string"
    ? item.annotationText.trim()
    : "";
}

function createSelectionState(
  event: ReaderSelectionEvent,
  sourceText: string,
  annotationContext?: AnnotationContext,
): SelectionState {
  return {
    id: ++nextSessionID,
    requestID: 0,
    itemID: event.reader?.itemID,
    sourceText,
    translatedText: "",
    targetLanguage: `${getPref("targetLanguage") || "zh-CN"}`,
    model: normalizeSelectionTranslationModel(
      getPref("selectionTranslationModel"),
    ),
    thinkingMode: normalizeSelectionTranslationThinkingMode(
      getPref("selectionTranslationThinkingMode"),
    ),
    status: "idle",
    message: "",
    annotation: annotationContext ?? getAnnotationContext(event),
  };
}

function createSession(
  event: ReaderSelectionEvent,
  sourceText: string,
): PopupSession {
  const doc = event.doc;
  const root = doc.createElement("section");
  root.className = `${ROOT_CLASS}__panel`;
  root.setAttribute("aria-live", "polite");

  const body = doc.createElement("div");
  root.append(body);

  return {
    id: ++nextSessionID,
    requestID: 0,
    itemID: event.reader?.itemID,
    doc,
    sourceText,
    translatedText: "",
    targetLanguage: `${getPref("targetLanguage") || "zh-CN"}`,
    model: normalizeSelectionTranslationModel(
      getPref("selectionTranslationModel"),
    ),
    thinkingMode: normalizeSelectionTranslationThinkingMode(
      getPref("selectionTranslationThinkingMode"),
    ),
    status: "idle",
    message: "",
    annotation: getAnnotationContext(event),
    root,
    body,
  };
}

function getAnnotationContext(
  event: ReaderSelectionEvent,
): AnnotationContext | undefined {
  const annotation = event.params?.annotation;
  if (
    !annotation ||
    typeof annotation.libraryID !== "number" ||
    !annotation.key
  ) {
    return undefined;
  }

  return {
    key: annotation.key,
    libraryID: annotation.libraryID,
    itemID: getAnnotationItemID(annotation.libraryID, annotation.key),
    readOnly: annotation.readOnly === true,
    reader: event.reader,
  };
}

function getAnnotationContextFromIDs(
  event: ReaderSelectionEvent,
): AnnotationContext | undefined {
  const item = getAnnotationPayloadIDs(event)
    .map((id) => getAnnotationItemFromPayloadID(event, id))
    .find((candidate) => candidate?.isAnnotation());
  if (!item?.isAnnotation()) {
    return undefined;
  }
  return {
    key: item.key,
    libraryID: item.libraryID,
    itemID: item.id,
    readOnly: !item.isEditable("edit"),
    reader: event.reader,
  };
}

function getAnnotationPayloadIDs(
  event: ReaderSelectionEvent,
): Array<number | string> {
  const ids = event.params?.ids ?? [];
  const currentID = event.params?.currentID;
  const annotation = event.params?.annotation;
  return [
    currentID,
    event.params?.id,
    event.params?.annotationID,
    annotation?.itemID,
    annotation?.id,
    ...ids,
  ].filter(
    (id): id is number | string =>
      typeof id === "number" || typeof id === "string",
  );
}

function getAnnotationItemFromPayloadID(
  event: ReaderSelectionEvent,
  id: number | string,
): Zotero.Item | undefined {
  if (typeof id === "number") {
    return Zotero.Items.get(id);
  }

  const numericID = Number(id);
  if (Number.isInteger(numericID)) {
    const item = Zotero.Items.get(numericID);
    if (item?.isAnnotation()) {
      return item;
    }
  }

  const annotationItemIDs = event.reader?.annotationItemIDs ?? [];
  return annotationItemIDs
    .map((itemID) => Zotero.Items.get(itemID))
    .find((item) => item?.isAnnotation() && item.key === id);
}

function getAnnotationItemID(
  libraryID: number,
  key: string,
): number | undefined {
  const item = Zotero.Items.getByLibraryAndKey(libraryID, key);
  return item ? item.id : undefined;
}

function hasSyncImportOrBulkSignal(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== "object" || depth > 2) {
    return false;
  }
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nestedValue]) => {
      const normalizedKey = key.toLowerCase();
      const hasGuardedKey = ["sync", "import", "bulk", "restore"].some(
        (guardedKey) => normalizedKey.includes(guardedKey),
      );
      if (
        hasGuardedKey &&
        nestedValue !== false &&
        nestedValue !== undefined &&
        nestedValue !== null
      ) {
        return true;
      }
      return hasSyncImportOrBulkSignal(nestedValue, depth + 1);
    },
  );
}

function reserveAutoAnnotationRequestSlot(): boolean {
  const now = Date.now();
  while (
    autoAnnotationRequestTimes.length > 0 &&
    now - autoAnnotationRequestTimes[0] > AUTO_ANNOTATION_REQUEST_WINDOW_MS
  ) {
    autoAnnotationRequestTimes.shift();
  }
  if (
    autoAnnotationRequestTimes.length >= MAX_AUTO_ANNOTATION_REQUESTS_PER_WINDOW
  ) {
    return false;
  }
  autoAnnotationRequestTimes.push(now);
  return true;
}

function recordRecentReaderSelection(
  event: ReaderSelectionEvent,
  sourceText: string,
): RecentReaderSelection {
  pruneRecentReaderSelections();
  const selection = {
    itemID: event.reader?.itemID,
    sourceText,
    timestamp: Date.now(),
  };
  recentReaderSelections.push(selection);
  if (recentReaderSelections.length > MAX_RECENT_READER_SELECTIONS) {
    recentReaderSelections.splice(
      0,
      recentReaderSelections.length - MAX_RECENT_READER_SELECTIONS,
    );
  }
  return selection;
}

function matchesRecentReaderSelection(
  item: Zotero.Item,
  sourceText: string,
): boolean {
  pruneRecentReaderSelections();
  const parentID = getItemParentID(item);
  if (typeof parentID !== "number") {
    return false;
  }
  return recentReaderSelections.some((selection) => {
    return selection.itemID === parentID && selection.sourceText === sourceText;
  });
}

function getRecentReaderSelectionForAnnotation(
  item: Zotero.Item,
  sourceText: string,
): RecentReaderSelection | undefined {
  pruneRecentReaderSelections();
  const parentID = getItemParentID(item);
  if (typeof parentID !== "number") {
    return undefined;
  }
  return [...recentReaderSelections].reverse().find((selection) => {
    return selection.itemID === parentID && selection.sourceText === sourceText;
  });
}

function getRecentReaderSelectionForSession(
  session: PopupSession,
): RecentReaderSelection | undefined {
  pruneRecentReaderSelections();
  return [...recentReaderSelections].reverse().find((selection) => {
    return (
      selection.itemID === session.itemID &&
      selection.sourceText === session.sourceText
    );
  });
}

function pruneRecentReaderSelections() {
  const cutoff = Date.now() - RECENT_READER_SELECTION_WINDOW_MS;
  while (
    recentReaderSelections.length > 0 &&
    recentReaderSelections[0].timestamp < cutoff
  ) {
    recentReaderSelections.shift();
  }
}

function isAutoTranslatableAnnotationItem(
  item: Zotero.Item | undefined,
): item is Zotero.Item {
  return Boolean(item?.isAnnotation() && item.isEditable("edit"));
}

function getAnnotationItemSourceText(item: Zotero.Item): string {
  return typeof item.annotationText === "string"
    ? item.annotationText.trim()
    : "";
}

function reuseRecentSelectionTranslationForAnnotation(
  item: Zotero.Item,
  sourceText: string,
): boolean {
  const selection = getRecentReaderSelectionForAnnotation(item, sourceText);
  const translation = selection?.translation;
  if (!translation) {
    return false;
  }
  if (translation.status === "success") {
    void writeReusedSelectionTranslationToAnnotation(
      item,
      sourceText,
      translation.translatedText,
    );
    return true;
  }
  if (translation.status === "error") {
    return true;
  }
  if (translation.status !== "pending") {
    return false;
  }
  if (pendingAutoAnnotationItemIDs.has(item.id)) {
    return true;
  }
  pendingAutoAnnotationItemIDs.add(item.id);
  void translation.promise
    .then(async (result) => {
      if (!result.ok) {
        return;
      }
      const currentSelection = getRecentReaderSelectionForAnnotation(
        item,
        sourceText,
      );
      if (currentSelection?.translation?.requestID !== translation.requestID) {
        await writeCurrentSelectionTranslationToAnnotation(item, sourceText);
        return;
      }
      if (
        currentSelection.translation.status !== "success" ||
        currentSelection.translation.translatedText !== result.translation
      ) {
        return;
      }
      await writeReusedSelectionTranslationToAnnotation(
        item,
        sourceText,
        result.translation,
      );
    })
    .finally(() => {
      pendingAutoAnnotationItemIDs.delete(item.id);
    });
  return true;
}

async function writeCurrentSelectionTranslationToAnnotation(
  item: Zotero.Item,
  sourceText: string,
) {
  const currentSelection = getRecentReaderSelectionForAnnotation(
    item,
    sourceText,
  );
  const translation = currentSelection?.translation;
  if (!translation) {
    return;
  }
  if (translation.status === "success") {
    await writeReusedSelectionTranslationToAnnotation(
      item,
      sourceText,
      translation.translatedText,
    );
    return;
  }
  if (translation.status !== "pending") {
    return;
  }
  const result = await translation.promise;
  if (!result.ok) {
    return;
  }
  const latestSelection = getRecentReaderSelectionForAnnotation(
    item,
    sourceText,
  );
  if (
    latestSelection?.translation?.status !== "success" ||
    latestSelection.translation.requestID !== translation.requestID ||
    latestSelection.translation.translatedText !== result.translation
  ) {
    return;
  }
  await writeReusedSelectionTranslationToAnnotation(
    item,
    sourceText,
    result.translation,
  );
}

async function writeReusedSelectionTranslationToAnnotation(
  item: Zotero.Item,
  sourceText: string,
  translatedText: string,
) {
  if (
    getPref("selectionTranslationAutoTranslateNewAnnotations") !== true ||
    !isAutoTranslatableAnnotationItem(item) ||
    getAnnotationItemSourceText(item) !== sourceText ||
    !matchesRecentReaderSelection(item, sourceText) ||
    hasExistingAnnotationTranslationBlock(item)
  ) {
    return;
  }
  const state = createAutoAnnotationStateFromItem(
    item,
    sourceText,
    getString("selection-translation-success"),
  );
  state.status = "success";
  state.translatedText = translatedText;
  latestState = state;
  refreshItemPaneSections();
  await maybeAutoWriteAnnotationComment(state, {
    requirePref: false,
    successKey: "selection-translation-new-annotation-auto-translate-success",
    canMutate: () =>
      getPref("selectionTranslationAutoTranslateNewAnnotations") === true &&
      isAutoTranslatableAnnotationItem(item) &&
      getAnnotationItemSourceText(item) === sourceText &&
      !hasExistingAnnotationTranslationBlock(item),
  });
}

function enqueueAutoAnnotationTranslation(
  item: Zotero.Item,
  sourceText: string,
) {
  if (
    pendingAutoAnnotationItemIDs.has(item.id) ||
    autoAnnotationQueue.length >= MAX_AUTO_ANNOTATION_QUEUE_SIZE ||
    !reserveAutoAnnotationRequestSlot()
  ) {
    return;
  }
  pendingAutoAnnotationItemIDs.add(item.id);
  autoAnnotationQueue.push({
    id: ++nextAutoAnnotationJobID,
    annotation: createAnnotationContextFromItem(item),
    itemID: item.id,
    sourceText,
  });
  void processAutoAnnotationQueue();
}

async function processAutoAnnotationQueue() {
  if (autoAnnotationProcessing) {
    return;
  }
  autoAnnotationProcessing = true;
  try {
    while (registered && autoAnnotationQueue.length > 0) {
      const job = autoAnnotationQueue.shift();
      if (!job) {
        continue;
      }
      try {
        await processAutoAnnotationJob(job);
      } finally {
        pendingAutoAnnotationItemIDs.delete(job.itemID);
      }
      if (registered && autoAnnotationQueue.length > 0) {
        await Zotero.Promise.delay(AUTO_ANNOTATION_REQUEST_DELAY_MS);
      }
    }
  } finally {
    autoAnnotationProcessing = false;
  }
}

async function processAutoAnnotationJob(job: AutoAnnotationJob) {
  if (getPref("selectionTranslationAutoTranslateNewAnnotations") !== true) {
    return;
  }
  const item = Zotero.Items.get(job.itemID);
  if (!isAutoTranslatableAnnotationItem(item)) {
    return;
  }
  if (
    getAnnotationItemSourceText(item) !== job.sourceText ||
    !matchesRecentReaderSelection(item, job.sourceText) ||
    hasExistingAnnotationTranslationBlock(item)
  ) {
    return;
  }

  const state = createAutoAnnotationState(job, item);
  await translateAnnotationState(state, job.sourceText, {
    autoWrite: "always",
    autoWriteSuccessKey:
      "selection-translation-new-annotation-auto-translate-success",
    canAutoWrite: () => isAutoAnnotationJobCurrent(job, state),
    isCurrent: () => isAutoAnnotationJobCurrent(job, state),
    reveal: false,
  });
}

function createAutoAnnotationState(
  job: AutoAnnotationJob,
  item: Zotero.Item,
): SelectionState {
  return createAutoAnnotationStateFromItem(
    item,
    job.sourceText,
    getString("selection-translation-new-annotation-loading"),
    job.annotation,
  );
}

function createAutoAnnotationStateFromItem(
  item: Zotero.Item,
  sourceText: string,
  message: string,
  annotation = createAnnotationContextFromItem(item),
): SelectionState {
  return {
    id: ++nextSessionID,
    requestID: 0,
    itemID: getItemParentID(item) ?? item.id,
    sourceText,
    translatedText: "",
    targetLanguage: `${getPref("targetLanguage") || "zh-CN"}`,
    model: normalizeSelectionTranslationModel(
      getPref("selectionTranslationModel"),
    ),
    thinkingMode: normalizeSelectionTranslationThinkingMode(
      getPref("selectionTranslationThinkingMode"),
    ),
    status: "idle",
    message,
    annotation,
  };
}

function isAutoAnnotationJobCurrent(
  job: AutoAnnotationJob,
  state: SelectionState,
): boolean {
  if (
    !registered ||
    latestState?.id !== state.id ||
    getPref("selectionTranslationAutoTranslateNewAnnotations") !== true
  ) {
    return false;
  }
  const item = Zotero.Items.get(job.itemID);
  return (
    isAutoTranslatableAnnotationItem(item) &&
    getAnnotationItemSourceText(item) === job.sourceText &&
    !hasExistingAnnotationTranslationBlock(item)
  );
}

function createAnnotationContextFromItem(item: Zotero.Item): AnnotationContext {
  return {
    key: item.key,
    libraryID: item.libraryID,
    itemID: item.id,
    readOnly: !item.isEditable("edit"),
  };
}

function getItemParentID(item: Zotero.Item): number | undefined {
  const parentedItem = item as Zotero.Item & {
    parentID?: number;
    parentItemID?: number;
  };
  return parentedItem.parentItemID ?? parentedItem.parentID;
}

async function translateForSession(session: PopupSession, apiKey: string) {
  const requestedModel = session.model;
  const requestedThinkingMode = session.thinkingMode;
  const requestedTargetLanguage = session.targetLanguage;
  const requestedSourceText = session.sourceText;
  const requestID = ++nextRequestID;
  session.requestID = requestID;
  latestState = toSelectionState(session);
  refreshItemPaneSections();
  const requestPromise = requestDeepSeekSelectionTranslation({
    apiKey,
    text: requestedSourceText,
    targetLanguage: requestedTargetLanguage,
    model: requestedModel,
    thinkingMode: requestedThinkingMode,
  }).catch(() => {
    return { ok: false as const, code: "server" as const };
  });
  recordRecentSelectionTranslationPending(session, requestID, requestPromise);
  const result = await requestPromise;
  recordRecentSelectionTranslationResult(session, requestID, result);

  if (
    !isActive(session) ||
    session.requestID !== requestID ||
    session.sourceText !== requestedSourceText
  ) {
    return;
  }

  if (!result.ok) {
    updateSession(session, {
      status: result.code === "empty" ? "empty" : "error",
      message: getProviderErrorMessage(result.code),
    });
    return;
  }

  updateSession(session, {
    status: "success",
    translatedText: result.translation,
    message: getString("selection-translation-success"),
    model: requestedModel,
    thinkingMode: requestedThinkingMode,
    targetLanguage: requestedTargetLanguage,
  });
}

function updateSession(
  session: PopupSession,
  patch: Partial<
    Pick<
      PopupSession,
      | "sourceText"
      | "status"
      | "translatedText"
      | "message"
      | "model"
      | "thinkingMode"
      | "targetLanguage"
    >
  >,
) {
  Object.assign(session, patch);
  latestState = toSelectionState(session);
  renderPopupSession(session);
  refreshItemPaneSections();
}

function renderPopupSession(session: PopupSession) {
  session.body.replaceChildren();
  const status = session.doc.createElement("span");
  status.className = `${ROOT_CLASS}__popup-status`;
  status.textContent = session.message || getStatusText(session.status);
  session.body.append(status);

  if (!session.translatedText) {
    return;
  }

  const result = session.doc.createElement("div");
  result.className = `${ROOT_CLASS}__popup-result`;
  result.textContent = session.translatedText;
  result.tabIndex = 0;

  const copyButton = session.doc.createElement("button");
  copyButton.type = "button";
  copyButton.className = `${ROOT_CLASS}__popup-copy-button`;
  copyButton.textContent = getString("selection-translation-copy");
  copyButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    copyTranslatedText(session);
  });

  session.body.append(result, copyButton);
}

function recordRecentSelectionTranslationPending(
  session: PopupSession,
  requestID: number,
  promise: Promise<SelectionTranslationResult>,
) {
  const selection = getRecentReaderSelectionForSession(session);
  if (!selection) {
    return;
  }
  selection.timestamp = Date.now();
  selection.translation = {
    status: "pending",
    requestID,
    promise,
  };
}

function recordRecentSelectionTranslationResult(
  session: PopupSession,
  requestID: number,
  result: SelectionTranslationResult,
) {
  const selection = getRecentReaderSelectionForSession(session);
  if (!selection || selection.translation?.requestID !== requestID) {
    return;
  }
  selection.timestamp = Date.now();
  if (result.ok) {
    selection.translation = {
      status: "success",
      requestID,
      translatedText: result.translation,
    };
    return;
  }
  selection.translation = {
    status: "error",
    requestID,
  };
}

function toSelectionState(session: PopupSession): SelectionState {
  return {
    id: session.id,
    requestID: session.requestID,
    itemID: session.itemID,
    sourceText: session.sourceText,
    translatedText: session.translatedText,
    targetLanguage: session.targetLanguage,
    model: session.model,
    thinkingMode: session.thinkingMode,
    status: session.status,
    message: session.message,
    annotation: session.annotation,
  };
}

function getStateDocument(state: SelectionState): Document {
  if ("doc" in state) {
    return (state as PopupSession).doc;
  }
  return Zotero.getMainWindow().document;
}

function isAnnotationAutoWriteEnabled(): boolean {
  return getPref("selectionTranslationAutoWriteAnnotationComment") === true;
}

function canWriteAnnotationCommentState(state: SelectionState): boolean {
  if (!state.annotation || state.annotation.readOnly || !state.translatedText) {
    return false;
  }
  return true;
}

async function writeTranslationToAnnotationCommentState(
  state: SelectionState,
  options: {
    canMutate?: () => boolean;
    successKey?: string;
  } = {},
): Promise<boolean> {
  if (!state.translatedText.trim()) {
    setStateMessage(state, getString("selection-translation-annotation-error"));
    return false;
  }
  if (!state.annotation) {
    setStateMessage(
      state,
      getString("selection-translation-annotation-unavailable"),
    );
    return false;
  }
  const item = getCurrentAnnotationItem(state.annotation);
  if (!item) {
    setStateMessage(
      state,
      getString("selection-translation-annotation-unavailable"),
    );
    return false;
  }
  const previousComment = item.annotationComment || "";
  const nextComment = buildAnnotationComment(
    previousComment,
    state.translatedText,
  );
  if (!nextComment.ok) {
    setStateMessage(
      state,
      getString("selection-translation-annotation-marker-error"),
    );
    return false;
  }
  if (options.canMutate && !options.canMutate()) {
    return false;
  }

  return saveAnnotationChange(
    state,
    item,
    () => {
      item.annotationComment = nextComment.comment;
    },
    () => {
      item.annotationComment = previousComment;
    },
    options.successKey ?? "selection-translation-annotation-success",
    options.canMutate,
  );
}

async function maybeAutoWriteAnnotationComment(
  state: SelectionState,
  options: {
    canMutate?: () => boolean;
    requirePref: boolean;
    successKey: string;
  },
): Promise<boolean> {
  if (options.requirePref && !isAnnotationAutoWriteEnabled()) {
    return false;
  }
  if (!canWriteAnnotationCommentState(state)) {
    return false;
  }
  return writeTranslationToAnnotationCommentState(state, {
    canMutate: options.canMutate,
    successKey: options.successKey,
  });
}

async function saveAnnotationChange(
  state: SelectionState,
  item: Zotero.Item,
  apply: () => void,
  rollback: () => void,
  successKey: string,
  canMutate?: () => boolean,
): Promise<boolean> {
  try {
    if (canMutate && !canMutate()) {
      return false;
    }
    apply();
    const saveResult = await item.saveTx();
    if (saveResult === false) {
      rollback();
      setStateMessage(
        state,
        getString("selection-translation-annotation-error"),
      );
      return false;
    }
    try {
      state.annotation?.reader?.setAnnotations?.([item]);
    } catch (_refreshError) {
      // Zotero notifiers should still persist the saved annotation change.
    }
    setStateMessage(state, getString(successKey));
    return true;
  } catch (_error) {
    rollback();
    setStateMessage(state, getString("selection-translation-annotation-error"));
    return false;
  }
}

function getCurrentAnnotationItem(
  annotation: AnnotationContext,
): Zotero.Item | undefined {
  const item =
    typeof annotation.itemID === "number"
      ? Zotero.Items.get(annotation.itemID)
      : Zotero.Items.getByLibraryAndKey(annotation.libraryID, annotation.key);
  if (!item || !item.isAnnotation() || !item.isEditable("edit")) {
    return undefined;
  }
  if (
    annotation.reader?.annotationItemIDs &&
    !annotation.reader.annotationItemIDs.includes(item.id)
  ) {
    return undefined;
  }
  return item;
}

function buildAnnotationComment(
  currentComment: string,
  translatedText: string,
): { ok: true; comment: string } | { ok: false } {
  const normalizedTranslation = translatedText.replace(/\r\n?/g, "\n");
  if (containsExactMarkerLine(normalizedTranslation)) {
    return { ok: false };
  }

  const normalizedComment = currentComment.replace(/\r\n?/g, "\n");
  const lines = normalizedComment ? normalizedComment.split("\n") : [];
  const blocks = getAnnotationTranslationBlocks(lines);
  if (!blocks.ok) {
    return { ok: false };
  }

  const blockLines = [
    ANNOTATION_BLOCK_START,
    normalizedTranslation,
    ANNOTATION_BLOCK_END,
  ];

  if (blocks.blocks.length === 0) {
    const block = blockLines.join("\n");
    return {
      ok: true,
      comment: normalizedComment ? `${normalizedComment}\n\n${block}` : block,
    };
  }

  const output: string[] = [];
  let blockIndex = 0;
  for (let index = 0; index < lines.length; index++) {
    const block = blocks.blocks[blockIndex];
    if (block && index === block.start) {
      if (blockIndex === 0) {
        output.push(...blockLines);
      }
      index = block.end;
      blockIndex++;
      continue;
    }
    output.push(lines[index]);
  }

  return { ok: true, comment: output.join("\n") };
}

function containsExactMarkerLine(text: string): boolean {
  return text.split("\n").some((line) => {
    return line === ANNOTATION_BLOCK_START || line === ANNOTATION_BLOCK_END;
  });
}

function getAnnotationTranslationBlocks(
  lines: string[],
): { ok: true; blocks: Array<{ start: number; end: number }> } | { ok: false } {
  const blocks: Array<{ start: number; end: number }> = [];
  let openStart: number | undefined;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (line === ANNOTATION_BLOCK_START) {
      if (openStart !== undefined) {
        return { ok: false };
      }
      openStart = index;
      continue;
    }
    if (line === ANNOTATION_BLOCK_END) {
      if (openStart === undefined) {
        return { ok: false };
      }
      blocks.push({ start: openStart, end: index });
      openStart = undefined;
    }
  }

  if (openStart !== undefined) {
    return { ok: false };
  }
  return { ok: true, blocks };
}

function hasExistingAnnotationTranslationBlock(item: Zotero.Item): boolean {
  const currentComment = item.annotationComment || "";
  const normalizedComment = currentComment.replace(/\r\n?/g, "\n");
  const lines = normalizedComment ? normalizedComment.split("\n") : [];
  const blocks = getAnnotationTranslationBlocks(lines);
  return !blocks.ok || blocks.blocks.length > 0;
}

function retry(session: PopupSession) {
  const sourceText = session.sourceText.trim();
  if (!sourceText) {
    updateSession(session, {
      sourceText,
      translatedText: "",
      status: "empty",
      message: getString("selection-translation-error-empty"),
    });
    return;
  }
  if (sourceText.length > MAX_SELECTION_LENGTH) {
    updateSession(session, {
      sourceText,
      translatedText: "",
      status: "length",
      message: getString("selection-translation-error-length"),
    });
    return;
  }
  const apiKey =
    `${getPref("selectionTranslationDeepSeekApiKey") || ""}`.trim();
  if (!apiKey) {
    updateSession(session, {
      status: "missing-key",
      message: getString("selection-translation-missing-key"),
    });
    return;
  }
  session.targetLanguage = `${getPref("targetLanguage") || "zh-CN"}`;
  session.sourceText = sourceText;
  session.model = normalizeSelectionTranslationModel(
    getPref("selectionTranslationModel"),
  );
  session.thinkingMode = normalizeSelectionTranslationThinkingMode(
    getPref("selectionTranslationThinkingMode"),
  );
  updateSession(session, {
    status: "loading",
    translatedText: "",
    message: getString("selection-translation-loading"),
  });
  void translateForSession(session, apiKey);
}

function translateStateFromItemPane(state: SelectionState, sourceText: string) {
  const normalizedSource = sourceText.trim();
  if (activeSession?.id === state.id) {
    updateSession(activeSession, {
      sourceText: normalizedSource,
      translatedText: "",
    });
    retry(activeSession);
    return;
  }

  const nextState = {
    ...state,
    sourceText: normalizedSource,
    translatedText: "",
    targetLanguage: `${getPref("targetLanguage") || "zh-CN"}`,
    model: normalizeSelectionTranslationModel(
      getPref("selectionTranslationModel"),
    ),
    thinkingMode: normalizeSelectionTranslationThinkingMode(
      getPref("selectionTranslationThinkingMode"),
    ),
    status: "idle" as const,
    message: "",
  };
  void translateAnnotationState(nextState, normalizedSource, {
    isCurrent: () => latestState?.id === nextState.id,
  });
}

function copyTranslatedText(state: SelectionState) {
  if (!state.translatedText) {
    setStateMessage(state, getString("selection-translation-copy-error"));
    return;
  }
  try {
    new ztoolkit.Clipboard()
      .addText(state.translatedText, "text/unicode")
      .copy();
    setStateMessage(state, getString("selection-translation-copy-success"));
  } catch (_error) {
    setStateMessage(state, getString("selection-translation-copy-error"));
  }
}

function toggleReadAloud(state: SelectionState) {
  const doc = getStateDocument(state);
  const speechSynthesis = doc.defaultView?.speechSynthesis;
  const sessionWindow = doc.defaultView as
    | (Window & {
        SpeechSynthesisUtterance?: typeof SpeechSynthesisUtterance;
      })
    | null;
  const SpeechSynthesisUtteranceCtor =
    sessionWindow?.SpeechSynthesisUtterance ??
    globalThis.SpeechSynthesisUtterance;
  if (!speechSynthesis || !SpeechSynthesisUtteranceCtor) {
    setStateMessage(
      state,
      getString("selection-translation-read-aloud-unavailable"),
    );
    return;
  }

  if (activeSpeech?.ownerID === state.id) {
    activeSpeech.synth.cancel();
    activeSpeech = undefined;
    return;
  }

  cleanupSpeech();
  const utterance = new SpeechSynthesisUtteranceCtor(state.translatedText);
  utterance.lang = state.targetLanguage;
  const localVoice = findLocalSpeechVoice(
    speechSynthesis,
    state.targetLanguage,
  );
  if (!localVoice) {
    setStateMessage(
      state,
      getString("selection-translation-read-aloud-unavailable"),
    );
    return;
  }
  utterance.voice = localVoice;
  utterance.onerror = () => {
    setStateMessage(state, getString("selection-translation-read-aloud-error"));
  };
  utterance.onend = () => {
    if (activeSpeech?.ownerID === state.id) {
      activeSpeech = undefined;
    }
  };
  activeSpeech = { ownerID: state.id, synth: speechSynthesis };
  speechSynthesis.speak(utterance);
}

function findLocalSpeechVoice(
  speechSynthesis: SpeechSynthesis,
  targetLanguage: string,
): SpeechSynthesisVoice | undefined {
  const normalizedTargetLanguage = targetLanguage.toLowerCase();
  const targetLanguageBase = normalizedTargetLanguage.split("-")[0];
  const localVoices = speechSynthesis.getVoices().filter((voice) => {
    return voice.localService === true;
  });
  return (
    localVoices.find((voice) => {
      const normalizedVoiceLanguage = voice.lang.toLowerCase();
      return (
        normalizedVoiceLanguage === normalizedTargetLanguage ||
        normalizedVoiceLanguage.startsWith(`${targetLanguageBase}-`)
      );
    }) || localVoices[0]
  );
}

function setStateMessage(state: SelectionState, message: string) {
  state.message = message;
  if (activeSession?.id === state.id) {
    updateSession(activeSession, { message });
    return;
  }
  if (latestState?.id === state.id) {
    latestState = { ...latestState, message };
    refreshItemPaneSections();
  }
}

function updateLatestState(
  state: SelectionState,
  patch: Partial<
    Pick<
      SelectionState,
      | "sourceText"
      | "status"
      | "translatedText"
      | "message"
      | "model"
      | "thinkingMode"
      | "targetLanguage"
    >
  >,
) {
  if (latestState?.id !== state.id) {
    return;
  }
  Object.assign(state, patch);
  latestState = { ...state };
  refreshItemPaneSections();
}

function registerItemPaneSection() {
  const itemPaneManager = (
    Zotero as unknown as {
      ItemPaneManager?: {
        registerSection?: (options: unknown) => void;
        unregisterSection?: (id: string) => void;
      };
    }
  ).ItemPaneManager;
  if (!itemPaneManager?.registerSection || itemPaneRegistered) {
    return;
  }

  try {
    itemPaneManager.registerSection({
      paneID: ITEM_PANE_SECTION_ID,
      pluginID: addon.data.config.addonID,
      header: {
        l10nID: "selection-translation-title",
        icon: getImmersiveTranslateIconURL(),
      },
      sidenav: {
        l10nID: "selection-translation-title",
        icon: getImmersiveTranslateIconURL(),
      },
      onInit: (context: ItemPaneInitContext) => {
        registerItemPaneRefreshCallback(context);
        if (typeof context !== "function" && context.body) {
          itemPaneBodies.set(context.body, context.item);
          renderItemPaneBody(context.body, context.item);
        }
      },
      onDestroy: ({ body }: ItemPaneSectionRenderContext) => {
        if (body) {
          itemPaneBodies.delete(body);
        }
      },
      onRender: ({ body, item }: ItemPaneSectionRenderContext) => {
        if (body) {
          itemPaneBodies.set(body, item);
          renderItemPaneBody(body, item);
        }
      },
      onItemChange: ({ body, item }: ItemPaneSectionRenderContext) => {
        if (body) {
          itemPaneBodies.set(body, item);
          renderItemPaneBody(body, item);
        }
      },
    });
    itemPaneRegistered = true;
  } catch (_error) {
    itemPaneRegistered = false;
  }
}

function unregisterItemPaneSection() {
  const itemPaneManager = (
    Zotero as unknown as {
      ItemPaneManager?: { unregisterSection?: (id: string) => void };
    }
  ).ItemPaneManager;
  if (!itemPaneRegistered) {
    return;
  }
  try {
    itemPaneManager?.unregisterSection?.(ITEM_PANE_SECTION_ID);
  } catch (_error) {
    // Zotero will remove plugin UI on shutdown if explicit unregister is absent.
  }
  itemPaneRegistered = false;
  itemPaneBodies.clear();
  itemPaneRefreshCallbacks.clear();
}

function refreshItemPaneSections() {
  itemPaneRefreshCallbacks.forEach((refresh) => {
    try {
      refresh();
    } catch (_error) {
      itemPaneRefreshCallbacks.delete(refresh);
    }
  });
  itemPaneBodies.forEach((item, body) => renderItemPaneBody(body, item));
}

function revealItemPaneSection(state: SelectionState) {
  try {
    state.annotation?.reader?.focus?.();
  } catch (_error) {
    // Zotero Reader focus APIs are internal and version-sensitive. Translation
    // must continue even if focusing the Reader surface is unavailable.
  }
  refreshItemPaneSections();
  itemPaneBodies.forEach((item, body) => {
    if (canRenderStateForItemPane(state, item)) {
      revealItemPaneBody(body);
    }
  });
}

function revealItemPaneBody(body: HTMLElement) {
  try {
    const itemDetails = body.closest("item-details") as
      | (HTMLElement & {
          scrollToPane?: (paneID: string, behavior?: ScrollBehavior) => void;
        })
      | null;
    itemDetails?.scrollToPane?.(ITEM_PANE_SECTION_ID, "smooth");

    const section = body.closest(
      `collapsible-section[data-pane="${ITEM_PANE_SECTION_ID}"]`,
    ) as (HTMLElement & { open?: boolean }) | null;
    if (section && "open" in section) {
      section.open = true;
    }
    section?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  } catch (_error) {
    // Reader item pane reveal APIs are internal and may differ by Zotero build.
    // Do not fall back to main Zotero item pane selection.
  }
}

function registerItemPaneRefreshCallback(context: ItemPaneInitContext) {
  const refresh = typeof context === "function" ? context : context.refresh;
  if (typeof refresh === "function") {
    itemPaneRefreshCallbacks.add(refresh);
  }
}

function renderItemPaneBody(body: HTMLElement, item?: Zotero.Item) {
  const doc = body.ownerDocument;
  if (!doc) {
    return;
  }
  injectStyles(doc);
  body.replaceChildren();
  body.classList.add(`${ROOT_CLASS}__item-pane`);

  const state = latestState;
  if (!state || !canRenderStateForItemPane(state, item)) {
    const empty = doc.createElement("p");
    empty.textContent = getString("selection-translation-item-pane-empty");
    body.append(empty);
    return;
  }

  const status = doc.createElement("p");
  status.className = `${ROOT_CLASS}__status`;
  status.textContent = state.message || getStatusText(state.status);

  const sourceEditor = createItemPaneSourceEditor(doc, state);

  body.append(
    status,
    createItemPaneMetadata(doc, state),
    sourceEditor.block,
    createItemPaneBlock(
      doc,
      "selection-translation-result",
      state.translatedText || getStatusText(state.status),
    ),
  );

  body.append(createItemPaneActions(doc, state, sourceEditor.input));
}

function canRenderStateForItemPane(
  state: SelectionState,
  item: Zotero.Item | undefined,
): boolean {
  if (!item || typeof state.itemID !== "number") {
    return false;
  }
  if (state.itemID === item.id) {
    return true;
  }

  const stateItem = Zotero.Items.get(state.itemID);
  if (isChildItemOf(stateItem, item.id)) {
    return true;
  }
  const annotationItem = state.annotation
    ? getCurrentAnnotationItem(state.annotation)
    : undefined;
  return isChildItemOf(annotationItem, item.id);
}

function createReaderEventGuard(event: ReaderSelectionEvent): ReaderEventGuard {
  const win = event.doc.defaultView;
  let alive = Boolean(win && !win.closed);
  const markDead = () => {
    alive = false;
  };
  win?.addEventListener("pagehide", markDead, { once: true });
  win?.addEventListener("unload", markDead, { once: true });
  return {
    isAlive: () =>
      alive &&
      registered &&
      Boolean(win && !win.closed && event.doc.defaultView === win),
    dispose: () => {
      win?.removeEventListener("pagehide", markDead);
      win?.removeEventListener("unload", markDead);
      alive = false;
    },
  };
}

function isCurrentReaderEventRequest(
  event: ReaderSelectionEvent,
  state: SelectionState,
  sourceText: string,
): boolean {
  const win = event.doc.defaultView;
  const annotation = state.annotation
    ? getCurrentAnnotationItem(state.annotation)
    : undefined;
  return Boolean(
    registered &&
      latestState?.id === state.id &&
      win &&
      !win.closed &&
      (!annotation || getAnnotationItemSourceText(annotation) === sourceText),
  );
}

function isChildItemOf(
  item: Zotero.Item | undefined,
  parentID: number,
): boolean {
  const childItem = item as
    | (Zotero.Item & { parentItemID?: number })
    | undefined;
  return childItem?.parentItemID === parentID;
}

function createItemPaneMetadata(
  doc: Document,
  state: SelectionState,
): HTMLElement {
  const metadata = doc.createElement("p");
  metadata.className = `${ROOT_CLASS}__metadata`;
  metadata.textContent = `${getString("selection-translation-target-language")}: ${state.targetLanguage} · DeepSeek ${state.model} · ${getString(`selection-translation-thinking-mode-${state.thinkingMode}`)}`;
  return metadata;
}

function createItemPaneBlock(
  doc: Document,
  labelKey: string,
  value: string,
): HTMLElement {
  const block = doc.createElement("section");
  block.className = `${ROOT_CLASS}__item-pane-block`;
  const label = doc.createElement("strong");
  label.textContent = getString(labelKey);
  const content = doc.createElement("div");
  content.textContent = value;
  block.append(label, content);
  return block;
}

function createItemPaneSourceEditor(
  doc: Document,
  state: SelectionState,
): { block: HTMLElement; input: HTMLTextAreaElement } {
  const block = doc.createElement("section");
  block.className = `${ROOT_CLASS}__item-pane-block`;
  const label = doc.createElement("label");
  label.textContent = getString("selection-translation-source");
  const textarea = doc.createElement("textarea");
  textarea.className = `${ROOT_CLASS}__source-input`;
  textarea.value = state.sourceText;
  textarea.rows = 4;
  textarea.addEventListener("input", () => {
    state.sourceText = textarea.value;
    if (latestState?.id === state.id) {
      latestState = { ...state, sourceText: textarea.value };
    }
    if (activeSession?.id === state.id) {
      activeSession.sourceText = textarea.value;
    }
  });
  label.append(textarea);
  block.append(label);
  return { block, input: textarea };
}

function createItemPaneActions(
  doc: Document,
  state: SelectionState,
  sourceInput: HTMLTextAreaElement,
): HTMLElement {
  const actions = doc.createElement("div");
  actions.className = `${ROOT_CLASS}__actions`;
  const actionButtons: HTMLButtonElement[] = [];
  actionButtons.push(
    createItemPaneButton(
      doc,
      "selection-translation-action",
      () => translateStateFromItemPane(state, sourceInput.value),
      { withLogo: true },
    ),
  );
  if (state.translatedText) {
    actionButtons.push(
      createItemPaneButton(doc, "selection-translation-copy", () =>
        copyTranslatedText(state),
      ),
      createItemPaneButton(doc, "selection-translation-read-aloud", () =>
        toggleReadAloud(state),
      ),
    );
  }
  actions.append(...actionButtons);
  if (canWriteAnnotationCommentState(state)) {
    actions.append(
      createItemPaneButton(
        doc,
        "selection-translation-annotation-comment",
        () => {
          state.sourceText = sourceInput.value;
          if (latestState?.id === state.id) {
            latestState = { ...state };
          }
          void writeTranslationToAnnotationCommentState(state);
        },
      ),
    );
  }
  return actions;
}

function createItemPaneButton(
  doc: Document,
  labelKey: string,
  listener: () => void,
  options: { withLogo?: boolean } = {},
): HTMLButtonElement {
  const button = doc.createElement("button");
  button.type = "button";
  const label = getString(labelKey);
  if (options.withLogo) {
    appendImmersiveTranslateButtonContent(button, label);
  } else {
    button.textContent = label;
  }
  button.addEventListener("click", (event) => {
    event.preventDefault();
    listener();
  });
  return button;
}

function appendImmersiveTranslateButtonContent(
  button: HTMLButtonElement,
  label: string,
) {
  button.classList.add(`${ROOT_CLASS}__logo-button`);
  button.title = label;
  button.setAttribute("aria-label", label);

  const doc = button.ownerDocument;
  if (!doc) {
    button.textContent = label;
    return;
  }
  const icon = doc.createElement("span");
  icon.className = `${ROOT_CLASS}__button-logo`;
  icon.setAttribute("aria-hidden", "true");
  icon.append(createInlineImmersiveTranslateIcon(doc));

  const text = doc.createElement("span");
  text.className = `${ROOT_CLASS}__button-label`;
  text.textContent = label;

  button.replaceChildren(icon, text);
}

function createInlineImmersiveTranslateIcon(doc: Document): SVGSVGElement {
  const svg = doc.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  ) as unknown as SVGSVGElement;
  svg.setAttribute("viewBox", "0 0 400 400");
  svg.setAttribute("focusable", "false");

  const background = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
  background.setAttribute("width", "400");
  background.setAttribute("height", "400");
  background.setAttribute("rx", "48");
  background.setAttribute("fill", "#ec4c8c");

  const logoPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
  logoPath.setAttribute("d", IMMERSIVE_TRANSLATE_ICON_PATH);
  logoPath.setAttribute("fill", "#fcfcfc");
  logoPath.setAttribute("fill-rule", "evenodd");

  svg.append(background, logoPath);
  return svg;
}

function getImmersiveTranslateIconURL(): string {
  return `chrome://${addon.data.config.addonRef}/content/icons/icon.svg`;
}

function cleanupActiveSession() {
  cleanupSpeech();
  if (activeSession?.unloadWindow && activeSession.unloadListener) {
    activeSession.unloadWindow.removeEventListener(
      "unload",
      activeSession.unloadListener,
    );
  }
  activeSession?.root.remove();
  activeSession = undefined;
}

function bindReaderUnload(session: PopupSession) {
  const unloadWindow = session.doc.defaultView;
  if (!unloadWindow) {
    return;
  }
  const unloadListener = () => {
    if (activeSession?.id === session.id) {
      cleanupActiveSession();
    }
  };
  unloadWindow.addEventListener("unload", unloadListener, { once: true });
  session.unloadWindow = unloadWindow;
  session.unloadListener = unloadListener;
}

function cleanupSpeech() {
  activeSpeech?.synth.cancel();
  activeSpeech = undefined;
}

function isActive(session: PopupSession): boolean {
  return (
    registered &&
    activeSession?.id === session.id &&
    latestState?.id === session.id
  );
}

function getStatusText(status: TranslationStatus): string {
  switch (status) {
    case "loading":
      return getString("selection-translation-loading");
    case "success":
      return getString("selection-translation-success");
    case "missing-key":
      return getString("selection-translation-missing-key");
    case "length":
      return getString("selection-translation-error-length");
    case "empty":
      return getString("selection-translation-error-empty");
    case "error":
      return getString("selection-translation-error-generic");
    default:
      return getString("selection-translation-ready");
  }
}

function getProviderErrorMessage(code: SelectionTranslationErrorCode): string {
  switch (code) {
    case "auth":
      return getString("selection-translation-error-auth");
    case "rate-limit":
      return getString("selection-translation-error-rate-limit");
    case "bad-request":
      return getString("selection-translation-error-bad-request");
    case "server":
      return getString("selection-translation-error-server");
    case "timeout":
      return getString("selection-translation-error-timeout");
    case "network":
      return getString("selection-translation-error-network");
    case "empty":
      return getString("selection-translation-error-empty");
    case "malformed":
      return getString("selection-translation-error-malformed");
    default:
      return getString("selection-translation-error-generic");
  }
}

function injectStyles(doc: Document) {
  if (doc.getElementById(STYLE_ID)) {
    return;
  }
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ROOT_CLASS}__popup-entry {
      align-items: center;
      display: flex;
      inline-size: calc(100% - 16px);
      margin-inline: 8px;
      position: relative;
      vertical-align: middle;
    }
    .${ROOT_CLASS}__translate-button {
      appearance: auto;
      background: var(--material-button-background, ButtonFace);
      border: 1px solid var(--border-color, ButtonBorder);
      border-radius: 4px;
      color: var(--fill-primary, ButtonText);
      font: menu;
      min-height: 24px;
      padding: 3px 9px;
    }
    .${ROOT_CLASS}__logo-button {
      align-items: center;
      background: #fff;
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.18));
      border-radius: 999px;
      box-sizing: border-box;
      color: var(--fill-primary, ButtonText);
      display: inline-flex;
      gap: 5px;
      justify-content: center;
      line-height: 1.2;
      white-space: nowrap;
    }
    .${ROOT_CLASS}__button-logo {
      block-size: 16px;
      flex: 0 0 auto;
      inline-size: 16px;
    }
    .${ROOT_CLASS}__button-logo svg {
      block-size: 100%;
      display: block;
      inline-size: 100%;
    }
    .${ROOT_CLASS}__translate-button.${ROOT_CLASS}__logo-button {
      inline-size: 100%;
      min-height: 24px;
      min-inline-size: 0;
      padding: 2px 12px;
    }
    .${ROOT_CLASS}__annotation-header-button {
      appearance: auto;
      font: menu;
      margin-inline-start: 4px;
      min-height: 22px;
      padding: 2px 6px;
    }
    .${ROOT_CLASS}__annotation-header-button.${ROOT_CLASS}__logo-button {
      min-height: 22px;
      padding: 1px 7px 1px 5px;
    }
    .${ROOT_CLASS}__panel {
      display: inline-grid;
      gap: 4px;
      max-inline-size: min(320px, 80vw);
      vertical-align: middle;
    }
    .${ROOT_CLASS}__popup-status {
      color: var(--fill-secondary, #5f6368);
      font: menu;
      white-space: nowrap;
    }
    .${ROOT_CLASS}__popup-result {
      background: var(--material-background, Canvas);
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.16));
      border-radius: 4px;
      color: var(--fill-primary, CanvasText);
      font: menu;
      max-block-size: 96px;
      overflow: auto;
      padding: 4px 6px;
      user-select: text;
      white-space: pre-wrap;
    }
    .${ROOT_CLASS}__popup-copy-button {
      appearance: auto;
      font: menu;
      justify-self: start;
      min-height: 20px;
      padding: 1px 6px;
    }
    .${ROOT_CLASS}__panel-header { align-items: center; display: flex; gap: 8px; justify-content: space-between; }
    .${ROOT_CLASS}__status { margin: 4px 0; }
    .${ROOT_CLASS}__metadata { color: var(--fill-secondary, #5f6368); margin: 8px 0; }
    .${ROOT_CLASS}__result-label { display: grid; gap: 4px; margin-block: 8px; }
    .${ROOT_CLASS}__result {
      box-sizing: border-box;
      font: menu;
      max-height: 96px;
      resize: vertical;
      width: 100%;
    }
    .${ROOT_CLASS}__actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .${ROOT_CLASS}__actions .${ROOT_CLASS}__logo-button {
      min-height: 24px;
      padding: 2px 8px 2px 6px;
    }
    .${ROOT_CLASS}__item-pane { display: grid; gap: 8px; }
    .${ROOT_CLASS}__item-pane-block {
      border: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));
      border-radius: 6px;
      display: grid;
      gap: 4px;
      padding: 8px;
    }
    .${ROOT_CLASS}__item-pane-block div {
      max-height: 120px;
      overflow: auto;
      white-space: pre-wrap;
    }
    .${ROOT_CLASS}__source-input {
      box-sizing: border-box;
      font: menu;
      min-height: 72px;
      resize: vertical;
      width: 100%;
    }
  `;
  const styleContainer = doc.head || doc.documentElement;
  styleContainer?.append(style);
}
