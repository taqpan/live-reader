import type { Entry } from "../models/entry";
import type { Feed } from "../models/feed";
import { asArray, attr, child, parseXml, rootElement, text, type XmlNode } from "../utils/xml";

export type ParsedFeed = Omit<Feed, "url">;

function parseRss1(root: XmlNode): ParsedFeed {
    const channel = child(root, "channel");
    if (!channel) throw new Error("[feed-parser] rss1: No channel");

    const items = asArray(root["item"]);
    const order = asArray(child(child(channel, "items"), "rdf:Seq")?.["rdf:li"])
        .map((li) => attr(li, "rdf:resource"))
        .filter(Boolean);

    // rdf:Seq の順に並べる。Seq がない場合は item の記述順
    const ordered = order.length
        ? order
            .map((url) => items.find((item) => attr(item, "rdf:about") === url))
            .filter((item): item is XmlNode => item !== undefined)
        : items;

    const entries: Entry[] = [];
    for (const item of ordered) {
        const title = text(child(item, "title"));
        const url = attr(item, "rdf:about") || text(child(item, "link"));
        if (title && url) entries.push({ title, url });
    }

    return {
        type: "rss1",
        title: text(child(channel, "title")),
        link: text(child(channel, "link")),
        entries,
    };
}

function parseRss2(root: XmlNode): ParsedFeed {
    const channel = child(root, "channel");
    if (!channel) throw new Error("[feed-parser] rss2: No channel");

    const entries: Entry[] = [];
    for (const item of asArray(channel["item"])) {
        const title = text(child(item, "title"));
        const url = text(child(item, "link"));
        if (title && url) entries.push({ title, url });
    }

    return {
        type: "rss2",
        title: text(child(channel, "title")),
        link: text(child(channel, "link")),
        entries,
    };
}

/** Atom の <link> 群から rel="alternate"（rel 省略時の既定値）の href を選ぶ */
function atomLink(node: XmlNode): string {
    const links = asArray(node["link"]);
    const alternate = links.find((link) => (attr(link, "rel") || "alternate") === "alternate");
    return attr(alternate, "href");
}

function parseAtom(root: XmlNode): ParsedFeed {
    const entries: Entry[] = [];
    for (const entry of asArray(root["entry"])) {
        const title = text(child(entry, "title"));
        const url = atomLink(entry);
        if (title && url) entries.push({ title, url });
    }

    return {
        type: "atom",
        title: text(child(root, "title")),
        link: atomLink(root),
        entries,
    };
}

export function parseFeed(xml: string): ParsedFeed {
    const root = rootElement(parseXml(xml));
    if (!root) throw new Error("[feed-parser] Empty document.");

    const [name, node] = root;
    switch (name) {
    case "rdf:RDF":
        return parseRss1(node);
    case "rss":
        return parseRss2(node);
    case "feed":
        return parseAtom(node);
    default:
        throw new Error("[feed-parser] Unknown feed format.");
    }
}
