/* eslint-disable no-console */

import { Storage } from "webextension-polyfill-ts";
import { loadFeed } from "./logics/load-feed";
import * as AppStorage from "./logics/app-storage";
import { Subscription } from './models/subscription';
import { FeedCache } from './models/feed-cache';
import { storage } from "./utils/storage";

let timer: NodeJS.Timeout | null = null;

async function updateFeeds() {
    await AppStorage.vacuumFeedCache();

    const subscriptions: Subscription[] = await AppStorage.getSubscriptions();
    await Promise.all(subscriptions.map(async (subscription) => {
        try {
            const data = await loadFeed(subscription.url);
            const cache: FeedCache = {
                url: subscription.url,
                title: subscription.title,
                link: data.link,
                entries: data.entries,
                error: null,
            };
            await AppStorage.setFeedCache(cache);
        } catch (err) {
            console.log("[background worker]", err);
            if (subscription.url) {
                let cache = await AppStorage.getFeedCache(subscription.url);
                if (cache) {
                    cache.error = err;
                } else {
                    cache = {
                        url: subscription.url,
                        title: subscription.title,
                        error: err,
                    };
                }
                await AppStorage.setFeedCache(cache);
            }
        }
    }));
}

let lock = false;
async function worker() {
    if (lock) return;
    lock = true;

    const timestamp = (new Date()).toString();
    console.log(`[background worker] Start: ${timestamp}`);

    await updateFeeds();
    await AppStorage.setTimestamp(new Date());

    const interval = Math.min(Math.max(1, await AppStorage.getInterval()), 300);
    console.log(`[background worker] Next: ${interval} minutes`);
    timer = setTimeout(worker, interval * 1000 * 60);

    lock = false;
}

function onStorageChanged(ev: Storage.StorageChange) {
    const update = async () => {
        if (timer) {
            clearTimeout(timer);
        }
        await worker();
    };

    if (Object.prototype.hasOwnProperty.call(ev, "reloadRequestAt")) {
        update();
        return;
    }
}

(async () => {
    console.log("[background start]");

    await AppStorage.init();
    storage.addListener(onStorageChanged);
    worker();
})();
