<template>
    <div>
        <viewer
            v-if="mode === 'viewer'"
            @popup-mode="changeMode"
        />
        <editor
            v-if="mode === 'editor'"
            @popup-mode="changeMode"
        />
    </div>
</template>

<style lang="scss" module>
@import "../../scss/constants.scss";

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

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Viewer from "./viewer.vue";
import Editor from "./editor.vue";

export type PopupMode = "viewer" | "editor";

@Component({
    components: {
        Viewer,
        Editor,
    },
})
export default class Popup extends Vue {
    mode: PopupMode = "viewer";

    changeMode(mode: PopupMode) {
        this.mode = mode;
    }
}
</script>
