import { config } from "../../package.json";
import { getString } from "../utils/locale";
import { getPref, setPref } from "../utils/prefs";
import { showDialog } from "../utils/dialog";
import { getLanguages, getLanguageName } from "./language";
import {
  translateModes,
  translateModels,
  dualModeOptions,
  fontFamilyOptions,
  ocrWorkaroundOptions,
  translateModels_CN,
  layoutModelOptions,
} from "../config";
import type { Language } from "./language/types";
import { checkIsCN } from "../utils/cn";
import {
  DEFAULT_SHORTCUTS,
  formatShortcutForDisplay,
  getShortcutFromKeyboardEvent,
  isBareShiftLetterShortcut,
  normalizeShortcutString,
} from "./shortcuts";
import {
  normalizeSelectionTranslationModel,
  normalizeSelectionTranslationThinkingMode,
  type SelectionTranslationThinkingMode,
} from "./selection-translation/provider";

type ShortcutInputConfig = {
  inputId: string;
  resetId: string;
  prefKey: "shortcutTranslate" | "shortcutTaskManager";
  otherPrefKey: "shortcutTranslate" | "shortcutTaskManager";
};

const selectionTranslationThinkingModeOptions: Array<{
  label: string;
  value: SelectionTranslationThinkingMode;
}> = [
  { label: "selection-translation-thinking-mode-disabled", value: "disabled" },
  { label: "selection-translation-thinking-mode-high", value: "high" },
  { label: "selection-translation-thinking-mode-max", value: "max" },
];

export function registerPrefs() {
  Zotero.PreferencePanes.register({
    pluginID: addon.data.config.addonID,
    src: rootURI + "content/preferences.xhtml",
    label: getString("prefs-title"),
    image: `chrome://${addon.data.config.addonRef}/content/icons/favicon.png`,
  });
}

export async function registerPrefsScripts(_window: Window) {
  // This function is called when the prefs window is opened
  // See addon/content/preferences.xhtml onpaneload
  if (!addon.data.prefs) {
    addon.data.prefs = {
      window: _window,
    };
  } else {
    addon.data.prefs.window = _window;
  }
  buildPrefsPane();
  bindPrefEvents();
}

function buildPrefsPane() {
  const doc = addon.data.prefs?.window?.document;
  if (!doc) {
    return;
  }
  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-selection-translation-thinking-mode`,
      attributes: {
        value: normalizeSelectionTranslationThinkingMode(
          getPref("selectionTranslationThinkingMode"),
        ),
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: selectionTranslationThinkingModeOptions.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            setPref(
              "selectionTranslationThinkingMode",
              normalizeSelectionTranslationThinkingMode(
                (e.target as XUL.MenuList).value,
              ),
            );
          },
        },
      ],
    },
    doc.querySelector(
      `#${config.addonRef}-selection-translation-thinking-mode-placeholder`,
    )!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-target-language`,
      attributes: {
        value: getPref("targetLanguage") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: getLanguages().map((lang) => {
            const nativeLang = getLanguageName(lang, Zotero.locale as Language);
            return {
              tag: "menuitem",
              attributes: {
                label: nativeLang,
                value: lang,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("targetLanguage", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-target-language-placeholder`)!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-translate-mode`,
      attributes: {
        value: getPref("translateMode") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: translateModes.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("translateMode", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-translate-mode-placeholder`)!,
  );

  const isCN = checkIsCN();
  const real_translateModels = isCN ? translateModels_CN : translateModels;

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-translate-model`,
      attributes: {
        value: getPref("translateModel") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: real_translateModels.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("translateModel", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-translate-model-placeholder`)!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-enable-ocr-workaround`,
      attributes: {
        value: getPref("ocrWorkaround") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: ocrWorkaroundOptions.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("ocrWorkaround", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-enable-ocr-workaround-placeholder`)!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-font-family`,
      attributes: {
        value: getPref("primaryFontFamily") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: fontFamilyOptions.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("primaryFontFamily", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-font-family-placeholder`)!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-dual-mode`,
      attributes: {
        value: getPref("dualMode") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: dualModeOptions.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("dualMode", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-dual-mode-placeholder`)!,
  );

  ztoolkit.UI.replaceElement(
    {
      tag: "menulist",
      id: `${config.addonRef}-layout-model`,
      attributes: {
        value: getPref("layoutModel") as string,
        native: "true",
      },
      styles: {
        maxWidth: "250px",
      },
      children: [
        {
          tag: "menupopup",
          children: layoutModelOptions.map((item) => {
            return {
              tag: "menuitem",
              attributes: {
                label: getString(item.label),
                value: item.value,
              },
            };
          }),
        },
      ],
      listeners: [
        {
          type: "command",
          listener: (e: Event) => {
            ztoolkit.log(e);
            setPref("layoutModel", (e.target as XUL.MenuList).value);
          },
        },
      ],
    },
    doc.querySelector(`#${config.addonRef}-layout-model-placeholder`)!,
  );
}

