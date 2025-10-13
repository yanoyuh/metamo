# Metamo - AI画像編集Webアプリケーション

MetamoはAIを活用した画像編集Webアプリケーションです。チャット形式で編集指示を入力し、AIが画像を自動編集します。

## 主な機能

- 🤖 **AIによる画像編集**: チャット形式で編集指示を入力
- 🎨 **インタラクティブなキャンバス**: Fabric.jsによるズーム、パン、領域選択
- 📜 **編集履歴管理**: アンドゥ・リドゥ機能
- 💾 **プロジェクト管理**: 複数プロジェクトの作成・管理
- 👤 **ユーザー認証**: Supabase Auth統合
- 📊 **プラン管理**: 無料・プロ・ビジネスプランに対応
- 🎯 **使用量制限**: ストレージとAI呼び出し回数の制限管理

## 技術スタック

### Frontend
- **React 18.3** - UIライブラリ
- **TypeScript 5.x** - 型安全性
- **TanStack Router** - ファイルベースルーティング
- **TailwindCSS + DaisyUI** - スタイリング
- **Fabric.js** - キャンバス操作

### Backend
- **Node.js 20** - ランタイム
- **Prisma 6.x** - ORM
- **PostgreSQL** - データベース
- **Supabase** - 認証・データベースホスティング

### AI
- **Vercel AI SDK 4.2+** - マルチプロバイダー対応
  - Google Gemini
  - OpenAI GPT-4o
  - Anthropic Claude

### Testing
- **Vitest** - ユニットテスト (58 tests passing)
- **Testing Library** - Reactコンポーネントテスト

### DevOps
- **Docker** - コンテナ化
- **Docker Compose** - ローカル開発環境
- **pnpm** - パッケージマネージャー

## クイックスタート

### 前提条件

- Node.js 20以降
- pnpm 10以降
- Supabaseアカウント
- AI APIキー（Google / OpenAI / Anthropicのいずれか）

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/metamo.git
cd metamo

# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集して必要な値を設定

# データベースのセットアップ
pnpm db:push
pnpm db:seed

# 開発サーバー起動
pnpm dev
```

ブラウザで http://localhost:3000 を開きます。

## Docker を使用した開発

```bash
# すべてのサービスを起動
pnpm docker:up

# データベースの初期化
docker-compose exec app pnpm db:migrate
docker-compose exec app pnpm db:seed

# サービスの停止
pnpm docker:down
```

詳細は [DOCKER.md](./DOCKER.md) を参照してください。

## プロジェクト構造

```
metamo/
├── app/                          # アプリケーションコード
│   ├── components/               # Reactコンポーネント
│   ├── contexts/                 # Reactコンテキスト
│   ├── routes/                   # TanStack Routerページ
│   ├── services/                 # ビジネスロジック層
│   └── utils/                    # ユーティリティ
├── prisma/                       # Prismaスキーマ
├── .kiro/                        # Kiro仕様書
├── Dockerfile                    # Dockerイメージ定義
├── docker-compose.yml            # Docker Compose設定
└── package.json                  # 依存関係とスクリプト
```

## 利用可能なスクリプト

### 開発
```bash
pnpm dev              # 開発サーバー起動
pnpm build            # 本番ビルド
pnpm preview          # ビルドプレビュー
```

### テスト
```bash
pnpm test             # テスト実行（watch）
pnpm test:run         # テスト実行（一度のみ）
```

### データベース
```bash
pnpm db:push          # スキーマ適用
pnpm db:seed          # シードデータ投入
pnpm db:migrate       # マイグレーション実行
```

### Docker
```bash
pnpm docker:up        # コンテナ起動
pnpm docker:down      # コンテナ停止
pnpm docker:logs      # ログ表示
```

## 環境変数

必須の環境変数:

```env
# Supabase
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"

# Database
DATABASE_URL="postgresql://..."

# AI API (最低1つ必要)
VITE_GOOGLE_AI_API_KEY="..."
# または
VITE_OPENAI_API_KEY="..."
# または
VITE_ANTHROPIC_API_KEY="..."
```

詳細は `.env.example` を参照してください。

## デプロイメント

推奨プラットフォーム:
- Railway
- Render
- Fly.io

デプロイ手順は [DOCKER.md](./DOCKER.md) を参照してください。

## テスト

```bash
# すべてのテストを実行
pnpm test:run

# テスト結果: 58 tests passing
# - AuthService: 9 tests
# - EditorService: 7 tests
# - PlanService: 8 tests
# - その他のサービス: 34 tests
```

## ライセンス

MIT License

## サポート

- 📖 ドキュメント: `.kiro/specs/ai-image-editor/`
- 🐛 Issue報告
- 💬 ディスカッション

---

Built with ❤️ using React, TypeScript, and AI