'use strict';

import '@babel/polyfill';
import Vue from 'vue';
import PopupVue from './vue/popup.vue';

document.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el : '#app',
        components: { PopupVue },
        template: '<popup-vue/>'
    });
});