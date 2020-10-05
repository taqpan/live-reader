<template>
    <li :class="$style.subscription">
        <div :class="$style.inputs">
            <div :class="$style.field">
                <label>Title</label>
                <input
                    v-model.lazy.trim="title_"
                    type="text"
                    placeholder="Feed Title"
                >
            </div>
            <div :class="$style.field">
                <label>URL</label>
                <input
                    v-model.lazy.trim="url_"
                    type="text"
                    :class="{ invalid: isError }"
                    placeholder="Feed URL"
                >
            </div>
            <div
                v-if="isError"
                :class="$style.error"
            >
                The feed URL is invalid.
            </div>
        </div>
        <div :class="[$style.controls, $style.move]">
            <button
                :disabled="isNewItem"
                @click="$emit('moveUp')"
            >
                &#x25b2;
            </button>
            <button
                :disabled="isNewItem"
                @click="$emit('moveDown')"
            >
                &#x25bc;
            </button>
        </div>
        <div :class="$style.controls">
            <button
                :disabled="isNewItem"
                @click="$emit('remove')"
            >
                &#x2717;
            </button>
        </div>
    </li>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

.subscription {
    display: flex;
    list-style: none;
    text-indent: 0;
    padding: 0;
    margin: 0;
    width: 100%;
}

.inputs {
    margin: 0 0 .5em;
    flex: 1;
    > input {
        width: 100%;
    }
}

.field {
    display: flex;
    align-items: center;
    > label {
        display: block;
        width: 3em;
    }
    > input {
        flex: 1;
    }
}

.controls {
    display: flex;
    align-items: center;
    margin: 0 0 .5em .5em;

    button {
        display: block;
        margin: 0;
        padding: 0 .2em;
        border: 0;
        font-size: 1.2em;
        cursor: pointer;
        background-color: transparent;
        color: $color-text;
        &:hover {
            text-shadow: 0 0 .2em $color-text;
        }
    }

    &.move {
        flex-direction: column;
    }
}

.error {
    color: $color-red;
}

</style>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { loadFeed } from "../logics/load-feed";
import { Feed } from "../models/feed";

const UrlRegExp = new RegExp(/https?:\/\/[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi);

@Component
export default class EditorFeed extends Vue {
    @Prop({ default: "" })
    url!: string;

    @Prop({ default: "" })
    title!: string;

    @Prop({ default: true })
    isNewItem!: boolean;

    isError = false;

    get title_() {
        return this.title;
    }
    set title_(value: string) {
        if (this.title !== value) {
            this.$emit("update:title", value);
            this.commitChange();
        }
    }

    get url_() {
        return this.url;
    }
    set url_(value: string) {
        if (this.url !== value) {
            this.$emit("update:url", value);
            this.commitChange();
            this.validateUrl(value);
        }
    }

    commitChange() {
        this.$parent.$emit("change");
    }

    async validateUrl(url: string) {
        if (!url.match(UrlRegExp)) {
            this.isError = true;
            return;
        }

        let feed: Feed;
        try {
            feed = await loadFeed(url);
        } catch (err) {
            this.isError = true;
            return;
        }

        this.isError = false;
        if (!this.title) {
            this.title_ = feed.title;
            this.commitChange();
        }
    }
}
</script>
