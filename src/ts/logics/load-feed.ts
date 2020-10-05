import { Entry } from '../models/entry';
import { Feed } from '../models/feed';
import { dom2obj } from "../utils/dom2obj";
import { resolveObjectPath } from '../utils/object-path';

function asArray(node: any): any[] {
    if (!node) return [];
    return Array.isArray(node) ? node : [node];
}

function asText(node: any): string {
    if (!node) {
        return "";
    }

    return node["#text"] || node["#cdata-section"] || "";
}


function parseXmlLikeRss1(obj: any): Omit<Feed, "url"> {
    const channel = obj.channel;
    if (!channel) throw new Error("[feed-parser] rss1: No channel");

    const title = asText(channel.title);
    const link = asText(channel.link);
    const entries: Entry[] = [];

    const items = asArray(obj.item);
    asArray(resolveObjectPath(channel, "items.rdf:Seq.rdf:li")).forEach((li) => {
        const url = resolveObjectPath(li, "rdf:resource") || null;
        if (url) {
            const entry = items.find((e) => resolveObjectPath(e, "rdf:about") === url);
            if (entry) {
                const title = asText(entry.title);
                entries.push({ title, url });
            }
        }
    });

    return { type: "rss1", title, link, entries };
}


function parseXmlLikeRss2(obj: any): Omit<Feed, "url"> {
    const channel = obj.channel;
    if (!channel) throw new Error("[feed-parser] rss2: No channel");

    const title = asText(channel.title);
    const link = asText(channel.link);
    const entries: Entry[] = [];

    if (channel.item) {
        asArray(channel.item).forEach((item) => {
            const title = asText(item.title);
            const url = asText(item.link);
            if (title && url) {
                entries.push({ title, url });
            }
        });
    }

    return { type: "rss2", title, link, entries };
}


function parseXmlLikeAtom(obj: any): Omit<Feed, "url"> {
    const title = asText(obj.title);

    const links = asArray(obj.link)
        .filter(link => resolveObjectPath(link, "rel") === "alternate");
    const link = resolveObjectPath(links[0], "href") || "";

    const entries: Entry[] = [];
    if (obj.entry) {
        asArray(obj.entry).forEach((entry) => {
            const title = asText(entry.title);
            const url = resolveObjectPath(entry, "link.href") || "";
            if (title && url) {
                entries.push({ title, url });
            }
        });
    }

    return { type: "atom", title, link, entries };
}


function parseFeedBody(body: any): Omit<Feed, "url"> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(body, "application/xml");
    const rootNode = doc.children[0];
    const root = dom2obj(rootNode);

    if (rootNode.tagName === "rdf:RDF") {
        return parseXmlLikeRss1(root);
    }
    if (rootNode.tagName === "rss") {
        return parseXmlLikeRss2(root);
    }
    if (rootNode.tagName === "feed") {
        return parseXmlLikeAtom(root);
    }
    throw new Error("[feed-parser] Unknown feed format.");
}

export async function loadFeed(url: string): Promise<Feed> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 30000;
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            if (xhr.status !== 200) {
                reject(`HTTP Error ${url}`);
                return;
            }

            try {
                const result = parseFeedBody(xhr.response);
                resolve({ url, ...result });
            } catch (err) {
                reject(`Failed to parse a feed: ${url}`);
            }
        };

        xhr.open("GET", url, true);
        xhr.responseType = "text";
        xhr.send();
    });
}
