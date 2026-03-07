# 青葉整体院 デモサイト仕様書

## 1. 目的
- 本フォルダは、営業用ポートフォリオとして使う汎用・信頼系テンプレートのデモサイトです。
- 目的は「初見のユーザーが迷わず、必要情報を確認し、予約まで到達できる」標準品質を示すことです。
- ブランド名は `青葉整体院` です。

## 2. 対象範囲
- 対象パス: `nakayama_works_lp/demos/aoba-seitai/`
- 主要ファイル:
  - `index.html`
  - `i18n-demo.js`
  - `images/`

## 3. テンプレートコンセプト
### Universal Trust Template
「料金・施術内容・通院目安・アクセス・予約方法が、迷わず確認できる」

- 情報の抜けを作らない（料金・時間・場所・支払い・駐車場・キャンセル）
- 予約導線は上部と下部の両方に配置（モバイルは固定CTAも可）
- 写真は世界観より清潔感と院内の安心感を優先

## 4. デザイン方針
- キーワード: `Simple / Trust / Clean / Universal`
- 配色:
  - ホワイト × ライトグレー
  - ネイビーをアクセントに使用
- 余白は十分に確保しつつ、情報密度は維持
- 過剰な演出・強いグラデーション・過多な装飾は避ける

## 5. ページ構成（TOP）
- 固定ナビ（`#topNav`）
- Hero（`#hero`）
- Notice（`#notice`）
- 施術・料金（`#menu`）
- Features（`#features`）
- Staff（`#staff`）
- Gallery（`#gallery`）
- Access（`#access`）
- FAQ（`#faq`）
- CTA（`#ctaReserve`）
- Footer

## 6. UX仕様
- 言語選択ゲートなし（初期表示を優先）
- ヘッダーの `Lang` セレクトで即時切替
- 多言語対応: `ja`, `en`, `zh-TW`, `es`, `ko`
- スクロール演出: `IntersectionObserver` による軽いフェード
- モバイルナビ: ハンバーガー対応
- モバイル固定CTA: `#mobileReserve`

## 7. モーダル仕様
- Price / Plan Modal（任意・最小）
  - 初回/通常の違い、注意事項など
- Gallery Lightbox
  - 前後ボタン
  - キーボード矢印対応
  - スワイプ対応

## 8. 予約導線仕様
- 予約先URL:
  - `const RESERVE_BASE_URL = 'https://misemaru.cloud/jp/aoba-seitai/';`
- 対象リンク:
  - `#navReserve`, `#heroReserve`, `#ctaReserve`, `#mobileReserve`
- 付与パラメータ:
  - `lang`
  - `return`

## 9. コンテンツデータ仕様
- `window.DEMO_I18N`
- `window.DEMO_BADGES`
- `window.DEMO_NOTICE_ITEMS`
- `window.DEMO_MENU_ITEMS`
- `window.DEMO_FEATURE_ITEMS`
- `window.DEMO_STAFF_ITEMS`
- `window.DEMO_GALLERY_ITEMS`
- `window.DEMO_STORE_INFO`
- `window.DEMO_FAQ_ITEMS`

## 10. 画像方針
- Hero: 院内の清潔感（受付/施術室）
- Staff: 1〜2名
- Gallery: 院内・施術イメージを中心に最小構成
- 表示は `loading="lazy"` を基本

## 11. SEO / パフォーマンス方針
- `h1` は1つ
- 住所・電話・受付時間はテキスト表示
- 重い依存なし（素のJS + CSS）

## 12. 横展開手順
1. ディレクトリを新しいslugでコピー
2. `i18n-demo.js` のブランド文言・データ差し替え
3. `RESERVE_BASE_URL` 差し替え
4. `images/` 差し替え
5. PC/モバイル・言語切替・予約リンクを確認
