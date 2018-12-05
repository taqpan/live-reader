<template>
<section class="live-reader-options">
    <div>
        <h2>General</h2>
        <div>
            Updates by <input type="number" min="1" max="60"
                              v-model.lazy.number="interval"> minutes (1 - 60)
        </div>
    </div>
    <div>
        <h2>Feeds</h2>
        <ul>
            <options-feed-item v-for="(feed, idx) in feeds" :key="feed.uiKey"
                               :url.sync="feed.url"
                               :title.sync="feed.title"
                               :isNewItem="idx === (feeds.length - 1)"
                               v-on:remove="remove(feed)"
                               v-on:moveUp="moveUp(feed)"
                               v-on:moveDown="moveDown(feed)"
            ></options-feed-item>
        </ul>
        <div>
            <button @click="openOpml">Load OPML</button>
            <input type="file" @change="loadOpml" ref="opmlFileInput">
        </div>
    </div>
    <div>
        <h2>Debug</h2>
        <button @click="debugPrintStorage">Print Storage</button>
        <pre class="debug">{{debug}}</pre>
    </div>
</section>
</template>

<script type="text/babel">
import _ from 'lodash';
import xmljs from 'xml-js';
import storage from '../lib/storage';
import OptionsFeedItem from './options-feed-item.vue';

export default {
    components: {
        OptionsFeedItem
    },

    data() {
        return {
            nextUIKey: 0,
            interval: 15,
            feeds: [],
            debug: ''
        };
    },

    created() {
        this.$on('change', () => {
            this.setupNewEmptyFeed();
            this.saveFeeds();
        });
    },

    async mounted() {
        const data = await storage.getSync();

        if (data.interval) {
            this.interval = data.interval;
        }

        if (data.feeds && data.feeds.length) {
            this.feeds = data.feeds.map(feed => ({
                uiKey: this.nextUIKey++,
                title: feed.title,
                url: feed.url
            }));
        }
        this.setupNewEmptyFeed();
    },

    watch: {
        interval(newValue) {
            storage.setSync('interval', newValue);
        }
    },

    methods: {
        setupNewEmptyFeed() {
            if (!this.feeds.length || this.feeds[this.feeds.length - 1].url) {
                this.feeds.push({
                    uiKey: this.nextUIKey++,
                    title: '',
                    url: ''
                });
            }
        },

        moveUp(feed) {
            const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
            if (idx > 0) {
                const feed = this.feeds.splice(idx, 1)[0];
                this.feeds.splice(idx - 1, 0, feed);
            }

            this.$emit('change');
        },

        moveDown(feed) {
            const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
            if (idx < this.feeds.length - 2) {
                const feed = this.feeds.splice(idx, 1)[0];
                this.feeds.splice(idx + 1, 0, feed);
            }

            this.$emit('change');
        },

        remove(feed) {
            const idx = this.feeds.findIndex(x => x.uiKey === feed.uiKey);
            this.feeds.splice(idx, 1);

            this.$emit('change');
        },

        async saveFeeds() {
            await storage.setSync('feeds', this.feeds
                .filter((feed) => feed.url)
                .map((feed) => ({
                    title: feed.title,
                    url: feed.url
                }))
            );
            console.log('[options saveFeeds]', this.feeds);
        },

        openOpml() {
            this.$refs.opmlFileInput.click();
        },

        loadOpml(ev) {
            const file = ev.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.applyOpml(e.target.result);
            };
            reader.readAsText(file);
        },

        applyOpml(xml) {
            const data = xmljs.xml2js(xml, {compact: true});
            const outline = _.get(data, 'opml.body.outline.outline');
            if (!Array.isArray(outline)) return;

            for (const feed of outline) {
                const attr = feed._attributes;
                if (attr && attr.xmlUrl) {
                    this.feeds.splice(-1, 0, {
                        uiKey: this.nextUIKey++,
                        title: attr.title || attr.text || attr.xmlUrl,
                        url: attr.xmlUrl
                    });
                }
            }

            this.$emit('change');
        },

        async debugPrintStorage() {
            const syncStorageData = await storage.getSync();
            const localStorageData = await storage.getLocal();
            this.debug = '==== SYNC ====\n'
                + JSON.stringify(syncStorageData, null, 2)
                + '\n\n==== LOCAL ====\n'
                + JSON.stringify(localStorageData, null, 2);
        }
    }
};
</script>