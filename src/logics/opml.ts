import { XMLBuilder } from "fast-xml-parser";
import type { Subscription } from "../models/subscription";
import { ATTR, asArray, attr, child, parseXml, rootElement, type XmlNode } from "../utils/xml";
import * as AppStorage from "./app-storage";

/** OPML から購読を取り出す。フォルダ（入れ子の outline）は何階層でもたどる */
export function parseOpml(xml: string): Subscription[] {
    const root = rootElement(parseXml(xml));
    const body = root && root[0] === "opml" ? child(root[1], "body") : undefined;
    if (!body) {
        throw new Error("Failed to read the file as OPML.");
    }

    const result: Subscription[] = [];
    const walk = (outlines: XmlNode[]) => {
        for (const outline of outlines) {
            const url = attr(outline, "xmlUrl");
            if (url) {
                const title = attr(outline, "title") || attr(outline, "text") || url;
                result.push({ url, title });
            }
            walk(asArray(outline["outline"]));
        }
    };
    walk(asArray(body["outline"]));

    return result;
}

/** 購読に追加し、新しく追加した件数を返す */
export async function importOpml(file: File): Promise<number> {
    const feeds = parseOpml(await file.text());

    const subscriptions = await AppStorage.getSubscriptions();
    const known = new Set(subscriptions.map((s) => s.url));
    let n = 0;
    for (const feed of feeds) {
        if (!known.has(feed.url)) {
            subscriptions.push(feed);
            known.add(feed.url);
            n++;
        }
    }
    await AppStorage.setSubscriptions(subscriptions);

    return n;
}

export function buildOpml(subscriptions: Subscription[]): string {
    const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: ATTR,
        format: true,
        indentBy: "  ",
        suppressEmptyNode: true,
    });

    const doc = {
        "?xml": { [`${ATTR}version`]: "1.0", [`${ATTR}encoding`]: "UTF-8" },
        opml: {
            [`${ATTR}version`]: "1.0",
            head: { title: "Live Reader feeds" },
            body: {
                outline: {
                    [`${ATTR}title`]: "RSS Feeds",
                    [`${ATTR}text`]: "RSS Feeds",
                    outline: subscriptions.map((s) => ({
                        [`${ATTR}text`]: s.title,
                        [`${ATTR}title`]: s.title,
                        [`${ATTR}type`]: "rss",
                        [`${ATTR}xmlUrl`]: s.url,
                    })),
                },
            },
        },
    };

    return builder.build(doc) as string;
}

export async function exportOpml(): Promise<string> {
    return buildOpml(await AppStorage.getSubscriptions());
}
