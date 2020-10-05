import { Entry } from './entry';

export interface Feed {
    url: string;
    type: "rss1" | "rss2" | "atom";
    title: string;
    link: string;
    entries?: Entry[];
}
