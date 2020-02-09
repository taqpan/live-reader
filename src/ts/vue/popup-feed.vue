<template>
    <li :class="{ active: isOpen, error: isError }">
        <a :href="siteUrl" @mouseenter="onMouseEnter">{{feed.title}}</a>
    </li>
</template>

<script type="text/babel">
import { storage } from "../lib/storage";

export default {
    props: {
        feed: Object,
        isOpen: Boolean
    },

    data() {
        return {
            siteUrl: '',
            entries: [],
            isError: false
        }
    },

    // Called on everytime the popup is opened.
    async created() {
        const data = await storage.getLocal(this.feed.url);
        if (data && Array.isArray(data.items)) {
            this.siteUrl = data.url;
            this.entries = data.items;
        }
        this.isError = Boolean(!data || data.error);
    },

    methods: {
        onMouseEnter() {
            this.$parent.$emit("open", {
                ...this.feed,
                entries: this.entries
            });
        }
    }
};
</script>
