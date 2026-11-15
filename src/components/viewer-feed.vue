<template>
    <li :class="$style.feed">
        <a
            v-if="link"
            :href="link"
            :class="classes"
            target="_blank"
            rel="noopener noreferrer"
            @mouseenter="onMouseEnter"
        >{{ subscription.title }}</a>
        <span
            v-else
            :class="classes"
            @mouseenter="onMouseEnter"
        >{{ subscription.title }}</span>
    </li>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useCssModule } from "vue";
import * as AppStorage from "../logics/app-storage";
import type { Entry } from "../models/entry";
import type { Subscription } from "../models/subscription";

const props = defineProps<{
    subscription: Subscription;
    isOpen: boolean;
}>();

const emit = defineEmits<{
    open: [url: string, entries: Entry[]];
}>();

const style = useCssModule();

const link = ref("");
const entries = ref<Entry[]>([]);
const isError = ref(false);

const classes = computed(() => [
    props.isOpen ? style.active : undefined,
    isError.value ? style.error : undefined,
]);

onMounted(async () => {
    const cache = await AppStorage.getFeedCache(props.subscription.url);
    if (cache && Array.isArray(cache.entries)) {
        link.value = cache.link ?? "";
        entries.value = cache.entries;
    }
    isError.value = !cache || Boolean(cache.error);
});

function onMouseEnter() {
    emit("open", props.subscription.url, entries.value);
}
</script>

<style lang="scss" module>
@use "../scss/constants" as *;

.feed {
    margin: 0;
    padding: 0;
    list-style: none outside;

    > * {
        display: block;
        padding: 7px 14px;
        line-height: 14px;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: $color-text;

        &:hover {
            background-color: $color-bg-highlight;
        }
    }

    > a {
        cursor: pointer;
    }
}

.error {
    color: $color-error !important;
}

.active {
    background-color: $color-bg-highlight;
}
</style>
