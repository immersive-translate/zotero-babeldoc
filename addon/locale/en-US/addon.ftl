startup-begin = Addon is loading
startup-finish = Addon is ready
menuitem-translate = Translate with ImmersiveTranslate(Ctrl/Cmd+Shift+B)
menuView-tasks = View Immersive translate tasks(Ctrl/Cmd+Shift+H)
pref-test-success = Test successfully
pref-test-failed = Test failed
pref-test-failed-description = Please check your authkey
pref-shortcut-duplicate-error = This shortcut is already used by another plugin action. Plugin shortcuts must be unique.
pref-shortcut-native-conflict-error = Shift+letter is reserved by Zotero item-list navigation and cannot be used as a plugin shortcut.
pref-shortcut-conflict-guidance = Custom shortcuts may conflict with Zotero or system shortcuts. Conflicting values are allowed, but Zotero or the system may handle them first.

prefs-title = Immersive Translate
item-filed-status = Translation Status

translateMode-all = Bilingual mode & Translation only
translateMode-dua = Bilingual mode
translateMode-translation = Translation only

translateModel-qwen = Qwen
translateModel-kimi-qwen = Kimi + Qwen(Limited Test)
translateModel-kimi-deepseek = Kimi + DeepSeek(Limited Test)
translateModel-deepseek = DeepSeek
translateModel-doubao = Doubao
translateModel-glm-4-plus = GLM 4.7
translateModel-OpenAI = OpenAI
translateModel-Gemini = Gemini
translateModel-glm-4-flash = GLM-4-Flash

auto = Auto
ocr_workaround_enable = Enable
ocr_workaround_disable = Disable

font_family_serif = Serif
font_family_sans-serif = Sans-serif
font_family_script = Script

dual_mode_lort = Side-by-side: Original | Translation
dual_mode_ltro = Side-by-side: Translation | Original
dual_mode_uodt = Page Alternation: Original Text First
dual_mode_utdo = Page Alternation: Translation First

layoutModel-version-2 = Version 2
layoutModel-version-3 = Version 3

confirm-title = Translate Confirm
confirm-options = Options
confirm-article-single = Selected article
confirm-article-multiple = { $count } selected items. First item shown below.
confirm-article-unknown = Untitled article
confirm-article-metadata-unknown = Author/year unavailable
confirm-enable-compatibility = Enable compatibility mode
confirm-enable-compatibility-description = Enabling this will improve PDF compatibility, but will increase the output file size.
confirm-enable-ocr-workaround = Enable OCR temporary solution
confirm-enable-ocr-workaround-description = When your scanned/image-based PDF file has undergone OCR processing and is in black text on a white background, you can try enabling the OCR version of the temporary solution. This solution will add white rectangular blocks below the translated text to cover the original content.
confirm-translate-model = Translation model
confirm-translate-mode = Translation mode
confirm-target-language = Target language
confirm-yes = Confirm
confirm-cancel = Cancel

task-no-pdf = No PDF found for translation

column-item = Item
column-attachment = Attachment
column-target-language = Target Language
column-translate-model = Translation Model
column-translate-mode = Translation Mode
column-pdfId =  Task ID
column-status = Task Status
column-stage = Current Stage
column-progress = Translate Progress
column-error = Error Message

task-uncomplete = Task not completed
task-select-tip = Please select a task
task-copy-success = Task ID Copied!
task-cancel-success = Task canceled successfully
task-cancel-tip = Only unstarted tasks can be canceled

task-status-queued = Pending start
task-status-uploading = Uploading
task-status-translating = Translating
task-status-success = Success
task-status-failed = Failed
task-status-canceled = Canceled

