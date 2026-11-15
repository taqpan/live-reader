import { describe, expect, test } from "vitest";
import atom from "./__fixtures__/atom.xml?raw";
import rss1 from "./__fixtures__/rss1.xml?raw";
import rss2 from "./__fixtures__/rss2.xml?raw";
import { parseFeed } from "./parse-feed";

describe("parseFeed", () => {
    test("RSS 1.0: rdf:Seq の順に並べる", () => {
        expect(parseFeed(rss1)).toEqual({
            type: "rss1",
            title: "RSS1 サンプル",
            link: "https://example.com/",
            entries: [
                { title: "記事 2 & more", url: "https://example.com/2" },
                { title: "記事 1", url: "https://example.com/1" },
            ],
        });
    });

    test("RSS 2.0: CDATA・文字参照を展開し、link のない item は除く", () => {
        expect(parseFeed(rss2)).toEqual({
            type: "rss2",
            title: "RSS2 Sample",
            link: "https://example.org/",
            entries: [
                { title: "CDATA <b>title</b>", url: "https://example.org/a" },
                { title: "It’s fine <ok>", url: "https://example.org/b" },
            ],
        });
    });

    test("Atom: rel=alternate（省略時を含む）のリンクを使う", () => {
        expect(parseFeed(atom)).toEqual({
            type: "atom",
            title: "Atom Sample",
            link: "https://example.net/",
            entries: [
                { title: "Multiple links", url: "https://example.net/1" },
                { title: "Implicit alternate", url: "https://example.net/2" },
            ],
        });
    });

    test("RSS 2.0: item が 1 件だけでも配列として扱う", () => {
        const xml = `<rss><channel><title>t</title><link>l</link>
            <item><title>only</title><link>https://example.org/only</link></item></channel></rss>`;
        expect(parseFeed(xml).entries).toEqual([{ title: "only", url: "https://example.org/only" }]);
    });

    test("フィードでない XML はエラー", () => {
        expect(() => parseFeed("<html><body>hello</body></html>")).toThrow("Unknown feed format");
    });

    test("空の文書はエラー", () => {
        expect(() => parseFeed("")).toThrow();
    });
});
