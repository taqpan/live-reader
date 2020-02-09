export interface FeedItem {
    url: string;
    title: string;
}

export interface Feed {
    type: "rss1" | "rss2" | "atom";
    url: string;
    title: string;
    items?: FeedItem[];
}
