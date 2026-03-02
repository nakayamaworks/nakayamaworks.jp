# Organic Hair Salon LINO デモサイト仕様書

## 1. 目的
- 本フォルダは、営業用ポートフォリオとして使用するナチュラル系オーガニック美容室のデモサイトです。
- 本テンプレートは Luxury 系（`Salon de ÉCLAT`）とは異なる `Organic Story Template` として設計します。
- 目的は「Nakayama Works は業種やブランド世界観に応じて、構成・演出・UXをゼロから最適化できる」ことを示すことです。
- ブランド名は `Organic Hair Salon LINO` です。

## 2. 対象範囲
- 対象パス: `nakayama_works_lp/demos/organic-hair-salon-lino/`
- 主要ファイル（想定）:
  - `index.html`（レイアウト・スタイル・挙動）
  - `i18n-demo.js`（多言語文言・メニュー詳細データ）
  - `images/`（ヒーロー、素材、スタイル、スタッフ、アクセス関連）

## 3. テンプレートコンセプト
### Organic Story Template
「森の奥にある美容室へ入っていく体験」

- 情報より空気感を優先
- スクロール = 物語の進行
- 写真・余白・静かな動き
- 押し売りしない予約導線

## 4. デザイン方針
- キーワード: `Calm` / `Organic` / `Healing` / `Nature` / `Breathing`
- ビジュアル:
  - ベージュ / 生成り / オリーブ
  - 自然光の写真
  - 木・植物・布・紙の質感
  - 影は柔らかく大きく
  - 直線より丸み
- 禁止事項:
  - ゴールド
  - 強いコントラスト
  - キラキラした質感
  - 派手な動き

## 5. タイポグラフィ
- 欧文: `Quicksand`
- 見出し: `M PLUS Rounded 1c`
- 本文: `Noto Sans JP`
- 行間は広めに設定し、呼吸感のある可読性を優先します。

## 6. ページ構成（LINO専用）
`ÉCLAT` とは完全に異なる構成で実装します。

- Opening（`#opening`）
  - 背景は、ぼかした葉と自然光
  - ロゴをゆっくりフェードイン
  - 数秒後にヒーローへ自動遷移
- Hero
  - フルスクリーン
  - 動画または超低速ズーム画像
  - コピーは最小限
  - 表示文言:
    - `Organic Hair Salon`
    - `LINO`
    - `静かな美しさを、あなたへ`
  - 予約ボタンは置かない（重要）
- Philosophy
  - 短い言葉のみで思想を伝える
  - カード形式は使わず、余白中心で構成
- Natural Materials
  - 植物由来カラー / 頭皮ケア / 水 / 空気 / 香り
  - 横スクロール導線可
- Style Gallery
  - 写真主役
  - Masonry 風レイアウト
  - クリックで拡大
- Stylist
  - 人の温かさを重視
  - 作り込み過剰な演出を避ける
- Access
  - 地図 / 店舗情報 / 営業時間
- Reservation（最下部）
  - ここで初めて予約導線を表示
  - 静かな CTA、ボタン1つ
  - 押し売り感を出さない

## 7. UX・アニメーション仕様
- 基本思想: 「呼吸するような動き」
- スクロール演出:
  - ふわっと出現
  - 上下 `10px`〜`20px` の移動
  - `0.6s`〜`1.2s` のゆるやかな遷移
- パララックス（Natural版）:
  - 前景: 葉 / ぼかし / 光
  - 後景: 店内
- 背景変化:
  - セクションごとに明るさ・色温度・空気感を調整

## 8. モーダル仕様
- Gallery Lightbox:
  - 画像拡大
  - スワイプ対応
  - 矢印キー対応

## 9. 予約導線仕様
- 表示箇所:
  - 最下部のみ（重要）
  - ナビ固定ボタンなし
- 予約先URL（想定 `index.html` 内）:
  - `const RESERVE_BASE_URL = 'https://misemaru.cloud/jp/organic_hair_salon_lino/';`
- リンク付与パラメータ:
  - `lang`（現在言語）
  - `return`（このデモページURL）

## 10. コンテンツデータ仕様
`ÉCLAT` と同様にグローバル変数で管理します。

- `window.DEMO_I18N`
- `window.DEMO_MENU_DETAILS`
- `window.DEMO_MENU_LABELS`

## 11. 画像方針
- 最優先:
  - 自然光
  - 木
  - 植物
  - 布
  - ナチュラルな人
- 禁止:
  - 強い照明
  - スタジオ感の強いカット

## 12. SEO / パフォーマンス方針
- ヒーローの `h1` は1つに統一
- 動画は軽量化（必要なら短尺ループ + 圧縮）
- 画像は必要箇所で `loading="lazy"` を使用
- JSは最小構成（重いライブラリ依存を避ける）

## 13. 現在のブランド固有値
- ブランド表示:
  - 1行目: `Organic Hair Salon`
  - 2行目: `LINO`
- 想定公開URL:
  - `/demos/organic-hair-salon-lino/`
