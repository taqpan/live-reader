# LiveReader

ブラウザ拡張の簡易フィードリーダー（Firefox Live Bookmarks の代替）。
ツールバーのポップアップから購読フィードの最新見出しを一覧するだけに絞っている。既読管理や本文ビューアは作らない。

## コマンド

| 用途 | コマンド |
|---|---|
| 依存のインストール | `npm ci` |
| 開発（Firefox / Chrome） | `npm run dev` / `npm run dev:chrome` |
| lint + 型チェック + テスト | `npm run check` |
| Firefox ビルドの検証 | `npm run lint:firefox`（web-ext lint） |
| 配布用 zip | `npm run zip`（`.output/` に出力） |

変更したら `npm run check` と `npm run build` が通ることを確認する。

## 構成

- WXT（Vite）+ Vue 3（`<script setup>`）+ TypeScript。設定は `wxt.config.ts`
- Firefox は Manifest V2、Chrome は Manifest V3（WXT の既定）。manifest は `wxt.config.ts` と各エントリポイントの HTML の `<meta name="manifest.*">` から生成される
- `src/entrypoints/` background / popup / options
- `src/logics/` 取得（`load-feed`）、パース（`parse-feed`）、OPML、ストレージ、定期更新（`updater`）
- `src/components/` popup 内の Vue コンポーネント

## 守ること

- background は Chrome では service worker で動く。`DOMParser`・`XMLHttpRequest`・`window`・`document` と、長い `setTimeout` は使わない
  - XML は `src/utils/xml.ts`（fast-xml-parser）でパースする
  - 定期更新は `alarms` API で予約する
  - リスナーは `defineBackground` の中で同期的に登録する
- ストレージのキー（sync: `feeds`, `interval` / local: フィードURL, `updatedAt`, `reloadRequestAt`）は既存ユーザーのデータと互換を保つ。変えるときは移行処理を入れる
- フィードの文字コードは `src/utils/decode.ts` で判定する（Shift_JIS / EUC-JP のフィードがある）
- 拡張 API は `wxt/browser` の `browser` を使う。テストでは `wxt/testing/fake-browser` を使う
- 自動 import は無効（`imports: false`）。import は明示的に書く
