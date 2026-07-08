/**
 * Chrome API wrapper — safe to call in dev (outside extension host)
 * where `chrome.*` is undefined. Every helper degrades gracefully.
 */
export const isExtension = typeof chrome !== "undefined" && !!chrome.runtime?.id;

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  if (!isExtension) return null;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab ?? null;
}

export async function openSidePanel(): Promise<void> {
  if (!isExtension || !chrome.sidePanel) return;
  const tab = await getActiveTab();
  if (tab?.windowId != null) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  if (!isExtension || !chrome.downloads) {
    // dev fallback
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    return;
  }
  await chrome.downloads.download({ url, filename, saveAs: false });
}

export function onMessage<T = unknown>(
  handler: (msg: T, sender: chrome.runtime.MessageSender) => void | Promise<unknown>,
): () => void {
  if (!isExtension) return () => {};
  const listener = (msg: T, sender: chrome.runtime.MessageSender, send: (r?: unknown) => void) => {
    Promise.resolve(handler(msg, sender)).then(send);
    return true;
  };
  chrome.runtime.onMessage.addListener(listener);
  return () => chrome.runtime.onMessage.removeListener(listener);
}

export async function sendMessage<TReq, TRes = unknown>(msg: TReq): Promise<TRes | null> {
  if (!isExtension) return null;
  return (await chrome.runtime.sendMessage(msg)) as TRes;
}
