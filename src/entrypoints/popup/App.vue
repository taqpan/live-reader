<template>
    <div>
        <Viewer
            v-if="mode === 'viewer'"
            @popup-mode="changeMode"
        />
        <Editor
            v-if="mode === 'editor'"
            @popup-mode="changeMode"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Editor from "../../components/editor.vue";
import Viewer from "../../components/viewer.vue";
import type { PopupMode } from "../../models/popup-mode";

const mode = ref<PopupMode>("viewer");

function changeMode(next: PopupMode) {
    mode.value = next;
}
</script>

<style lang="scss" module>
@use "../../scss/constants" as *;

:global(html) {
    margin: 0;
    border: 0;
    padding: 0;
}

:global(body) {
    color: $color-text;
    background-color: $color-bg;
    min-width: $width-all;
    max-height: $height-all;
    margin: 0;
    border: 0;
    padding: 0;
    overflow: hidden;
}
</style>
