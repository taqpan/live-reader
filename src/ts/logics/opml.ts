import { dom2obj } from "../utils/dom2obj";
import { resolveObjectPath } from "../utils/object-path";
import * as AppStorage from "./app-storage";

async function applyOpml(xml: string): Promise<number> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const rootNode = doc.children[0];
    const data = dom2obj(rootNode);
    const outline = resolveObjectPath(data, "body.outline.outline");
    if (!Array.isArray(outline)) {
        throw new Error("Failed to read the file as OPML.");
    }

    let n = 0;
    const subscriptions = await AppStorage.getSubscriptions();
    for (const feed of outline) {
        const title = feed.title || feed.text || feed.xmlUrl;
        const url = feed.xmlUrl;
        if (title && url) {
            if (subscriptions.findIndex((s) => s.url === url) < 0) {
                subscriptions.push({ url, title });
                n++;
            }
        }
    }
    await AppStorage.setSubscriptions(subscriptions);

    return n;
}

export function importOpml(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
            applyOpml(e.target!.result as string)
                .then(resolve)
                .catch(reject);
        };
        reader.readAsText(file);
    });
}

export async function exportOpml(): Promise<string> {
    const doc = document.implementation.createDocument(null, null, null);

    const opml = doc.createElement("opml");
    opml.setAttribute("version", "1.0");
    doc.appendChild(opml);

    const head = doc.createElement("head");
    opml.appendChild(head);

    const title = doc.createElement("title");
    title.textContent = "Live Reader feeds";
    head.appendChild(title);

    const body = doc.createElement("body");
    opml.appendChild(body);

    const outlines = doc.createElement("outline");
    outlines.setAttribute("title", "RSS Feeds");
    outlines.setAttribute("text", "RSS Feeds");
    body.appendChild(outlines);

    const subscriptions = await AppStorage.getSubscriptions();
    subscriptions.forEach((subscription) => {
        const outline = doc.createElement("outline");
        outline.setAttribute("text", subscription.title);
        outline.setAttribute("title", subscription.title);
        outline.setAttribute("type", "rss");
        outline.setAttribute("xmlUrl", subscription.url);
        outlines.appendChild(outline);
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
}
