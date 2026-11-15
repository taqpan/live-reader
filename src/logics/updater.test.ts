import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { browser } from "wxt/browser";
import { fakeBrowser } from "wxt/testing/fake-browser";
import * as AppStorage from "./app-storage";
import { AlarmName, ensureScheduled, runUpdate, updateFeeds } from "./updater";

const RSS = `<rss><channel><title>Feed</title><link>https://ok.example/</link>
    <item><title>Entry</title><link>https://ok.example/1</link></item></channel></rss>`;

function mockFetch(routes: Record<string, () => Response>) {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
        const route = routes[url];
        if (!route) throw new TypeError("network error");
        return route();
    }));
}

beforeEach(() => {
    fakeBrowser.reset();
    vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

describe("updateFeeds", () => {
    test("取得できたフィードをキャッシュする", async () => {
        await AppStorage.setSubscriptions([{ url: "https://ok.example/feed", title: "My title" }]);
        mockFetch({ "https://ok.example/feed": () => new Response(RSS) });

        await updateFeeds();

        expect(await AppStorage.getFeedCache("https://ok.example/feed")).toEqual({
            url: "https://ok.example/feed",
            title: "My title",
            link: "https://ok.example/",
            entries: [{ title: "Entry", url: "https://ok.example/1" }],
            error: null,
        });
    });

    test("失敗したら前回のエントリを残してエラーを記録する", async () => {
        await AppStorage.setSubscriptions([{ url: "https://ng.example/feed", title: "NG" }]);
        await AppStorage.setFeedCache({
            url: "https://ng.example/feed",
            title: "NG",
            entries: [{ title: "old", url: "https://ng.example/old" }],
            error: null,
        });
        mockFetch({ "https://ng.example/feed": () => new Response("", { status: 500 }) });

        await updateFeeds();

        const cache = await AppStorage.getFeedCache("https://ng.example/feed");
        expect(cache?.entries).toEqual([{ title: "old", url: "https://ng.example/old" }]);
        expect(cache?.error).toBe("HTTP Error https://ng.example/feed");
    });

    test("フィードとして読めなければエラーを記録する", async () => {
        await AppStorage.setSubscriptions([{ url: "https://html.example/", title: "HTML" }]);
        mockFetch({ "https://html.example/": () => new Response("<html></html>") });

        await updateFeeds();

        expect((await AppStorage.getFeedCache("https://html.example/"))?.error)
            .toBe("Failed to parse a feed: https://html.example/");
    });

    test("購読から外れたフィードのキャッシュを消す", async () => {
        await AppStorage.setSubscriptions([]);
        await AppStorage.setFeedCache({ url: "https://gone.example/feed", title: "gone", error: null });
        await AppStorage.setTimestamp(new Date());
        mockFetch({});

        await updateFeeds();

        expect(await AppStorage.getFeedCache("https://gone.example/feed")).toBeUndefined();
        expect(await AppStorage.getTimestamp()).not.toBeNull();
    });
});

describe("runUpdate / ensureScheduled", () => {
    test("初回は既定の購読で更新し、更新間隔でアラームを予約する", async () => {
        mockFetch({ "https://blog.mozilla.org/feed/": () => new Response(RSS) });

        await ensureScheduled();

        expect(await AppStorage.getSubscriptions()).toHaveLength(1);
        expect(await AppStorage.getTimestamp()).not.toBeNull();
        const alarm = await browser.alarms.get(AlarmName);
        expect(alarm?.periodInMinutes).toBe(AppStorage.DefaultInterval);
    });

    test("更新間隔は 1〜300 分に収める", async () => {
        await AppStorage.init();
        await AppStorage.setInterval(1000);
        mockFetch({});

        await runUpdate();

        expect((await browser.alarms.get(AlarmName))?.periodInMinutes).toBe(AppStorage.MaxInterval);
    });

    test("予約済みなら更新しない", async () => {
        await browser.alarms.create(AlarmName, { periodInMinutes: 60 });
        mockFetch({});

        await ensureScheduled();

        expect(await AppStorage.getTimestamp()).toBeNull();
    });

    test("実行中に呼ばれたら同じ処理を待つ", async () => {
        mockFetch({ "https://blog.mozilla.org/feed/": () => new Response(RSS) });

        const first = runUpdate();
        const second = runUpdate();

        expect(second).toBe(first);
        await first;
        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
