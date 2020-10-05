<template>
    <div :class="$style.viewer">
        <ul :class="[ $style.pane, $style.feeds ]">
            <viewer-feed
                v-for="subscription in subscriptions"
                :key="subscription.url"
                :subscription="subscription"
                :is-open="activeSubscription.url === subscription.url"
            />
        </ul>
        <ul
            ref="entries"
            :class="[ $style.pane, $style.entries ]"
        >
            <viewer-entry
                v-for="entry in activeSubscription.entries"
                :key="entry.url"
                :entry="entry"
            />
        </ul>
        <div :class="$style.controls">
            <button
                v-if="currentTabFeed"
                :class="$style.control"
                title="Subscribe this feed"
                @click="add"
            >
                <img src="assets/plus.svg">
            </button>
            <button
                :class="$style.control"
                title="Manage watchings"
                @click="edit"
            >
                <img src="assets/edit.svg">
            </button>
            <button
                :class="$style.control"
                :title="`Reload - Updated ${formattedUpdatedAt}`"
                @click="reload"
            >
                <img src="assets/reload.svg">
            </button>
        </div>
    </div>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

.viewer {
    display: block;
    height: $height-all;
    padding: $vertical-padding 0;
    overflow: hidden;
    font-size: 14px;
}

.pane {
    position: absolute;
    top: $vertical-padding;
    height: $height-all - ($vertical-padding * 2);

    margin: 0;
    padding: 0;
    list-style: none outside;
    overflow-y: scroll;
}

.feeds {
    left: 0;
    width: $width-feed;
}

.entries {
    left: $width-feed;
    width: $width-all - $width-feed;
}

.controls {
    position: absolute;
    bottom: $vertical-padding + 8px;
    right: 22px;

    display: flex;
    flex-direction: column;
}

.control {
    display: block;
    margin: 4px;
    border: 1px solid #aaa;
    border-radius: 8px;
    padding: 5px;

    cursor: pointer;

    background-color: #eee;
    opacity: .7;
    transition: all .2s;
    &:hover {
        background-color: #eee;
        opacity: 1;
    }
    &:active {
        background-color: #eee;
    }

    > img {
        display: block;
        width: 20px;
        height: 20px;
    }
}
</style>

<script lang="ts">
import { Component, Vue, Emit } from "vue-property-decorator";
import { loadFeed } from "../logics/load-feed";
import * as AppStorage from "../logics/app-storage";
import { Feed } from "../models/feed";
import { Subscription } from '../models/subscription';
import { currentUrl } from "../utils/current-url";
import { timeDifference } from "../utils/datetime";
import { PopupMode } from "./popup.vue";
import ViewerFeed from "./viewer-feed.vue";
import ViewerEntry from "./viewer-entry.vue";

@Component({
    components: {
        ViewerFeed,
        ViewerEntry,
    },
})
export default class Viewer extends Vue {
    /* State */

    updatedAt: Date | null = null;
    subscriptions: Subscription[] = [];
    activeSubscription: Subscription | {} = {};
    currentTabUrl: string | null = null;
    currentTabFeed: Feed | null = null;

    /* Computed */

    get formattedUpdatedAt() {
        return this.updatedAt ? timeDifference(this.updatedAt) : "";
    }

    /* Initializing */

    created() {
        this.$on("open", (subscription: Subscription) => {
            this.activeSubscription = subscription;
            const ref = this.$refs["entries"] as any;
            ref.scrollTop = 0;
        });

        this.initAddButton();
        this.initSubscriptions();
    }

    async initSubscriptions() {
        this.subscriptions = await AppStorage.getSubscriptions();
        this.updatedAt = await AppStorage.getTimestamp();
    }

    async initAddButton() {
        if (chrome && chrome.tabs && chrome.tabs.query) {
            try {
                const url = await currentUrl();
                if (url) {
                    this.currentTabUrl = url;
                    this.currentTabFeed = await loadFeed(url);
                }
            } catch (_) {
                this.currentTabFeed = null;
            }
        }
    }

    /* Actions */

    async reload() {
        await AppStorage.requestReload();
    }

    async add() {
        if (this.currentTabUrl && this.currentTabFeed) {
            await AppStorage.setFeedCache({
                url: this.currentTabUrl,
                title: this.currentTabFeed.title,
                link: this.currentTabFeed.link,
                entries: this.currentTabFeed.entries,
                error: false,
            });

            this.subscriptions = await AppStorage.addSubscription({
                title: this.currentTabFeed.title,
                url: this.currentTabUrl,
            });
        }
    }

    @Emit("popup-mode")
    edit(): PopupMode {
        return "editor";
    }
}
</script>
