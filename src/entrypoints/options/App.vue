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
                        accept=".opml,.xml,text/xml,application/xml,text/x-opml"
                        @change="loadOpml"
                    >
                </div>
                <div>
                    <a
                        v-if="opmlUrl"
                        :class="$style.button"
                        :href="opmlUrl"
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

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from "vue";
import * as AppStorage from "../../logics/app-storage";
import * as Opml from "../../logics/opml";

const opmlFileInput = useTemplateRef<HTMLInputElement>("opmlFileInput");

const interval = ref(AppStorage.DefaultInterval);
const opmlUrl = ref("");
const success = ref("");
const error = ref("");

let loaded = false;
watch(interval, (value) => {
    if (loaded && Number.isFinite(value) && value > 0) {
        void AppStorage.setInterval(value);
    }
});

function selectOpml() {
    opmlFileInput.value?.click();
}

async function loadOpml(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
        const n = await Opml.importOpml(file);
        await AppStorage.requestReload();
        success.value = `Imported ${n} feed${n === 1 ? "" : "s"}.`;
        error.value = "";
        await prepareOpmlUrl();
    } catch (err) {
        success.value = "";
        error.value = err instanceof Error ? err.message : "Failed to read the file as OPML.";
    } finally {
        input.value = "";
    }
}

async function prepareOpmlUrl() {
    try {
        const xml = await Opml.exportOpml();
        if (opmlUrl.value) URL.revokeObjectURL(opmlUrl.value);
        opmlUrl.value = URL.createObjectURL(new Blob([xml], { type: "application/xml" }));
    } catch (err) {
        if (err instanceof Error) {
            error.value = err.message;
        }
    }
}

onMounted(async () => {
    interval.value = await AppStorage.getInterval();
    loaded = true;
    await prepareOpmlUrl();
});

onBeforeUnmount(() => {
    if (opmlUrl.value) URL.revokeObjectURL(opmlUrl.value);
});
</script>

<style lang="scss" module>
@use "../../scss/constants" as *;

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

    text-decoration: none;
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
