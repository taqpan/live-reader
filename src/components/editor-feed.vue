<template>
    <li :class="$style.subscription">
        <div :class="$style.inputs">
            <div :class="$style.field">
                <label>Title</label>
                <input
                    v-model.lazy.trim="titleModel"
                    type="text"
                    placeholder="Feed Title"
                >
            </div>
            <div :class="$style.field">
                <label>URL</label>
                <input
                    v-model.lazy.trim="urlModel"
                    type="text"
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
                @click="emit('move-up')"
            >
                &#x25b2;
            </button>
            <button
                :disabled="isNewItem"
                @click="emit('move-down')"
            >
                &#x25bc;
            </button>
        </div>
        <div :class="$style.controls">
            <button
                :disabled="isNewItem"
                @click="emit('remove')"
            >
                &#x2717;
            </button>
        </div>
    </li>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { loadFeed } from "../logics/load-feed";

const UrlRegExp = /https?:\/\/[-a-zA-Z0-9@:%_+.~#?&/=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&/=]*)?/i;

const url = defineModel<string>("url", { default: "" });
const title = defineModel<string>("title", { default: "" });

defineProps<{
    isNewItem: boolean;
}>();

const emit = defineEmits<{
    change: [];
    remove: [];
    "move-up": [];
    "move-down": [];
}>();

const isError = ref(false);

const titleModel = computed({
    get: () => title.value,
    set: (value: string) => {
        if (title.value !== value) {
            title.value = value;
            emit("change");
        }
    },
});

const urlModel = computed({
    get: () => url.value,
    set: (value: string) => {
        if (url.value !== value) {
            url.value = value;
            emit("change");
            void validateUrl(value);
        }
    },
});

// URL を実際に取得して検証し、タイトルが空ならフィードのタイトルで補う
async function validateUrl(value: string) {
    if (!UrlRegExp.test(value)) {
        isError.value = true;
        return;
    }

    try {
        const feed = await loadFeed(value);
        isError.value = false;
        if (!title.value) {
            titleModel.value = feed.title;
        }
    } catch {
        isError.value = true;
    }
}
</script>

<style lang="scss" module>
@use "../scss/constants" as *;

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
