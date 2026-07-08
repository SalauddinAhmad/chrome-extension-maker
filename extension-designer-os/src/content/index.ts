/**
 * Content script — injected into every page at document_idle.
 * Kept intentionally empty in Phase 1. Modules that need DOM access
 * (color picker eyedropper, font detector, inspector, asset extractor,
 * screenshot cropper) will register their probes here when their phase ships.
 */

console.debug("[Designer OS] content script ready");

export {};
