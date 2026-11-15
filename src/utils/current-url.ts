import { browser } from "wxt/browser";

/** アクティブなタブの URL（http/https のみ）を返す */
export async function currentUrl(): Promise<string | undefined> {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tab?.url;
    return url && /^https?:\/\//.test(url) ? url : undefined;
}
