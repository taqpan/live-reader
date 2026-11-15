import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";
import { ReloadRequestKey } from "../logics/app-storage";
import { AlarmName, ensureScheduled, runUpdate, schedule } from "../logics/updater";

export default defineBackground(() => {
    // MV3 では service worker が停止・再開されるため、リスナーは同期的に登録する
    browser.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === AlarmName) void runUpdate();
    });

    browser.storage.onChanged.addListener((changes, areaName) => {
        // popup / options からの再読込要求
        if (areaName === "local" && ReloadRequestKey in changes) {
            void runUpdate();
        }
        // 更新間隔が変わったら予約し直す
        if (areaName === "sync" && "interval" in changes) {
            void schedule();
        }
    });

    browser.runtime.onStartup.addListener(() => void runUpdate());
    browser.runtime.onInstalled.addListener(() => void runUpdate());

    void ensureScheduled();
});
