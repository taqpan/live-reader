<template>
<li class="feed-item">
    <div class="feed-item-inputs">
        <div>
            <label>Title</label>
            <input type="text" v-model.lazy.trim="title_"
                placeholder="Feed Title">
        </div>
        <div>
            <label>URL</label>
            <input type="text" v-model.lazy.trim="url_"
                :class="{ invalid: isError }"
                placeholder="Feed URL">
        </div>
        <div v-if="isError" class="error">
            The feed URL is invalid.
        </div>
    </div>
    <div class="feed-item-controls">
        <button :disabled="isNewItem" @click="$emit('moveUp')">&#x25b2;</button>
        <br>
        <button :disabled="isNewItem" @click="$emit('moveDown')">&#x25bc;</button>
    </div>
    <div class="feed-item-controls">
        <button :disabled="isNewItem" @click="$emit('remove')">Remove</button>
    </div>
</li>
</template>

<script type="text/babel">
import { parseFeed } from "../lib/parseFeed";

const UrlRegExp = new RegExp(/https?:\/\/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi);

export default {
    props: {
        url: String,
        title: String,
        isNewItem: Boolean
    },

    data() {
        return {
            isError: false
        }
    },

    computed: {
        title_: {
            get() {
                return this.title;
            },
            set(value) {
                if (this.title !== value) {
                    this.$emit("update:title", value);
                    this.commitChange();
                }
            }
        },
        url_: {
            get() {
                return this.url;
            },
            set(value) {
                if (this.url !== value) {
                    this.$emit("update:url", value);
                    this.commitChange();
                    this.validateUrl(value);
                }
            }
        }
    },

    methods: {
        commitChange() {
            this.$parent.$emit("change");
        },

        async validateUrl(url) {
            if (!url.match(UrlRegExp)) {
                this.isError = true;
                return;
            }

            let data;
            try {
                data = await parseFeed(url);
            } catch (err) {
                this.isError = true;
                return;
            }
            console.log(data);

            this.isError = false;
            if (!this.title) {
                this.title_ = data.title;
                this.commitChange();
            }
        }
    }
};
</script>
