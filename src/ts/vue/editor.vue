<template>
    <div :class="$style.editor">
        <h2 :class="$style.caption">
            Feeds
        </h2>
        <ul :class="$style.feeds">
            <editor-feed
                v-for="(feed, idx) in feeds"
                :key="feed.uiKey"
                :url.sync="feed.url"
                :title.sync="feed.title"
                :is-new-item="idx === (feeds.length - 1)"
                @remove="remove(feed)"
                @moveUp="moveUp(feed)"
                @moveDown="moveDown(feed)"
            />
        </ul>
        <div :class="$style.control">
            <button @click="viewer">
                &#x2039;
            </button>
        </div>
    </div>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

.editor {
    display: block;
    height: $height-all;
    padding: $vertical-padding 1em;
    overflow-x: hidden;
    overflow-y: scroll;
    font-size: 14px;
}

.caption {
    font-size: 18px;
    font-weight: bold;
    line-height: 1.5em;
    margin: .5em 0;
    padding: 0;
}

.feeds {
    display: block;
    margin: 0;
    padding: 0;
    overflow: auto;
}

.control {
    position: absolute;
    top: $vertical-padding;
    right: 22px;
    > button {
        font-size: 2em;
        line-height: 1.2em;
        margin: 0;
        border: 0;
        padding: 0 .5em;
        background-color: transparent;
        color: $color-text;
        &:hover {
            text-shadow: 0 0 .2em $color-text;
        }
        cursor: pointer;
    }
}
</style>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator";
import * as AppStorage from "../logics/app-storage";
import { PopupMode } from "./popup.vue";
import EditorFeed from "./editor-feed.vue";

interface FeedEditing {
    uiKey: number;
    title: string;
    url: string;
}

@Component({
    components: {
        EditorFeed,
    },
})
export default class Editor extends Vue {
    nextUIKey = 0;
    feeds: FeedEditing[] = [];

    created() {
        this.$on("change", async () => {
            this.setupNewEmptyFeed();
            await this.saveFeeds();
            await AppStorage.requestReload();
        });
    }

    async mounted() {
        const subscriptions = await AppStorage.getSubscriptions();

        if (subscriptions && subscriptions.length) {
            this.feeds = subscriptions.map((subscription): FeedEditing => ({
                uiKey: this.nextUIKey++,
                url: subscription.url,
                title: subscription.title,
            }));
        }
        this.setupNewEmptyFeed();
    }

    setupNewEmptyFeed() {
        if (!this.feeds.length || this.feeds[this.feeds.length - 1].url) {
            this.feeds.push({
                uiKey: this.nextUIKey++,
                title: "",
                url: ""
            });
        }
    }

    moveUp(feed: FeedEditing) {
        const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
        if (idx > 0) {
            const feed = this.feeds.splice(idx, 1)[0];
            this.feeds.splice(idx - 1, 0, feed);
        }

        this.$emit("change");
    }

    moveDown(feed: FeedEditing) {
        const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
        if (idx < this.feeds.length - 2) {
            const feed = this.feeds.splice(idx, 1)[0];
            this.feeds.splice(idx + 1, 0, feed);
        }

        this.$emit("change");
    }

    remove(feed: FeedEditing) {
        const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
        this.feeds.splice(idx, 1);

        this.$emit("change");
    }

    async saveFeeds() {
        await AppStorage.setSubscriptions(this.feeds
            .filter((feed) => feed.url)
            .map((feed) => ({
                url: feed.url,
                title: feed.title,
            }))
        );
    }

    @Emit("popup-mode")
    viewer(): PopupMode {
        return "viewer";
    }
}
</script>
