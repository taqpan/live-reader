<template>
    <div class="live-reader">
        <ul class="feeds">
            <popup-feed
                v-for="feed in feeds"
                :key="feed.url"
                :feed="feed"
                :is-open="activeFeed.url === feed.url"
            />
        </ul>
        <ul class="entries" ref="entries">
            <li v-for="entry in activeFeed.entries" :key="entry.url">
                <a :href="entry.url" :title="entry.title">{{entry.title}}</a>
            </li>
        </ul>
        <div class="controls">
            <button
                v-if="currentTabFeed"
                class="control-button"
                title="Register current tab"
                @click="add"
            >
                <img src="assets/plus.svg">
            </button>
            <button
                class="control-button"
                title="Manage watchings"
                @click="edit"
            >
                <img src="assets/edit.svg">
            </button>
            <button
                class="control-button"
                :title="`Reload - Last updated at ${formattedUpdatedAt}`"
                @click="reload"
            >
                <img src="assets/reload.svg">
            </button>
        </div>
    </div>
</template>

<script type="text/babel">
import { currentUrl } from "../lib/current-url";
import { parseFeed } from '../lib/parse-feed';
import { storage } from "../lib/storage";
import { Feed } from "../model/feed-item";
import PopupFeed from "./popup-feed.vue";

export default {
    components: {
        PopupFeed
    },

    data() {
        return {
            updatedAt: null,
            feeds: [],
            activeFeed: {},
            currentTabFeed: Feed | null,
        };
    },

    computed: {
        formattedUpdatedAt() {
            if (!this.updatedAt) return "";

            const dt = this.updatedAt;
            const y = dt.getFullYear();
            const m = ("0" + (dt.getMonth() + 1)).slice(-2);
            const d = ("0" + (dt.getDate())).slice(-2);
            const h = ("0" + (dt.getHours())).slice(-2);
            const mi = ("0" + (dt.getMinutes())).slice(-2);
            return `${y}-${m}-${d} ${h}:${mi}`;
        }
    },

    // Called on everytime the popup is opened.
    created() {
        this.refresh();

        this.$on("open", (ev) => {
            this.activeFeed = ev;
            this.$refs["entries"].scrollTop = 0;
        });

        this.currentFeed();
    },

    methods: {
        async reload() {
            storage.setLocal("reloadRequestAt", (new Date()).toString());
        },

        async refresh() {
            this.feeds = await storage.getSync("feeds");
            this.updatedAt = new Date((await storage.getLocal("updatedAt"))) || null;
        },

        async currentFeed() {
            if (chrome && chrome.tabs && chrome.tabs.query) {
                try {
                    const url = await currentUrl();
                    const feed = await parseFeed(url);
                    this.currentTabFeed = feed;
                } catch (_) {
                    console.warn(_);
                    this.currentTabFeed = null;
                }
            }
        },

        async add() {
            console.log(this.currentTabFeed);
        },

        async edit() {
            console.log("###edit");
        }
    }
};
</script>
