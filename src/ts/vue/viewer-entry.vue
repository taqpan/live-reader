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

<style lang="scss" module>
@import "../../scss/constants.scss";

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
            color: darken($color-text, 25%);
        }
    }
}
</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Entry } from "../models/entry";

@Component
export default class ViewerEntry extends Vue {
    @Prop({ required: true, default: null })
    entry!: Entry;
}
</script>
