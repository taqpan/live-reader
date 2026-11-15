import { browser } from "wxt/browser";
import type { FeedCache } from "../models/feed-cache";
import * as AppStorage from "./app-storage";
import { loadFeed } from "./load-feed";

/* eslint-disable no-console */

export const AlarmName = "update-feeds";

function errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

export async function updateFeeds() {
    await AppStorage.vacuumFeedCache();

    const subscriptions = await AppStorage.getSubscriptions();
    await Promise.all(subscriptions.map(async (subscription) => {
        if (!subscription.url) return;
        try {
            const data = await loadFeed(subscription.url);
            await AppStorage.setFeedCache({
                url: subscription.url,
                title: subscription.title,
                link: data.link,
                entries: data.entries,
                error: null,
            });
        } catch (err) {
            console.log("[background worker]", err);
            // 取得に失敗しても、前回のエントリは残して表示できるようにする
            const cache: FeedCache = await AppStorage.getFeedCache(subscription.url) ?? {
                url: subscription.url,
                title: subscription.title,
                error: null,
            };
            cache.error = errorMessage(err);
            await AppStorage.setFeedCache(cache);
        }
    }));
}

/** 次回の更新を予約する（MV3 の service worker は停止するため setTimeout ではなく alarms を使う） */
export async function schedule() {
    const interval = AppStorage.clampInterval(await AppStorage.getInterval());
    await browser.alarms.create(AlarmName, {
        delayInMinutes: interval,
        periodInMinutes: interval,
    });
    console.log(`[background worker] Next: ${interval} minutes`);
}

let running: Promise<void> | null = null;

/** フィードを更新して次回を予約する。実行中に呼ばれた場合は実行中の処理を待つ */
export function runUpdate(): Promise<void> {
    if (running) return running;

    running = (async () => {
        try {
            console.log(`[background worker] Start: ${new Date().toString()}`);
            await AppStorage.init();
            await updateFeeds();
            await AppStorage.setTimestamp(new Date());
        } finally {
            await schedule();
            running = null;
        }
    })();
    return running;
}

/** 予約が失われていたら（初回起動・ブラウザ再起動など）すぐに更新する */
export async function ensureScheduled() {
    const alarm = await browser.alarms.get(AlarmName);
    if (!alarm) {
        await runUpdate();
    }
}
