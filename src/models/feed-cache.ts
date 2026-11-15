import type { Entry } from "./entry";

export interface FeedCache {
    url: string;
    title: string;
    link?: string;
    entries?: Entry[];
    /** 取得エラーのメッセージ。旧バージョンのキャッシュでは false が入っていることがある */
    error: string | false | null;
}
