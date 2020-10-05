import { Subscription } from "../models/subscription";
import { FeedCache } from "../models/feed-cache";
import { storage } from "../utils/storage";

const DefaultInterval = 60;
const DefaultSubscriptions: Subscription[] = [{
    title: "The Mozilla Blog",
    url: "https://blog.mozilla.org/feed/"
}];

/* Initialize (Sync) */
export async function init() {
    const data = await storage.getSync() || {};

    if (!data["interval"]) {
        await storage.setSync("interval", DefaultInterval);
    }

    if (!data["feeds"]) {
        await storage.setSync("feeds", DefaultSubscriptions);
    }
}

/* Subscriptions (Sync) */

export async function addSubscription(subscription: Subscription): Promise<Array<Subscription>> {
    const subscriptions = await storage.getSync("feeds") as Subscription[];

    if (subscriptions.findIndex((v) => v.url === subscription.url) < 0) {
        subscriptions.push(subscription);
        await storage.setSync("feeds", subscriptions);
    }

    return subscriptions;
}

export async function getSubscriptions(): Promise<Array<Subscription>> {
    const o = await storage.getSync("feeds");
    return o ? o as Subscription[] : [];
}

export async function setSubscriptions(subscriptions: Subscription[]) {
    await storage.setSync("feeds", subscriptions);
}

/* Interval (Sync) */
export async function setInterval(interval: number) {
    await storage.setSync("interval", interval);
}

export async function getInterval() {
    const o = await storage.getSync("interval");
    return o ? o as number : DefaultInterval;
}

/* FeedCache (Local) */

export async function setFeedCache(feedCache: FeedCache) {
    await storage.setLocal(feedCache.url, feedCache);
}

export async function getFeedCache(feedUrl: string): Promise<FeedCache | undefined> {
    const o = await storage.getLocal(feedUrl);
    return o ? o as FeedCache : undefined;
}

export async function vacuumFeedCache() {
    const subscriptions: Subscription[] = await getSubscriptions();

    // Vacuum local storage area
    const localData = await storage.getLocal() || {};
    for (const key of Object.keys(localData)) {
        if (!Object.prototype.hasOwnProperty.call(localData, key)) continue;
        if (!key.match(/^https?:\/\//)) continue;
        if (!subscriptions.find((subscription) => (subscription.url === key))) {
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
    return o ? new Date(o as number) : null;
}

/* PubSub for requesting to reload (Local) */

export async function requestReload() {
    await storage.setLocal("reloadRequestAt", Date.now());
}
