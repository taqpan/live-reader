import _ from "lodash";
import { xml2js } from "xml-js";
import { FeedItem, Feed } from '../model/feed-item';

function asArray(node: any): any[] {
    if (!node) return [];
    return Array.isArray(node) ? node : [node];
}


function asText(node: any): string {
    if (!node) return "";
    return node._text || node._cdata || "";
}


function parseXmlLikeRss1(obj: any): Feed {
    const channel = obj.channel;
    if (!channel) throw new Error("[feed-parser] rss1: No channel");

    const title = asText(channel.title);
    const url = asText(channel.link);
    const items: FeedItem[] = [];

    const entries = asArray(obj.item);
    asArray(_.get(channel, "entries.rdf:Seq.rdf:li")).forEach((li) => {
        const url = _.get(li, "_attributes.rdf:resource") || null;
        if (url) {
            const entry = entries.find((e) => _.get(e, "_attributes.rdf:about") === url);
            if (entry) {
                const title = asText(entry.title);
                items.push({ title, url });
            }
        }
    });

    return { type: "rss1", title, url, items };
}


function parseXmlLikeRss2(obj: any): Feed {
    const channel = obj.channel;
    if (!channel) throw new Error("[feed-parser] rss2: No channel");

    const title = asText(channel.title);
    const url = asText(channel.link);
    const items: FeedItem[] = [];

    if (channel.item) {
        asArray(channel.item).forEach((item) => {
            const title = asText(item.title);
            const url = asText(item.link);
            if (title && url) {
                items.push({ title, url });
            }
        });
    }

    return { type: "rss2", title, url, items };
}


function parseXmlLikeAtom(obj: any): Feed {
    const title = asText(obj.title);

    const links = asArray(obj.link)
        .filter(link => _.get(link, "_attributes.rel") === "alternate");
    const url = _.get(links[0], "_attributes.href") || "";

    const items: FeedItem[] = [];
    if (obj.entry) {
        asArray(obj.entry).forEach((entry) => {
            const title = asText(entry.title);
            const url = _.get(entry, "link._attributes.href") || "";
            if (title && url) {
                items.push({ title, url });
            }
        });
    }

    return { type: "atom", title, url, items };
}


function parseFeedBody(body: any): Feed {
    const obj = xml2js(body, { compact: true }) as any;

    if (obj.hasOwnProperty("rdf:RDF")) {
        return parseXmlLikeRss1(obj["rdf:RDF"]);
    }
    if (obj.hasOwnProperty("rss")) {
        return parseXmlLikeRss2(obj["rss"]);
    }
    if (obj.hasOwnProperty("feed")) {
        return parseXmlLikeAtom(obj["feed"]);
    }
    throw new Error("[feed-parser] Unknown feed format.");
}


export async function parseFeed(feedUrl: string): Promise<Feed> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.timeout = 15000;
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            if (xhr.status !== 200) {
                reject(`HTTP Error ${feedUrl}`);
                return;
            }

            try {
                const result = parseFeedBody(xhr.response);
                resolve(result);
            } catch (err) {
                reject(`Failed to parse a feed: ${feedUrl}`);
            }
        };

        xhr.open("GET", feedUrl, true);
        xhr.responseType = "text";
        xhr.send();
    });
}
