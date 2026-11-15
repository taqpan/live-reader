import { describe, expect, test } from "vitest";
import { decodeBody } from "./decode";

const bytes = (...parts: (string | number[])[]) => {
    const out: number[] = [];
    for (const part of parts) {
        if (typeof part === "string") out.push(...new TextEncoder().encode(part));
        else out.push(...part);
    }
    return new Uint8Array(out).buffer;
};

// 「日本」
const SJIS = [0x93, 0xfa, 0x96, 0x7b];
const EUCJP = [0xc6, 0xfc, 0xcb, 0xdc];

describe("decodeBody", () => {
    test("既定は UTF-8", () => {
        expect(decodeBody(bytes("<a>日本</a>"), null)).toBe("<a>日本</a>");
    });

    test("Content-Type の charset を使う", () => {
        expect(decodeBody(bytes("<a>", SJIS, "</a>"), "application/rss+xml; charset=Shift_JIS"))
            .toBe("<a>日本</a>");
    });

    test("charset がなければ XML 宣言の encoding を使う", () => {
        const xml = bytes('<?xml version="1.0" encoding="EUC-JP"?><a>', EUCJP, "</a>");
        expect(decodeBody(xml, "text/xml")).toBe('<?xml version="1.0" encoding="EUC-JP"?><a>日本</a>');
    });

    test("BOM を優先する", () => {
        const xml = bytes([0xef, 0xbb, 0xbf], '<?xml version="1.0" encoding="Shift_JIS"?><a>日本</a>');
        expect(decodeBody(xml, null)).toBe('<?xml version="1.0" encoding="Shift_JIS"?><a>日本</a>');
    });

    test("未知の charset は UTF-8 として読む", () => {
        expect(decodeBody(bytes("<a>日本</a>"), "text/xml; charset=x-unknown")).toBe("<a>日本</a>");
    });
});
