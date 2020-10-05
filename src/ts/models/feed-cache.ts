import { Entry } from './entry';

export interface FeedCache {
    url: string;
    title: string;
    link?: string;
    entries?: Entry[];
    error: any;
}