task-stage-queued = Queuing
task-stage-uploading = Uploading PDF
task-stage-parse-pdf = Parsing PDF
task-stage-DetectScannedFile= Checking if it is a scanned version
task-stage-ParseLayout= Parsing page layout
task-stage-ParseParagraphs= Parsing paragraphs
task-stage-ParseFormulasAndStyles = Parsing formulas & styles
task-stage-RemoveCharDescent = Correcting character offset
task-stage-TranslateParagraphs = Translating paragraphs
task-stage-Typesetting = Typesetting
task-stage-AddFonts = Adding fonts
task-stage-GenerateDrawingInstructions = Exporting PDF
task-stage-SubsetFont = Subsetting font
task-stage-SavePDF = Generating PDF
task-stage-prepareFileDownload = Processing file
task-stage-ParseTable = Parsing table
task-stage-WaitingInLine = Queuing
task-stage-CreateTask = Creating task
task-stage-downloading = Downloading
task-stage-completed = Translate completed

task-retry-success = Task retry queued successfully
task-retry-tip = Only failed tasks can be retried

# Network and download related strings
network-slow-title = Slow Network Access
network-slow-message = If you are in mainland China, you can contact customer service to migrate to Immersive Translate Speed Edition and generate an authorization code for a more stable Zotero plugin experience.
network-slow-dont-remind = Don't remind again
download-failed = Download failed

selection-translation-action = Translate
selection-translation-title = Immersive Translate selection
selection-translation-ready = Ready to translate
selection-translation-loading = Translating…
selection-translation-success = Translation complete
selection-translation-missing-key = Add a DeepSeek API key in Immersive Translate preferences before translating selections.
selection-translation-error-length = Selection is over 5,000 characters. Shorten the selection and try again.
selection-translation-error-auth = DeepSeek authentication failed. Check your selection translation API key.
selection-translation-error-rate-limit = DeepSeek rate limit reached. Try again later.
selection-translation-error-bad-request = DeepSeek rejected the request. Check the selection translation model and thinking setting.
selection-translation-error-server = DeepSeek service returned an error. Try again later.
selection-translation-error-timeout = Translation timed out. Try again.
selection-translation-error-network = Network error. Check your connection and retry.
selection-translation-error-empty = DeepSeek returned an empty translation. Retry or try another model.
selection-translation-error-malformed = DeepSeek returned an unreadable response. Retry or try another model.
selection-translation-error-generic = Translation failed. Try again.
selection-translation-retry = Retry
selection-translation-close = Close
selection-translation-copy = Copy translation
selection-translation-copy-success = Translation copied
selection-translation-copy-error = Could not copy the translation locally.
selection-translation-read-aloud = Read aloud
selection-translation-read-aloud-unavailable = Local speech is unavailable in this Zotero Reader window.
selection-translation-read-aloud-error = Local speech playback failed.
selection-translation-sidebar-annotation-action = Translate annotation with Immersive Translate
selection-translation-annotation-header-action = Translate
selection-translation-annotation-comment = Add/update current annotation comment
selection-translation-annotation-unavailable = Could not find the current writable annotation. The annotation was not changed.
selection-translation-annotation-success = Translation added to the annotation comment.
selection-translation-annotation-auto-write-success = Translation automatically added to the annotation comment.
selection-translation-new-annotation-loading = Translating created annotation…
selection-translation-new-annotation-auto-translate-success = Created annotation translation added to the annotation comment.
selection-translation-annotation-error = Could not update the annotation comment. The annotation was not changed.
selection-translation-annotation-read-only = This annotation is read-only. The annotation was not changed.
selection-translation-annotation-marker-error = Existing Immersive Translate markers are incomplete or conflict with the translation. Clean the comment manually, then try again.
selection-translation-source = Source text
selection-translation-result = Translation
selection-translation-model = Model
selection-translation-thinking-mode = Thinking
selection-translation-thinking-mode-disabled = Disabled
selection-translation-thinking-mode-high = High
selection-translation-thinking-mode-max = Max
selection-translation-target-language = Target language
selection-translation-selected-length = Selected characters
selection-translation-api-log-title = API debug log
selection-translation-api-log-latest = Latest API log
selection-translation-api-log-empty = No API log entries yet.
selection-translation-api-log-clear = Clear log
selection-translation-item-pane-empty = Select text in the PDF Reader to show the latest selection translation here.
selection-translation-item-pane-hint = Open the item pane to view the full source, translation, and actions.
