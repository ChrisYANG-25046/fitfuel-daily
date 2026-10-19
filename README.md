# 🥗 減量・食事記録アプリ (FitFuel Daily / Meal Tracker)

Next.js (App Router) + TypeScript + Tailwind CSS + Supabase で構築された、減量・PFCバランス管理アプリです。

---

## 🚀 主な機能

1. **AI 食事写真解析（画像アップロード判定）**:
   - 食事の写真（JPEG/PNG/WebP）をアップロードまたはスマホで撮影するだけで、AIが料理を自動識別し、食品名・推定カロリー・PFC（タンパク質・脂質・炭水化物）を自動計算・入力。
   - 解析中アニメーションおよび画像プレビュー表示付き。手動での微調整も自由に行えます。
   - （オプション）`.env.local` に `GEMINI_API_KEY` または `OPENAI_API_KEY` を設定すると、Google Gemini 1.5 Flash や OpenAI Vision による高精度リアルタイム推論にシームレスにアップグレードされます（未設定時も内蔵画像エンジンにより動作可能）。
2. **カロリー・PFC 自動予測機能**:
   - 食品名（例：「りんご」「白ご飯」「鶏胸肉」など）を入力して「自動予測」ボタンを押すと、栄養素データを自動計算。
3. **マイセット（よく食べる食事）機能**:
   - よく食べる定番メニューを保存し、ワンタップで本日の食事（`meals` テーブル）に即座に追加。
4. **目標進捗バー & PFC サマリー**:
   - 1日の目標カロリー（デフォルト: 2000 kcal）に対する動的な進捗バーを表示。
   - たんぱく質 (P)・脂質 (F)・炭水化物 (C) の摂取合計をカード形式でわかりやすく可視化。
5. **Supabase クラウド同期**:
   - ページを更新・リロードしてもデータは保持されます。

---

## 📁 プロジェクト構成

```text
meal-tracker/
├── .env.local             # Supabase URL / Anon Key / 各種 API Key
├── .env.local.example     # 環境変数テンプレート
├── supabase/
│   └── schema.sql         # meals および presets のテーブル定義・RLS ポリシー
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-food-image/
│   │   │       └── route.ts # AI 画像解析 API エンドポイント
│   │   ├── layout.tsx     # ルートレイアウト（日本語化設定）
│   │   └── page.tsx       # メイン UI
│   ├── lib/
│   │   └── supabaseClient.ts # Supabase クライアント
│   └── types/
│       └── meal.ts        # Meal, Preset 型定義
```

---

## 🛠️ 起動方法

```bash
npm run dev
```
ブラウザで [http://localhost:3000](http://localhost:3000) を開いてご利用ください。
