import type { Feed } from "../models/feed";
import { decodeBody } from "../utils/decode";
import { parseFeed } from "./parse-feed";

const TIMEOUT_MS = 30_000;

export async function loadFeed(url: string): Promise<Feed> {
    let response: Response;
    try {
        response = await fetch(url, {
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch {
        throw new Error(`HTTP Error ${url}`);
    }

    if (response.status !== 200) {
        throw new Error(`HTTP Error ${url}`);
    }

    try {
        const body = decodeBody(await response.arrayBuffer(), response.headers.get("content-type"));
        return { url, ...parseFeed(body) };
    } catch {
        throw new Error(`Failed to parse a feed: ${url}`);
    }
}
