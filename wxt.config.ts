import { defineConfig } from "wxt";

// Firefox: Manifest V2 / Chrome: Manifest V3（WXT の既定値）
export default defineConfig({
    srcDir: "src",
    modules: ["@wxt-dev/module-vue"],
    imports: false,
    manifest: ({ browser }) => ({
        name: "LiveReader",
        description: "Simple feed reader add-ons, yet another Firefox Live Bookmarks.",
        permissions: ["storage", "alarms"],
        host_permissions: ["http://*/*", "https://*/*"],
        icons: {
            16: "icon/16.png",
            32: "icon/32.png",
            48: "icon/48.png",
            96: "icon/96.png",
            128: "icon/128.png",
        },
        ...(browser === "firefox"
            ? {
                browser_specific_settings: {
                    gecko: {
                        id: "live-reader@taqpan.com",
                        strict_min_version: "142.0",
                        data_collection_permissions: {
                            required: ["none"],
                        },
                    },
                },
            }
            : {}),
    }),
});
