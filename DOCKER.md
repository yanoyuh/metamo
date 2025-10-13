# Docker デプロイメントガイド

このドキュメントでは、Metamo アプリケーションをDockerを使用してデプロイする方法を説明します。

## 前提条件

- Docker (20.10以降)
- Docker Compose (v2以降)
- 環境変数の設定

## クイックスタート

### 1. 環境変数の設定

`.env.example` をコピーして `.env` を作成し、必要な値を設定します:

```bash
cp .env.example .env
```

重要な環境変数:
- `VITE_SUPABASE_URL`: Supabase プロジェクトURL
- `VITE_SUPABASE_ANON_KEY`: Supabase 匿名キー
- `VITE_GOOGLE_AI_API_KEY` / `VITE_OPENAI_API_KEY` / `VITE_ANTHROPIC_API_KEY`: AI APIキー（最低1つ必要）

### 2. Dockerコンテナの起動

```bash
# すべてのサービスを起動
pnpm docker:up

# または
docker-compose up -d
```

これにより以下のサービスが起動します:
- PostgreSQL (ポート 5432)
- Supabase (ポート 54322) - オプション
- アプリケーション (ポート 3000)

### 3. データベースの初期化

```bash
# データベースマイグレーションを実行
docker-compose exec app pnpm db:migrate

# シードデータを投入
docker-compose exec app pnpm db:seed
```

### 4. アプリケーションへのアクセス

ブラウザで http://localhost:3000 にアクセスします。

## 利用可能なコマンド

### Docker操作

```bash
# コンテナのビルド
pnpm docker:build

# コンテナの起動（バックグラウンド）
pnpm docker:up

# コンテナの停止
pnpm docker:down

# ログの確認
pnpm docker:logs

# 完全な再ビルド
pnpm docker:rebuild
```

### データベース操作

```bash
# Prismaマイグレーション実行
docker-compose exec app pnpm db:migrate

# Prismaスキーマ生成
docker-compose exec app pnpm db:generate

# シードデータ投入
docker-compose exec app pnpm db:seed

# データベース接続
docker-compose exec postgres psql -U postgres -d metamo
```

### アプリケーション操作

```bash
# アプリケーションシェル
docker-compose exec app sh

# ログのリアルタイム表示
docker-compose logs -f app

# コンテナの再起動
docker-compose restart app
```

## 本番環境デプロイ

### 推奨構成

1. **データベース**: マネージドPostgreSQL (Supabase, Railway, Render等)
2. **アプリケーション**: Docker コンテナホスティング (Railway, Render, Fly.io等)
3. **ストレージ**: 永続化ボリュームまたはオブジェクトストレージ

### デプロイ手順

#### 1. 環境変数の設定

本番環境用の環境変数を設定:

```bash
# Database (hosted)
DATABASE_URL="postgresql://user:password@host:5432/metamo?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/metamo?schema=public"

# Supabase (hosted)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-production-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-production-service-role-key"

# AI Keys
VITE_GOOGLE_AI_API_KEY="your-google-api-key"
VITE_OPENAI_API_KEY="your-openai-api-key"
VITE_ANTHROPIC_API_KEY="your-anthropic-api-key"

# App
VITE_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

#### 2. Dockerイメージのビルド

```bash
docker build -t metamo-app:latest .
```

#### 3. デプロイプラットフォームへのプッシュ

##### Railway
```bash
railway login
railway link
railway up
```

##### Render
```yaml
# render.yaml
services:
  - type: web
    name: metamo-app
    env: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: VITE_SUPABASE_URL
        sync: false
      # ... その他の環境変数
```

##### Fly.io
```bash
flyctl auth login
flyctl launch
flyctl deploy
```

### ボリュームとストレージ

永続化が必要なデータ:
- `/app/storages`: アップロードされた画像とプロジェクトデータ

```bash
# Dockerボリュームの作成
docker volume create metamo-storage

# ボリュームのマウント
docker run -v metamo-storage:/app/storages metamo-app
```

## トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQLコンテナのステータス確認
docker-compose ps postgres

# PostgreSQLログの確認
docker-compose logs postgres

# 接続テスト
docker-compose exec postgres pg_isready -U postgres
```

### アプリケーションエラー

```bash
# アプリケーションログの確認
docker-compose logs app

# コンテナ内のシェル起動
docker-compose exec app sh

# 環境変数の確認
docker-compose exec app env | grep VITE
```

### ストレージの問題

```bash
# ストレージボリュームの確認
docker volume ls

# ボリュームの詳細確認
docker volume inspect metamo_app_storage

# ストレージディレクトリの権限確認
docker-compose exec app ls -la /app/storages
```

## パフォーマンス最適化

### イメージサイズの削減

- マルチステージビルドを使用（既に実装済み）
- `.dockerignore` で不要なファイルを除外（既に実装済み）
- Alpine Linuxベースイメージを使用（既に実装済み）

### メモリ制限の設定

```yaml
# docker-compose.yml
services:
  app:
    mem_limit: 512m
    mem_reservation: 256m
```

### CPU制限の設定

```yaml
# docker-compose.yml
services:
  app:
    cpus: '0.5'
```

## セキュリティ

### 推奨事項

1. **環境変数の管理**: シークレットマネージャーを使用
2. **イメージスキャン**: `docker scan metamo-app` で脆弱性チェック
3. **非rootユーザー**: Dockerfileでユーザーを作成して実行
4. **ネットワーク分離**: プライベートネットワークを使用

### 例: 非rootユーザーの追加

```dockerfile
# Dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

## 監視とログ

### ログ管理

```bash
# JSON形式でログ出力
docker-compose logs --json app

# 特定の時間以降のログ
docker-compose logs --since 30m app

# ログをファイルに保存
docker-compose logs app > logs.txt
```

### ヘルスチェック

```yaml
# docker-compose.yml
services:
  app:
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 参考リンク

- [Docker公式ドキュメント](https://docs.docker.com/)
- [Docker Compose公式ドキュメント](https://docs.docker.com/compose/)
- [Prisma with Docker](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
