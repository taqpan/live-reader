<template>
    <div :class="$style.editor">
        <h2 :class="$style.caption">
            Feeds
        </h2>
        <ul :class="$style.feeds">
            <EditorFeed
                v-for="(feed, idx) in feeds"
                :key="feed.uiKey"
                v-model:url="feed.url"
                v-model:title="feed.title"
                :is-new-item="idx === feeds.length - 1"
                @change="onChange"
                @remove="remove(feed)"
                @move-up="moveUp(feed)"
                @move-down="moveDown(feed)"
            />
        </ul>
        <div :class="$style.control">
            <button @click="emit('popup-mode', 'viewer')">
                &#x2039;
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import * as AppStorage from "../logics/app-storage";
import type { PopupMode } from "../models/popup-mode";
import EditorFeed from "./editor-feed.vue";

interface FeedEditing {
    uiKey: number;
    title: string;
    url: string;
}

const emit = defineEmits<{
    "popup-mode": [mode: PopupMode];
}>();

let nextUIKey = 0;
const feeds = ref<FeedEditing[]>([]);

/** 末尾に入力用の空行を 1 つ用意する */
function setupNewEmptyFeed() {
    const last = feeds.value[feeds.value.length - 1];
    if (!last || last.url) {
        feeds.value.push({ uiKey: nextUIKey++, title: "", url: "" });
    }
}

async function saveFeeds() {
    await AppStorage.setSubscriptions(feeds.value
        .filter((feed) => feed.url)
        .map((feed) => ({ url: feed.url, title: feed.title })));
}

async function onChange() {
    setupNewEmptyFeed();
    await saveFeeds();
    await AppStorage.requestReload();
}

function indexOf(feed: FeedEditing) {
    return feeds.value.findIndex((x) => x.uiKey === feed.uiKey);
}

function moveUp(feed: FeedEditing) {
    const idx = indexOf(feed);
    if (idx > 0) {
        const [item] = feeds.value.splice(idx, 1);
        if (item) feeds.value.splice(idx - 1, 0, item);
    }
    void onChange();
}

function moveDown(feed: FeedEditing) {
    const idx = indexOf(feed);
    // 末尾の入力用の空行より後ろには動かさない
    if (idx >= 0 && idx < feeds.value.length - 2) {
        const [item] = feeds.value.splice(idx, 1);
        if (item) feeds.value.splice(idx + 1, 0, item);
    }
    void onChange();
}

function remove(feed: FeedEditing) {
    const idx = indexOf(feed);
    if (idx >= 0) {
        feeds.value.splice(idx, 1);
    }
    void onChange();
}

onMounted(async () => {
    const subscriptions = await AppStorage.getSubscriptions();
    feeds.value = subscriptions.map((subscription) => ({
        uiKey: nextUIKey++,
        url: subscription.url,
        title: subscription.title,
    }));
    setupNewEmptyFeed();
});
</script>

<style lang="scss" module>
@use "../scss/constants" as *;

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
        cursor: pointer;

        &:hover {
            text-shadow: 0 0 .2em $color-text;
        }
    }
}
</style>
