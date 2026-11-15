<template>
    <li :class="$style.entry">
        <a
            :href="entry.url"
            :title="entry.title"
            target="_blank"
            rel="noopener noreferrer"
        >
            {{ entry.title }}
        </a>
    </li>
</template>

<script setup lang="ts">
import type { Entry } from "../models/entry";

defineProps<{
    entry: Entry;
}>();
</script>

<style lang="scss" module>
@use "sass:color";
@use "../scss/constants" as *;

.entry {
    margin: 0;
    padding: 0;
    list-style: none outside;

    > a {
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

        &:visited {
            color: color.adjust($color-text, $lightness: -25%);
        }
    }
}
</style>
