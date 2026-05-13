# SUKASHI - AI Transparent PNG Assets Platform

日本発の次世代AI背景透過アセットプラットフォーム。
クリエイターの想像力を形にするための、最高品質の素材を無料で提供します。

- **GitHub**: [akisuperprof-sketch/ai-asset-platform](https://github.com/akisuperprof-sketch/ai-asset-platform)
- **Vercel**: [ai-asset-platform](https://vercel.com/akisuperprof-gmailcoms-projects/ai-asset-platform)

## ブランド・コンセプト
- **ブランド名**: SUKASHI
- **由来**: 「透過」「透ける」「切り抜き」を想起させ、日本発のブランドとして海外展開もしやすい名称。
- **デザイン**: Apple風Bento Grid + EaseUS VoiceWave風の未来感（Glassmorphism）

## 主要機能 (MVP)
- **AI生成透過PNG**: 背景切り抜き済みの高品質素材
- **検索 & URL同期**: 
  - `?q=[検索語]` および `?category=[カテゴリー]` によるURL同期を実装。
  - ブラウザの戻る/進むに対応し、検索状態をシェア可能。
- **5つの主要カテゴリー**:
  - 日本の食 / 医療・歯科 / 事務用品 / 年中行事 / 日本の日常小物

## 本番投入可能度: 88/100 (接続設定待ち)
> [!IMPORTANT]
> 現在、コードの実装とビルドは完了していますが、**実環境（Supabase/R2）との接続確認が未完了**です。以下の手順で `.env.local` を設定し、疎通確認を完了させることで 100/100 に到達します。

### 🚀 クイック・セットアップ (3 Step)
**Step 1: テンプレートをコピー**
```bash
cp .env.local.template .env.local
```
**Step 2: 実値を入力**
作成した `.env.local` に、Supabase と Cloudflare R2 の認証情報を入力してください。

**Step 3: 疎通確認**
```bash
npx -y tsx src/scripts/check-env.ts
```

## 環境変数セットアップ
実運用には `.env.local` の作成が必要です。以下の表を参考に値を設定してください。
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Settings > API | DB接続先URL | **公開可** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Settings > API | クライアント用Anonキー | **公開可** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings > API | サーバー用管理キー | **秘密** (絶対非公開) |
| `R2_ACCOUNT_ID` | Cloudflare R2 Overview | アカウント識別子 | **秘密** |
| `R2_ACCESS_KEY_ID` | R2 API Tokens | R2アクセス用ID | **秘密** |
| `R2_SECRET_ACCESS_KEY` | R2 API Tokens | R2アクセス用Secret | **秘密** |
| `R2_BUCKET_NAME` | R2 Bucket Dashboard | 保存先バケット名 | 内部利用 |
| `R2_ENDPOINT` | R2 Bucket Settings | S3互換エンドポイント | **秘密** |
| `R2_PUBLIC_BASE_URL` | R2 Public Access | 画像表示用URL | **公開可** |
| `DOWNLOAD_URL_EXPIRES_IN` | 任意設定 | DLリンク有効期限(秒) | 内部利用 |

### 🛠️ Supabase 設定ガイド
1. **SQL実行**: `supabase/schema.sql` の内容を Supabase SQL Editor で実行し、テーブルとRPCを作成します。
2. **キー取得**: `Project Settings > API` から URL と Anon Key を取得し、`service_role` キーも控えます。
3. **注意**: `SUPABASE_SERVICE_ROLE_KEY` はログ記録やダウンロード数更新に使用するため、クライアントサイドのコード（`use client`）では絶対に使用しないでください。

### 📦 Cloudflare R2 設定ガイド
1. **バケット作成**: `sukashi-assets` 等の名前でバケットを作成。
2. **APIトークン**: `Manage R2 API Tokens` から `Edit` 権限を持つトークンを作成し、Access/Secret Keyを取得。
3. **公開設定**: `Settings > Public Access` でカスタムドメインまたは `r2.dev` サブドメインを有効化し、`R2_PUBLIC_BASE_URL` に設定。
4. **画像配置**: 以下のパスでテスト画像をアップロード。
   - `food/onigiri-salted-rice-ball-001.png` (原寸透過PNG)
   - `food/onigiri-salted-rice-ball-001-thumb.webp` (サムネイル)

## 🚀 実疎通確認のステップ（実行順序）
環境変数を設定後、以下の順序で検証を行ってください。

1. **ビルドチェック**: `npm run build`
2. **変数チェック**: `npx tsx src/scripts/check-env.ts` (すべてOKになるまで)
3. **接続検証**: `npx tsx src/scripts/verify-sukashi.ts` (DB/R2接続の健全性確認)
4. **1件目登録**: `npx tsx src/scripts/seed-prod-asset.ts` (テスト用おにぎりの登録)
5. **ブラウザ確認**: `npm run dev` で起動し、おにぎり素材が表示・検索されるか確認。
6. **DL確認**: 詳細ページでダウンロードを実行し、実ファイルが保存されるか確認。
7. **ログ確認**: Supabaseの `download_logs` にレコードが作成されているか確認。
8. **一括投入**: 上記がすべて成功したら `npx tsx src/scripts/seed-food-assets.ts` を実行。

## ⚠️ 安全上の注意
- **検証成功前の大量投入禁止**: 必ず1件目の疎通を確認してから10件投入へ進んでください。
- **実ファイル優先**: R2に画像が存在しない素材をDBに登録しないでください（`seed-food-assets.ts` には自動チェック機能があります）。
- **非表示制御**: `review_status`, `legal_status`, `published_at` の条件が揃わない素材は、APIレベルでアクセスが遮断されます。
- **機密保持**: `.env.local` の内容や、秘密キーが含まれる画面のスクリーンショットを公開しないでください。

### 🧪 テスト用アセットについて
現在、`test-assets/` ディレクトリ内に疎通確認用のダミー画像（おにぎり）が生成されています。これらは表示・ダウンロード・ログ記録の動作テストを目的としたものであり、**本番用の高品質素材ではありません。**

疎通確認完了後、本番素材を Supabase Storage にアップロードして運用を開始してください。

---
© 2026 SUKASHI. All rights reserved.
