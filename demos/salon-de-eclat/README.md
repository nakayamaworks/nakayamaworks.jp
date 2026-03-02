# Salon de ÉCLAT デモサイト仕様書

## 1. 目的
- 本フォルダは、営業用ポートフォリオとして使う高級サロンのデモサイトです。
- 目的は「Nakayama Works なら高品質なブランドサイトを多言語・高UXで構築できる」と一目で伝えることです。
- 現在のブランド名は `Salon de ÉCLAT` です。

## 2. 対象範囲
- 対象パス: `nakayama_works_lp/demos/salon-de-eclat/`
- 主要ファイル:
  - `index.html`（レイアウト・スタイル・挙動）
  - `i18n-demo.js`（多言語文言・施術詳細データ）
  - `images/`（アイコン、施術画像、内装画像）

## 3. デザイン方針
- キーワード: `Elegant` / `Premium` / `Classy` / `Minimal Luxury`
- ビジュアル:
  - 黒ベース + ゴールドアクセント
  - 広めの余白と大きな写真
  - ガラス感のある薄いグラデーションと控えめな光沢
  - 動きは「ゆったり・上品」を優先（派手な演出は禁止）
- タイポ:
  - 欧文: `Cinzel`
  - 和文: `Noto Serif JP`
  - `:lang(...)` による言語別フォント切替

## 4. ページ構成（TOP）
- 固定ナビ: `#topNav`
- ヒーロー: `#hero`
- コンセプト: `#concept`
- 特徴: `#features`
- サロン内観: `#salonGallery`
- メニュー: `#menu`
- スタッフ: `#staff`
- 店舗情報: `#store`
- CTAセクション
- フッター

## 5. UX・アニメーション仕様
- 初期表示フロー:
  - 言語選択ゲート（`#langGate`）-> ウェルカム（`#welcome`）-> 本体表示
- 多言語:
  - 対応言語: `ja`, `en`, `zh-TW`, `es`, `ko`
  - 文言ソース: `window.DEMO_I18N`（`i18n-demo.js`）
- スクロール演出:
  - セクションタイトルは早めに表示
  - セクション本文は遅めに表示
  - `IntersectionObserver` で制御
- モバイルナビ:
  - ハンバーガー（`#menuToggle`）
  - 開閉時にアイコンがバツへ変形
  - ドロップダウン表示アニメーション
- ナビ自動非表示:
  - 最上部では表示
  - スクロール後3秒無操作で上に隠れる
  - スクロール/タッチ/ホイールで即再表示
- ヒーロー背景:
  - 2レイヤー（`#heroBgA`, `#heroBgB`）のクロスフェード
  - ループ切替
- モーダル:
  - 施術詳細モーダル（`#treatmentModal`）
    - 前後ボタン、キーボード矢印、スワイプ、スライド遷移
  - 内観ライトボックス（`#imageLightbox`）
    - 同様に前後移動可能
  - モーダル中の裏スクロール/ラバーバンド抑止（`modalLock`）

## 6. 予約導線仕様
- 予約先URL（`index.html` 内）:
  - `const RESERVE_BASE_URL = 'https://misemaru.cloud/jp/beauty_salon_misemaru_cloud/';`
- 対象リンク:
  - `#navReserve`, `#heroReserve`, `#ctaReserve`
- リンク付与パラメータ:
  - `lang`（現在言語）
  - `return`（このデモページURL）
- 遷移演出:
  - `page-leaving` でフェードアウトして同一タブ遷移（`target="_self"`）

## 7. コンテンツデータ仕様
- グローバル文言:
  - `window.DEMO_I18N`
  - ナビ、各セクション、CTA、フッター、ウェルカム文言を保持
- 施術詳細:
  - `window.DEMO_TREATMENT_DETAILS`
  - 言語ごと + 施術キーごとに保持
  - 施術モーダルに反映
- 施術ラベル:
  - `window.DEMO_TREATMENT_LABELS`
  - 「施術内容」「こんな方に」「料金」などの見出し文言

## 8. 画像・アセット運用
- 最適化画像の配置先:
  - `images/service-optimized/`
  - `images/salon-concept-optimized/`
  - `images/information/`
- 形式推奨:
  - 大きな画像は `WebP` 推奨
  - モバイル表示を想定したサイズ最適化
- 使用アイコン:
  - `icon_reserve.png`
  - `icon_only_lady.png`
  - `icon_quality.png`
  - `icon_business_hours.png`

## 9. SEO / パフォーマンス方針
- ヒーローの `h1` は1つに統一
- セクションIDを明確化し、アンカー遷移を安定化
- 画像は必要箇所で `loading="lazy"` を使用
- 重いライブラリは使わず、基本は素のJS + CSSで実装
- アニメーションは `opacity` / `transform` 中心でGPUフレンドリーにする

## 10. 横展開テンプレ手順（別デモ制作）
1. 本フォルダを新しいslug名でコピーする（`nakayama_works_lp/demos/` 配下）。
2. ブランド文言を差し替える。
   - `index.html`（title、hero、nav brand、footer brand）
   - `i18n-demo.js`（全言語）
3. 画像を差し替える（ファイル名を維持するか、参照パスを更新）。
4. セクション文言・施術詳細データを更新する。
5. 予約先が違う場合は `RESERVE_BASE_URL` を更新する。
6. 最低限の動作確認を行う。
   - PC / モバイル表示
   - 言語選択 -> ウェルカム -> 本体表示
   - ハンバーガー開閉
   - モーダル開閉・スワイプ
   - 予約リンクの `lang` / `return` 付与

## 11. 現在のブランド固有値
- ブランド表示:
  - 1行目: `Salon de`
  - 2行目: `ÉCLAT`
- 想定公開URL:
  - `https://nakayamaworks.jp/demos/salon-de-eclat/`

## 12. 依存・注意点
- 現在の予約サイト遷移先:
  - `https://misemaru.cloud/jp/beauty_salon_misemaru_cloud/`
- 予約サイト側slugを将来変更する場合:
  - `RESERVE_BASE_URL`
  - `return` パラメータを使う戻り処理
  - 予約TOP側の公式サイト戻りURL
  をセットで更新すること。
