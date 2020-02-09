import Vue from "vue";
import OptionsVue from "./vue/options.vue";

document.addEventListener("DOMContentLoaded", () => {
    new Vue({
        el : "#app",
        components: { OptionsVue },
        template: "<options-vue/>"
    });
});
