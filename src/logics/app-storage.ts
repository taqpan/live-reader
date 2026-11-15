import type { FeedCache } from "../models/feed-cache";
import type { Subscription } from "../models/subscription";
import { storage } from "../utils/storage";

// ストレージのキーは旧バージョンと同じ。既存の購読・設定をそのまま引き継ぐ。
//   sync : feeds（Subscription[]）, interval（分）
//   local: <フィードURL>（FeedCache）, updatedAt, reloadRequestAt

export const DefaultInterval = 60;
export const MinInterval = 1;
export const MaxInterval = 300;

const DefaultSubscriptions: Subscription[] = [{
    title: "The Mozilla Blog",
    url: "https://blog.mozilla.org/feed/",
}];

/* Initialize (Sync) */
export async function init() {
    const data = (await storage.getSync() ?? {}) as Record<string, unknown>;

    if (!data["interval"]) {
        await storage.setSync("interval", DefaultInterval);
    }

    if (!data["feeds"]) {
        await storage.setSync("feeds", DefaultSubscriptions);
    }
}

/* Subscriptions (Sync) */

export async function getSubscriptions(): Promise<Subscription[]> {
    const o = await storage.getSync("feeds");
    return Array.isArray(o) ? (o as Subscription[]) : [];
}

export async function setSubscriptions(subscriptions: Subscription[]) {
    await storage.setSync("feeds", subscriptions.map(({ url, title }) => ({ url, title })));
}

export async function addSubscription(subscription: Subscription): Promise<Subscription[]> {
    const subscriptions = await getSubscriptions();

    if (!subscriptions.some((v) => v.url === subscription.url)) {
        subscriptions.push(subscription);
        await setSubscriptions(subscriptions);
    }

    return subscriptions;
}

/* Interval (Sync) */

export async function setInterval(interval: number) {
    await storage.setSync("interval", interval);
}

export async function getInterval(): Promise<number> {
    const o = await storage.getSync("interval");
    return typeof o === "number" && o > 0 ? o : DefaultInterval;
}

export function clampInterval(interval: number): number {
    return Math.min(Math.max(MinInterval, interval), MaxInterval);
}

/* FeedCache (Local) */

export async function setFeedCache(feedCache: FeedCache) {
    await storage.setLocal(feedCache.url, feedCache);
}

export async function getFeedCache(feedUrl: string): Promise<FeedCache | undefined> {
    const o = await storage.getLocal(feedUrl);
    return o ? (o as FeedCache) : undefined;
}

/** 購読から外れたフィードのキャッシュを削除する */
export async function vacuumFeedCache() {
    const subscriptions = await getSubscriptions();
    const urls = new Set(subscriptions.map((s) => s.url));

    const localData = (await storage.getLocal() ?? {}) as Record<string, unknown>;
    for (const key of Object.keys(localData)) {
        if (!/^https?:\/\//.test(key)) continue;
        if (!urls.has(key)) {
            await storage.removeLocal(key);
        }
    }
}

/* Timestamp (Local) */

export async function setTimestamp(date: Date) {
    await storage.setLocal("updatedAt", date.getTime());
}

export async function getTimestamp(): Promise<Date | null> {
    const o = await storage.getLocal("updatedAt");
    return typeof o === "number" ? new Date(o) : null;
}

/* PubSub for requesting to reload (Local) */

export const ReloadRequestKey = "reloadRequestAt";

export async function requestReload() {
    await storage.setLocal(ReloadRequestKey, Date.now());
}
