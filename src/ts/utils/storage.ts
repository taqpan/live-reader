import { browser, Storage } from "webextension-polyfill-ts";

export const storage = {
    async getSync(key?: string) {
        const obj = await browser.storage.sync.get(key);
        return (obj && key) ? obj[key] : obj;
    },

    async setSync(key: string, value: any) {
        const obj = {} as any;
        obj[key] = value;
        return await browser.storage.sync.set(obj);
    },

    async removeSync(key: string) {
        await browser.storage.sync.remove(key);
    },

    async getLocal(key?: string) {
        const obj = await browser.storage.local.get(key);
        return (obj && key) ? obj[key] : obj;
    },

    async setLocal(key: string, value: any) {
        const obj = {} as any;
        obj[key] = value;
        return await browser.storage.local.set(obj);
    },

    async removeLocal(key: string) {
        await browser.storage.local.remove(key);
    },

    addListener(callback: (changes: { [s: string]: Storage.StorageChange; }, areaName: string) => void) {
        browser.storage.onChanged.addListener(callback);
    }
};
