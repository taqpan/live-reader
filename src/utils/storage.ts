import { browser, type Browser } from "wxt/browser";

type StorageChanges = Record<string, Browser.storage.StorageChange>;

export const storage = {
    async getSync(key?: string): Promise<unknown> {
        const obj = await browser.storage.sync.get(key ?? null);
        return key ? obj[key] : obj;
    },

    async setSync(key: string, value: unknown) {
        await browser.storage.sync.set({ [key]: value });
    },

    async removeSync(key: string) {
        await browser.storage.sync.remove(key);
    },

    async getLocal(key?: string): Promise<unknown> {
        const obj = await browser.storage.local.get(key ?? null);
        return key ? obj[key] : obj;
    },

    async setLocal(key: string, value: unknown) {
        await browser.storage.local.set({ [key]: value });
    },

    async removeLocal(key: string) {
        await browser.storage.local.remove(key);
    },

    addListener(callback: (changes: StorageChanges, areaName: string) => void) {
        browser.storage.onChanged.addListener(callback);
    },
};
