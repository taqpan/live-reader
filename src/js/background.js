'use strict';

/* eslint-disable no-console */

import '@babel/polyfill';
import storage from './lib/storage';
import {parse as readFeed} from './lib/feed-parser';

let timer = null;

async function updateFeeds() {
    const feeds = await storage.getSync('feeds');

    // Vacuum local storage area
    const localData = await storage.getLocal() || {};
    for (const key of Object.keys(localData)) {
        if (!localData.hasOwnProperty(key)) continue;
        if (!key.match(/^https?:\/\//)) continue;
        if (!feeds.find((feed) => (feed.url === key))) {
            await storage.removeLocal(key);
        }
    }

    // Create entry lists
    await Promise.all(feeds.map(async (feed) => {
        try {
            const data = await readFeed(feed.url);
            await storage.setLocal(feed.url, {
                title: feed.title,
                url: data.url,
                items: data.items,
                error: null
            });
        } catch (err) {
            console.error('[background worker]', err);
            const _feed = await storage.getLocal(feed.url);
            _feed.error = err;
            await storage.setLocal(feed.url, _feed);
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
    await storage.setLocal('updatedAt', (new Date()).toString());

    const interval = Math.min(Math.max(1, await storage.getSync('interval')), 60);
    console.log(`[background worker] Next: ${interval} minutes`);
    timer = setTimeout(worker, interval * 1000 * 60);

    lock = false;
}

function onStorageChanged(ev) {
    if (ev.hasOwnProperty('interval') || ev.hasOwnProperty('reloadRequestAt')) {
        if (timer) {
            clearTimeout(timer);
        }
        worker();
    }
}

(async () => {
    const data = await storage.getSync();

    if (!data.interval) {
        await storage.set('interval', 15);
    }

    if (!data.feeds) {
        await storage.set('feeds', [{ title: 'The Mozilla Blog', url: 'https://blog.mozilla.org/feed/' }]);
    }

    console.log('[background start]');
    storage.addListener(onStorageChanged);
    worker();
})();