function bindPrefEvents() {
  bindShortcutPrefEvents();

  addon.data
    .prefs!.window.document?.querySelector(
      `#zotero-prefpane-${config.addonRef}-authkey`,
    )
    ?.addEventListener("change", (e: Event) => {
      ztoolkit.log(e);
      setPref("authkey", (e.target as HTMLInputElement).value);
    });

  const selectionTranslationApiKeyInput =
    addon.data.prefs!.window.document?.querySelector<HTMLInputElement>(
      `#zotero-prefpane-${config.addonRef}-selection-translation-deepseek-api-key`,
    );
  if (selectionTranslationApiKeyInput) {
    selectionTranslationApiKeyInput.value = getPref(
      "selectionTranslationDeepSeekApiKey",
    );
    selectionTranslationApiKeyInput.addEventListener("change", (e: Event) => {
      setPref(
        "selectionTranslationDeepSeekApiKey",
        (e.target as HTMLInputElement).value,
      );
    });
  }

  const selectionTranslationModelInput =
    addon.data.prefs!.window.document?.querySelector<HTMLInputElement>(
      `#zotero-prefpane-${config.addonRef}-selection-translation-model`,
    );
  if (selectionTranslationModelInput) {
    selectionTranslationModelInput.value = getPref("selectionTranslationModel");
    selectionTranslationModelInput.addEventListener("change", (e: Event) => {
      const model = normalizeSelectionTranslationModel(
        (e.target as HTMLInputElement).value,
      );
      setPref("selectionTranslationModel", model);
      selectionTranslationModelInput.value = model;
    });
  }

  addon.data
    .prefs!.window.document?.querySelector(
      `#zotero-prefpane-${config.addonRef}-test-button`,
    )
    ?.addEventListener("command", async (e: Event) => {
      try {
        const result = await addon.api.checkAuthKey({
          apiKey: getPref("authkey"),
        });
        if (result) {
          showDialog({
            title: getString("pref-test-success"),
          });
        } else {
          showDialog({
            title: getString("pref-test-failed"),
            message: getString("pref-test-failed-description"),
          });
        }
      } catch (error) {
        ztoolkit.log(error);
        showDialog({
          title: getString("pref-test-failed"),
          message: getString("pref-test-failed-description"),
        });
      }
    });
}

function bindShortcutPrefEvents() {
  const doc = addon.data.prefs!.window.document;
  const shortcutInputs: ShortcutInputConfig[] = [
    {
      inputId: `zotero-prefpane-${config.addonRef}-shortcut-translate`,
      resetId: `zotero-prefpane-${config.addonRef}-shortcut-translate-reset`,
      prefKey: "shortcutTranslate",
      otherPrefKey: "shortcutTaskManager",
    },
    {
      inputId: `zotero-prefpane-${config.addonRef}-shortcut-task-manager`,
      resetId: `zotero-prefpane-${config.addonRef}-shortcut-task-manager-reset`,
      prefKey: "shortcutTaskManager",
      otherPrefKey: "shortcutTranslate",
    },
  ];

  shortcutInputs.forEach((shortcutInput) => {
    const input = doc.querySelector<HTMLInputElement>(
      `#${shortcutInput.inputId}`,
    );
    const resetButton = doc.querySelector(`#${shortcutInput.resetId}`);
    if (!input || !resetButton) {
      return;
    }

    input.value = formatShortcutForDisplay(getPref(shortcutInput.prefKey));
    input.placeholder = formatShortcutForDisplay(
      DEFAULT_SHORTCUTS[shortcutInput.prefKey],
    );

    input.addEventListener("keydown", (event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Backspace" || keyboardEvent.key === "Delete") {
        return;
      }
      keyboardEvent.preventDefault();
      const shortcutValue = normalizeShortcutFromInputEvent(keyboardEvent);
      if (shortcutValue) {
        input.value = shortcutValue;
        saveShortcutPref(shortcutInput, input);
      }
    });
    input.addEventListener("change", () =>
      saveShortcutPref(shortcutInput, input),
    );
    input.addEventListener("input", () =>
      saveShortcutPref(shortcutInput, input),
    );
    resetButton.addEventListener("command", () => {
      input.value = formatShortcutForDisplay(
        DEFAULT_SHORTCUTS[shortcutInput.prefKey],
      );
      saveShortcutPref(shortcutInput, input);
    });
  });
}

function normalizeShortcutFromInputEvent(event: KeyboardEvent): string {
  return getShortcutFromKeyboardEvent(event);
}

function saveShortcutPref(
  shortcutInput: ShortcutInputConfig,
  input: HTMLInputElement,
) {
  const normalizedValue = normalizeShortcutString(input.value);
  const otherValue = normalizeShortcutString(
    getPref(shortcutInput.otherPrefKey),
  );
  if (normalizedValue !== "" && normalizedValue === otherValue) {
    input.value = formatShortcutForDisplay(getPref(shortcutInput.prefKey));
    setShortcutFeedback(getString("pref-shortcut-duplicate-error"));
    return;
  }
  if (isBareShiftLetterShortcut(normalizedValue)) {
    input.value = formatShortcutForDisplay(getPref(shortcutInput.prefKey));
    setShortcutFeedback(getString("pref-shortcut-native-conflict-error"));
    return;
  }
  input.value = formatShortcutForDisplay(normalizedValue);
  setPref(shortcutInput.prefKey, normalizedValue);
  setShortcutFeedback(getString("pref-shortcut-conflict-guidance"));
}

function setShortcutFeedback(message: string) {
  const feedback = addon.data.prefs!.window.document.querySelector(
    `#zotero-prefpane-${config.addonRef}-shortcut-feedback`,
  );
  if (feedback) {
    feedback.textContent = message;
  }
}
