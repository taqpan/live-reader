'use strict';

export default {
    async getSync(key) {
        const obj = await browser.storage.sync.get(key);
        return (obj && key) ? obj[key] : obj;
    },

    async setSync(key, value) {
        const obj = {};
        obj[key] = value;
        return await browser.storage.sync.set(obj);
    },

    async removeSync(key) {
        await browser.storage.sync.remove(key);
    },

    async getLocal(key) {
        const obj = await browser.storage.local.get(key);
        return (obj && key) ? obj[key] : obj;
    },

    async setLocal(key, value) {
        const obj = {};
        obj[key] = value;
        return await browser.storage.local.set(obj);
    },

    async removeLocal(key) {
        await browser.storage.local.remove(key);
    },

    addListener(callback) {
        browser.storage.onChanged.addListener(callback);
    }
};