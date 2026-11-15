import { beforeEach, describe, expect, test } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";
import * as AppStorage from "./app-storage";
import { buildOpml, importOpml, parseOpml } from "./opml";

describe("parseOpml", () => {
    test("フォルダで入れ子になった outline を読む", () => {
        const xml = `<?xml version="1.0"?>
            <opml version="1.0"><head><title>x</title></head><body>
              <outline text="News">
                <outline text="A" title="Feed A" type="rss" xmlUrl="https://a.example/feed"/>
                <outline text="B" type="rss" xmlUrl="https://b.example/feed"/>
              </outline>
              <outline text="Tech">
                <outline text="Sub"><outline type="rss" xmlUrl="https://c.example/feed"/></outline>
              </outline>
            </body></opml>`;
        expect(parseOpml(xml)).toEqual([
            { url: "https://a.example/feed", title: "Feed A" },
            { url: "https://b.example/feed", title: "B" },
            { url: "https://c.example/feed", title: "https://c.example/feed" },
        ]);
    });

    test("フォルダのないフラットな OPML を読む", () => {
        const xml = `<opml version="2.0"><body>
              <outline text="Only" xmlUrl="https://only.example/feed"/>
            </body></opml>`;
        expect(parseOpml(xml)).toEqual([{ url: "https://only.example/feed", title: "Only" }]);
    });

    test("OPML でなければエラー", () => {
        expect(() => parseOpml("<rss><channel/></rss>")).toThrow("Failed to read the file as OPML.");
    });
});

describe("buildOpml", () => {
    test("書き出した OPML を読み戻せる（特殊文字を含む）", () => {
        const subscriptions = [
            { url: "https://a.example/feed?x=1&y=2", title: "A & \"B\" <C>" },
            { url: "https://b.example/feed", title: "日本語" },
        ];
        const xml = buildOpml(subscriptions);
        expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
        expect(parseOpml(xml)).toEqual(subscriptions);
    });

    test("購読が 1 件でも出力できる", () => {
        const xml = buildOpml([{ url: "https://a.example/feed", title: "A" }]);
        expect(parseOpml(xml)).toEqual([{ url: "https://a.example/feed", title: "A" }]);
    });
});

describe("importOpml", () => {
    beforeEach(() => {
        fakeBrowser.reset();
    });

    test("既存の購読と重複しないものだけ追加する", async () => {
        await AppStorage.setSubscriptions([{ url: "https://a.example/feed", title: "A" }]);
        const xml = `<opml><body>
              <outline xmlUrl="https://a.example/feed" text="A2"/>
              <outline xmlUrl="https://b.example/feed" text="B"/>
              <outline xmlUrl="https://b.example/feed" text="B dup"/>
            </body></opml>`;

        const n = await importOpml(new File([xml], "feeds.opml"));

        expect(n).toBe(1);
        expect(await AppStorage.getSubscriptions()).toEqual([
            { url: "https://a.example/feed", title: "A" },
            { url: "https://b.example/feed", title: "B" },
        ]);
    });
});
