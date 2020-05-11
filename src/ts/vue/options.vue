<template>
    <div :class="$style.options">
        <div :class="$style.section">
            <h2 :class="$style.caption">
                General
            </h2>
            <div>
                Updates by <input
                    v-model.lazy.number="interval"
                    style="width:5em;"
                    type="number"
                    min="3"
                    max="300"
                > minutes (3 - 300)
            </div>
        </div>
        <div :class="$style.section">
            <h2 :class="$style.caption">
                Feeds
            </h2>
            <div :class="$style.inline">
                <div :class="$style.load">
                    <button
                        :class="$style.button"
                        @click="selectOpml"
                    >
                        Import OPML
                    </button>
                    <input
                        ref="opmlFileInput"
                        type="file"
                        @change="loadOpml"
                    >
                </div>
                <div>
                    <a
                        v-if="opmlUrl"
                        :class="$style.button"
                        :href="opmlUrl"
                        target="_blank"
                        download="exported-opml.xml"
                    >
                        Export OPML
                    </a>
                </div>
            </div>
        </div>
        <div
            v-if="success"
            :class="$style.success"
        >
            {{ success }}
        </div>
        <div
            v-if="error"
            :class="$style.error"
        >
            {{ error }}
        </div>
    </div>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

.options {
    font-size: 14px;
    margin: 0 1em 1.7em;
    color: #333;
}

.section {
    margin-bottom: 1em;
}

.caption {
    font-size: 18px;
    font-weight: bold;
    line-height: 1.5em;
    margin: 0 0 .5em;
    padding: 0;
}

.inline {
    display: flex;
    align-items: flex-start;
    > * {
        display: block;
    }
}

.load {
    > input {
        display: none;
    }
}

.button {
    display: block;
    margin: 4px;
    border: 1px solid #aaa;
    border-radius: 8px;
    padding: 5px 8px;

    cursor: pointer;

    text-decoration: none;;
    color: #333;
    background-color: #eee;
    opacity: .7;
    transition: all .2s;
    &:hover {
        color: inherit;
        background-color: #eee;
        opacity: 1;
    }
    &:active {
        color: inherit;
        background-color: #eee;
    }
}

.success {
    color: $color-green;
}

.error {
    color: $color-red;
}
</style>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import * as AppStorage from "../logics/app-storage";
import * as Opml from "../logics/opml";

@Component
export default class Options extends Vue {
    interval = 60;
    opmlUrl: string = "";
    success: string = "";
    error: string = "";

    @Watch("interval")
    onInterval(newValue: number) {
        this.interval = newValue;
        AppStorage.setInterval(newValue);
    }

    async mounted() {
        const interval = await AppStorage.getInterval();
        if (interval) {
            this.interval = interval;
        }

        this.prepareOpmlUrl();
    }

    selectOpml() {
        const ctrl = this.$refs.opmlFileInput as any;
        ctrl.click();
    }

    async loadOpml(ev: Event) {
        try {
            const files = (ev.target as HTMLInputElement).files;
            const file = files && files[0];
            if (file) {
                const n = await Opml.importOpml(file);
                await AppStorage.requestReload();
                this.success = `Imported ${n} feed${n > 1 ? "s" : 0}.`;
                this.error = "";
            }
        } catch (err) {
            this.success = "";
            if (err instanceof Error) {
                this.error = err.message;
            } else {
                this.error = "Failed to read the file as OPML.";
            }
        }
    }

    async prepareOpmlUrl() {
        try {
            const doctype = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
            const xml = await Opml.exportOpml();
            const data = `${doctype}\n${xml}`;
            this.opmlUrl = `data:application/xml,${encodeURI(data)}`;
        } catch (err) {
            if (err instanceof Error) {
                this.error = err.message;
            }
        }
    }
}
</script>
