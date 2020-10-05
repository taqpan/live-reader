import Vue from "vue";
import Popup from "./vue/popup.vue";

document.addEventListener("DOMContentLoaded", () => {
    new Vue({
        el : "#app",
        components: { Popup },
        template: "<popup/>"
    });
});
