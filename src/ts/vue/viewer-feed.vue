<template>
    <li :class="$style.feed">
        <a
            v-if="!!link"
            :href="link"
            :class="[ isOpen ? $style.active : undefined, isError ? $style.error : undefined ]"
            target="_blank"
            rel="noopener noreferrer"
            @mouseenter="onMouseEnter"
        >{{ subscription.title }}</a>
        <span
            v-else
            :class="[ isOpen ? $style.active : undefined, isError ? $style.error : undefined ]"
            @mouseenter="onMouseEnter"
        >{{ subscription.title }}</span>
    </li>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

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

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import * as AppStorage from "../logics/app-storage";
import { Entry } from "../models/entry";
import { Subscription } from "../models/subscription";

@Component
export default class ViewerFeed extends Vue {
    @Prop({ required: true, default: null })
    subscription!: Subscription;

    @Prop({ required: true, default: false })
    isOpen!: boolean;

    link: string = "";
    entries: Entry[] = [];
    isError: boolean = false;

    async created() {
        const cache = await AppStorage.getFeedCache(this.subscription.url);
        if (cache && Array.isArray(cache.entries)) {
            this.link = cache.link || "";
            this.entries = cache.entries;
        }
        this.isError = Boolean(!cache || cache.error);
    }

    onMouseEnter() {
        this.$parent.$emit("open", {
            entries: this.entries
        });
    }
}
</script>
