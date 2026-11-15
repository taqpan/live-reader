<template>
    <div :class="$style.viewer">
        <ul :class="[$style.pane, $style.feeds]">
            <ViewerFeed
                v-for="subscription in subscriptions"
                :key="subscription.url"
                :subscription="subscription"
                :is-open="activeUrl === subscription.url"
                @open="open"
            />
        </ul>
        <ul
            ref="entriesPane"
            :class="[$style.pane, $style.entries]"
        >
            <ViewerEntry
                v-for="entry in activeEntries"
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
                <img
                    :src="plusIcon"
                    alt="Subscribe"
                >
            </button>
            <button
                :class="$style.control"
                title="Manage watchings"
                @click="emit('popup-mode', 'editor')"
            >
                <img
                    :src="editIcon"
                    alt="Edit"
                >
            </button>
            <button
                :class="$style.control"
                :title="`Reload - Updated ${formattedUpdatedAt}`"
                @click="reload"
            >
                <img
                    :src="reloadIcon"
                    alt="Reload"
                >
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from "vue";
import editIcon from "../assets/edit.svg";
import plusIcon from "../assets/plus.svg";
import reloadIcon from "../assets/reload.svg";
import * as AppStorage from "../logics/app-storage";
import { loadFeed } from "../logics/load-feed";
import type { Entry } from "../models/entry";
import type { Feed } from "../models/feed";
import type { PopupMode } from "../models/popup-mode";
import type { Subscription } from "../models/subscription";
import { currentUrl } from "../utils/current-url";
import { timeDifference } from "../utils/datetime";
import ViewerEntry from "./viewer-entry.vue";
import ViewerFeed from "./viewer-feed.vue";

const emit = defineEmits<{
    "popup-mode": [mode: PopupMode];
}>();

const entriesPane = useTemplateRef<HTMLUListElement>("entriesPane");

const updatedAt = ref<Date | null>(null);
const subscriptions = ref<Subscription[]>([]);
const activeUrl = ref<string | null>(null);
const activeEntries = ref<Entry[]>([]);
const currentTabUrl = ref<string | null>(null);
const currentTabFeed = ref<Feed | null>(null);

const formattedUpdatedAt = computed(() => (updatedAt.value ? timeDifference(updatedAt.value) : ""));

function open(url: string, entries: Entry[]) {
    activeUrl.value = url;
    activeEntries.value = entries;
    if (entriesPane.value) {
        entriesPane.value.scrollTop = 0;
    }
}

async function initSubscriptions() {
    subscriptions.value = await AppStorage.getSubscriptions();
    updatedAt.value = await AppStorage.getTimestamp();
}

// 現在のタブがフィードとして読めるときだけ「購読」ボタンを出す
async function initAddButton() {
    try {
        const url = await currentUrl();
        if (url) {
            currentTabUrl.value = url;
            currentTabFeed.value = await loadFeed(url);
        }
    } catch {
        currentTabFeed.value = null;
    }
}

async function reload() {
    await AppStorage.requestReload();
}

async function add() {
    const url = currentTabUrl.value;
    const feed = currentTabFeed.value;
    if (!url || !feed) return;

    await AppStorage.setFeedCache({
        url,
        title: feed.title,
        link: feed.link,
        entries: feed.entries,
        error: null,
    });
    subscriptions.value = await AppStorage.addSubscription({ title: feed.title, url });
}

onMounted(() => {
    void initAddButton();
    void initSubscriptions();
});
</script>

<style lang="scss" module>
@use "../scss/constants" as *;

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
