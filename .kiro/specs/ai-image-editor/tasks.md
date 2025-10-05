# 実装計画

## 概要
本ドキュメントは、Metamo（AI画像編集Webアプリケーション）の実装タスクを定義します。すべての要件を満たすため、プロジェクト基盤の構築から認証、プロジェクト管理、画像編集機能、テストまで段階的に実装を進めます。

---

- [ ] 1. プロジェクト基盤とインフラストラクチャのセットアップ
- [ ] 1.1 開発環境の初期化と依存関係のインストール
  - pnpmを使用してプロジェクトを初期化
  - React、TypeScript、Viteの依存関係をインストール
  - TanStack Router、TailwindCSS、DaisyUIをセットアップ
  - TypeScript設定ファイルとVite設定ファイルを構成
  - _Requirements: 14.1_

- [ ] 1.2 環境変数管理と設定の構築
  - `.env.example`ファイルを作成し、必要な環境変数テンプレートを定義
  - Supabase接続文字列、AI APIキー、ストレージパスの環境変数を設定
  - 環境変数の読み込みと検証機能を実装
  - _Requirements: 14.2_

- [ ] 1.3 ストレージディレクトリ構造の作成
  - `storages/storage1/projects/`ディレクトリ構造を作成
  - ストレージルートの環境変数による切り替え機能を実装
  - ログディレクトリ構造を作成
  - _Requirements: 13.5_

- [ ] 1.4 開発サーバー起動スクリプトの構築
  - `pnpm run dev`スクリプトを作成（Vite開発サーバー起動）
  - `pnpm run dev:full`スクリプトを作成（Supabase起動 + 開発サーバー起動）
  - `pnpm run data:reset`スクリプトを作成（データベース、ストレージ、ログ初期化）
  - _Requirements: 14.3, 14.4, 14.5_

- [ ] 2. データベーススキーマとPrismaセットアップ
- [ ] 2.1 Prismaスキーマの定義
  - Prismaをインストールし、初期設定を実施
  - users、plans、user_plans、user_projects、user_project_operations、user_usage_logs、ai_modelsテーブルを定義
  - すべてのidフィールドをUUID型で定義
  - リレーション（外部キー）を`{table}_id`命名規則で定義
  - _Requirements: 12.1, 12.2_

- [ ] 2.2 Prismaマイグレーションの実行
  - `pnpm run db:push`スクリプトを作成し、Prismaスキーマを適用
  - `pnpm run db:generate`スクリプトを作成し、Prismaクライアントを生成
  - Prismaクライアントの型安全なクエリインターフェースを検証
  - _Requirements: 12.3, 12.5_

- [ ] 2.3 初期データのシードスクリプト作成
  - `prisma/seed.ts`を作成
  - デフォルトプラン（無料プラン、プロプラン）を定義し登録
  - 初期AIモデル（Google Gemini、OpenAI、Anthropic）をai_modelsテーブルに登録
  - _Requirements: 12.4, 10.7_

- [ ] 3. Supabase認証とAuthServiceの実装
- [ ] 3.1 Supabase Authクライアントのセットアップ
  - Supabase CLIをインストールし、ローカルSupabaseインスタンスを起動
  - Supabase JavaScriptクライアントをインストール
  - Supabase Auth設定を環境変数から読み込み
  - _Requirements: 1.2, 1.7_

- [ ] 3.2 AuthServiceの認証機能実装
  - signUp機能を実装（Supabase AuthでユーザーCreate + usersテーブルに登録 + user_plansにデフォルトプラン関連付け）
  - signIn機能を実装（email/password認証 + last_login_at更新）
  - signOut機能を実装（セッション無効化）
  - getCurrentUser機能を実装（現在のユーザー情報取得）
  - updateUser機能を実装（ユーザー名更新）
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 3.3 AuthContextの実装
  - React Contextを使用してAuthContextを作成
  - 認証状態（ユーザー情報、セッション）を保持
  - Supabase Auth onAuthStateChangeイベントをリスニングし、状態を同期
  - ログイン状態に応じてルート保護機能を提供
  - _Requirements: 1.7_

- [ ] 4. TanStack Routerとルーティングのセットアップ
- [ ] 4.1 TanStack Routerの初期設定
  - TanStack Routerをインストール
  - ファイルベースルーティングを有効化
  - ルート型生成の自動化を設定
  - _Requirements: 11.1_

- [ ] 4.2 基本ルートの作成
  - `/`（トップページ）ルートを作成
  - `/register`（ユーザー登録）ルートを作成
  - `/login`（ログイン）ルートを作成
  - `/dashboard`（ダッシュボード）ルートを作成（認証保護）
  - `/editor/$userProjectId`（エディター）ルートを作成（認証保護、動的パラメータ）
  - `/settings`（設定）ルートを作成（認証保護）
  - _Requirements: 1.1, 1.4, 3.1, 3.6, 15.1_

- [ ] 4.3 認証ミドルウェアとルート保護
  - AuthContextを使用して認証済みルートを保護
  - 未認証ユーザーを`/login`にリダイレクト
  - 認証成功後のリダイレクト処理を実装
  - _Requirements: 1.5, 11.7_

- [ ] 5. RESTful APIエンドポイントの構築
- [ ] 5.1 API認証ミドルウェアの実装
  - すべてのAPIエンドポイントでSupabase Authトークンを検証
  - 未認証リクエストに対して401エラーを返す
  - 認証済みユーザー情報をリクエストコンテキストに注入
  - _Requirements: 11.7_

- [ ] 5.2 認証APIエンドポイントの実装
  - `POST /api/auth/register`（ユーザー登録）を実装
  - `POST /api/auth/login`（ログイン）を実装
  - `POST /api/auth/logout`（ログアウト）を実装
  - `GET /api/auth/me`（現在のユーザー情報取得）を実装
  - `PATCH /api/users/{id}`（ユーザー情報更新）を実装
  - _Requirements: 1.1, 1.4, 15.2_

- [ ] 5.3 プロジェクトAPIエンドポイントの実装
  - `GET /api/projects`（プロジェクト一覧取得）を実装
  - `POST /api/projects`（プロジェクト作成）を実装
  - `GET /api/projects/{id}`（プロジェクト詳細取得）を実装
  - `PATCH /api/projects/{id}`（プロジェクト更新）を実装
  - `DELETE /api/projects/{id}`（プロジェクト論理削除）を実装
  - _Requirements: 11.2, 11.3, 11.4, 11.5, 3.7_

- [ ] 5.4 プラン・使用量APIエンドポイントの実装
  - `GET /api/users/plan`（現在のプラン情報取得）を実装
  - `POST /api/users/usage`（使用量記録）を実装
  - トークン消費の集計機能を実装
  - _Requirements: 2.3, 15.4_

- [ ] 6. StorageServiceとファイル管理機能の実装
- [ ] 6.1 StorageServiceのディレクトリ操作機能実装
  - createProjectDirectory機能を実装（assets/、current/、history/、config.json作成）
  - ストレージルートの環境変数による動的切り替えを実装
  - ディレクトリ作成エラーハンドリングを実装
  - _Requirements: 13.1, 13.5_

- [ ] 6.2 StorageServiceのファイル保存・読み込み機能実装
  - saveAsset機能を実装（assets/ディレクトリに画像保存、UUID/タイムスタンプベースのファイル名）
  - saveCurrent機能を実装（current/ディレクトリに最新画像保存）
  - saveHistory機能を実装（history/ディレクトリに`{sequence_number}.{ext}`形式で保存）
  - loadCurrent、loadHistory機能を実装（ファイル読み込み）
  - _Requirements: 13.2, 13.3_

- [ ] 6.3 StorageServiceのconfig.json管理機能実装
  - updateConfig機能を実装（プロジェクトメタデータ更新）
  - getConfig機能を実装（メタデータ読み込み）
  - 画像メタデータ、使用AIモデル、設定情報の管理
  - _Requirements: 4.4, 13.4_

- [ ] 7. ProjectServiceとプロジェクト管理機能の実装
- [ ] 7.1 ProjectServiceのCRUD機能実装
  - listProjects機能を実装（認証済みユーザーのプロジェクト一覧取得）
  - createProject機能を実装（user_projectsにレコード作成 + StorageServiceでディレクトリ作成）
  - getProject機能を実装（プロジェクト詳細取得）
  - updateProject機能を実装（プロジェクト名・説明更新）
  - deleteProject機能を実装（deleted_at設定による論理削除）
  - _Requirements: 3.1, 3.2, 3.6, 3.7_

- [ ] 7.2 ProjectServiceのプラン制限チェック機能実装
  - 現在のプランのcreate_project_count制限をチェック
  - 制限超過時にエラーを返し、プランアップグレードメッセージを提供
  - プロジェクト削除時の制限カウント更新
  - _Requirements: 3.4_

- [ ] 8. AI SDKとAIServiceの実装
- [ ] 8.1 AI SDKの統合とセットアップ
  - Vercel AI SDK、@ai-sdk/google、@ai-sdk/openai、@ai-sdk/anthropicをインストール
  - 環境変数からAI APIキー（GOOGLE_API_KEY、OPENAI_API_KEY、ANTHROPIC_API_KEY）を読み込み
  - AI SDKの初期化とプロバイダ設定
  - _Requirements: 10.1, 10.6_

- [ ] 8.2 AIServiceの指示解釈機能実装
  - interpretInstruction機能を実装（ai_modelsテーブルから利用可能モデル取得）
  - AI SDKを使用してプロンプトを送信し、編集パラメータを取得
  - 編集パラメータを画像処理パイプラインに適用可能な形式に変換
  - _Requirements: 5.1, 5.2, 10.1, 10.2_

- [ ] 8.3 AIServiceのエラーハンドリングとリトライロジック実装
  - タイムアウトエラー処理とリトライオプション提供
  - レート制限エラー処理と待機時間表示
  - 複数解釈候補の提示機能
  - _Requirements: 5.8, 10.3, 10.4, 10.5_

- [ ] 8.4 AIServiceのトークン使用量記録機能実装
  - recordUsage機能を実装（user_usage_logsにトークン消費記録）
  - AI API応答からトークン消費量を取得
  - user_project_operation_idとの関連付け
  - _Requirements: 2.3, 5.9_

- [ ] 9. EditorServiceと画像編集機能の実装
- [ ] 9.1 EditorServiceの画像アップロード機能実装
  - uploadAsset機能を実装（ファイル形式検証、サイズチェック、StorageServiceを使用して保存）
  - サポート形式（JPEG、PNG、WebP）の検証
  - 10MB超過時の警告メッセージ表示
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [ ] 9.2 EditorServiceの編集実行機能実装
  - interpretInstruction機能を実装（AIServiceを呼び出し、編集アクションを取得）
  - applyEditing機能を実装（編集アクションを画像に適用、history/に前の画像保存、current/に新しい画像保存）
  - user_project_operationsにレコード作成（sequence_number自動採番、type='chat'、process_json、actions_json）
  - _Requirements: 5.1, 5.5, 5.7, 7.1_

- [ ] 9.3 EditorServiceの履歴管理機能実装
  - getOperations機能を実装（user_project_operationsを時系列で取得）
  - undoOperation機能を実装（前のsequence_numberの状態をhistory/から読み込み、キャンバスを復元）
  - redoOperation機能を実装（次のsequence_numberの状態を適用）
  - 履歴ブランチ機能を実装（prev_sequence_numberによる分岐管理）
  - _Requirements: 7.1, 7.2, 7.3, 7.5, 7.6_

- [ ] 9.4 EditorServiceのエクスポート機能実装
  - exportImage機能を実装（current/から最新画像を読み込み、指定形式でダウンロード）
  - 保存形式選択（JPEG、PNG、WebP）と品質設定オプション
  - エクスポートエラーハンドリングと再試行オプション
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. フロントエンド UIコンポーネントの実装
- [ ] 10.1 共通レイアウトコンポーネントの実装
  - Header、Footerコンポーネントを作成
  - TailwindCSSとDaisyUIを使用してスタイリング
  - 一貫したテーマとアクセシビリティ対応
  - _Requirements: 9.5_

- [ ] 10.2 認証画面UIの実装
  - ユーザー登録フォーム（name、email、password入力）を作成
  - ログインフォーム（email、password入力）を作成
  - フォームバリデーション（クライアントサイド）を実装
  - エラーメッセージ表示（メールアドレス重複、認証失敗）
  - _Requirements: 1.1, 1.3, 1.4, 1.6_

- [ ] 10.3 ダッシュボードUIの実装
  - プロジェクト一覧表示（サムネイル、名前、最終更新日時）を実装
  - プロジェクト作成ボタンとモーダルフォームを実装
  - プロジェクトカードクリック時のエディターへの遷移を実装
  - プロジェクト削除ボタンと確認モーダルを実装
  - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7_

- [ ] 10.4 設定画面UIの実装
  - ユーザー情報表示・編集フォーム（name、email）を実装
  - パスワード変更フローを実装（Supabaseのパスワード変更を呼び出し）
  - プラン情報表示（プラン名、トークン使用量、次回請求日）を実装
  - プラン変更UI（利用可能プラン一覧と比較）を実装
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 11. エディター画面とキャンバス機能の実装
- [ ] 11.1 EditorContextの実装
  - React Contextを使用してEditorContextを作成
  - 画像データ、キャンバス状態（選択領域、クリック位置）を保持
  - チャット入力、編集アクション、履歴状態を管理
  - _Requirements: 5.1, 6.4, 6.5_

- [ ] 11.2 キャンバスコンポーネントの実装
  - HTML5 Canvasまたはライブラリ（Konva.js、Fabric.js等）を使用してキャンバスを実装
  - 画像の拡大・縮小・パン操作を実装
  - 領域選択機能を実装（マウス/タッチ操作）
  - 選択範囲のハイライト表示を実装
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 11.3 キャンバスのコンテキスト管理機能実装
  - クリック位置の記録機能を実装（EditorContextに保存）
  - 選択範囲の記録機能を実装
  - チャット指示での「ここを」「この部分を」などの指示語解釈時に参照
  - _Requirements: 6.4, 6.5_

- [ ] 11.4 チャットUIコンポーネントの実装
  - チャット入力フォームを実装
  - チャットメッセージ履歴表示を実装
  - AI応答メッセージ表示（編集内容確認、質問、エラーメッセージ）を実装
  - 編集実行承認ボタンを実装
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.8_

- [ ] 11.5 編集実行とプログレスインジケーターの実装
  - 編集処理中のプログレスインジケーター表示を実装
  - 編集完了後のキャンバス更新を実装
  - 編集結果のStorageServiceへの保存を実装
  - _Requirements: 5.5, 5.6, 5.7, 6.6_

- [ ] 12. 履歴パネルとアンドゥ・リドゥ機能の実装
- [ ] 12.1 履歴パネルUIの実装
  - user_project_operationsを時系列で表示
  - 各操作のサムネイルと説明を表示
  - 履歴項目クリック時の状態復元機能を実装
  - _Requirements: 7.4, 7.5_

- [ ] 12.2 アンドゥ・リドゥボタンの実装
  - アンドゥボタンを実装（EditorServiceのundoOperationを呼び出し）
  - リドゥボタンを実装（EditorServiceのredoOperationを呼び出し）
  - 履歴状態に応じてボタンの有効/無効を切り替え
  - _Requirements: 7.2, 7.3_

- [ ] 13. レスポンシブUIの実装
- [ ] 13.1 デスクトップ・タブレット対応レイアウトの実装
  - TailwindCSSのブレークポイントを使用してレスポンシブレイアウトを実装
  - デスクトップ: キャンバスとチャットを横並び表示
  - タブレット: キャンバスとチャットを縦並びまたはタブ切り替え表示
  - 画面サイズ変更時の自動レイアウト調整
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 13.2 タッチ操作対応の実装
  - キャンバスのタッチ操作（ピンチズーム、パン、タップ選択）を実装
  - マウス操作との共存を確保
  - _Requirements: 9.4_

- [ ] 14. プラン管理とトークン制限機能の実装
- [ ] 14.1 請求期間計算ロジックの実装
  - billing_interval_term_typeとcost_reset_term_typeに基づく請求期間計算
  - current_period_started_at、current_period_ended_atの自動更新
  - _Requirements: 2.2_

- [ ] 14.2 トークン消費制限チェックの実装
  - AI機能使用時にトークン消費合計を計算
  - cost_limit到達時のAI機能制限とメッセージ表示
  - _Requirements: 2.4_

- [ ] 14.3 プラン自動更新とキャンセル機能の実装
  - 請求期間終了時の自動更新処理（is_auto_renew=trueの場合）
  - next_plan_id設定時の次回更新プラン適用
  - プランキャンセル処理（status_type=2、canceled_at記録）
  - _Requirements: 2.5, 2.6, 2.7_

- [ ] 15. テストの実装
- [ ] 15.1 Unitテストの実装
  - AuthServiceのsignUp、signIn、signOut、updateUserメソッドのテスト
  - ProjectServiceのcreateProject、listProjects、deleteProjectメソッドのプラン制限チェックテスト
  - AIServiceのinterpretInstructionメソッドのモックAI API応答テスト
  - StorageServiceのcreateProjectDirectory、saveAsset、saveCurrentメソッドのファイルシステム操作テスト
  - EditorServiceのapplyEditing、undoOperation、redoOperationメソッドの履歴管理テスト

- [ ] 15.2 Integrationテストの実装
  - 認証フロー: ユーザー登録 → ログイン → プロフィール更新 → ログアウト
  - プロジェクト作成フロー: プロジェクト作成 → ストレージディレクトリ確認 → DBレコード確認
  - 画像編集フロー: 画像アップロード → チャット指示 → AI解釈 → 編集適用 → 履歴確認 → アンドゥ
  - プラン制限フロー: プロジェクト作成上限チェック → エラーレスポンス確認
  - トークン消費フロー: AI API呼び出し → usage_logs記録 → 残量計算

- [ ] 15.3 E2E/UIテストの実装
  - ユーザー登録・ログイン: `/register` → 入力 → `/dashboard` リダイレクト確認
  - ダッシュボード操作: プロジェクト一覧表示 → プロジェクト作成 → プロジェクトクリック → `/editor/{id}` 遷移
  - エディター操作: 画像アップロード → キャンバス表示 → チャット入力 → 編集適用 → 履歴パネル確認
  - 設定画面: `/settings` → プラン情報表示 → ユーザー情報更新

- [ ] 16. Docker Composeとデプロイメント準備
- [ ] 16.1 Docker Compose設定の作成
  - docker-compose.ymlを作成
  - app、db、nginxコンテナを定義
  - コンテナ間のネットワーク設定
  - _Requirements: 14.6_

- [ ] 16.2 Dockerfileの作成
  - Viteアプリケーション用のDockerfileを作成
  - マルチステージビルドでビルドと本番環境を分離
  - pnpmを使用した依存関係インストール
  - _Requirements: 14.6_

---

## タスク実装の進め方

1. **順序に従って実装**: タスクは依存関係を考慮して番号順に並んでいます。原則として1から順に実装してください。
2. **テストの実施**: 各タスク完了後、該当機能のユニットテストまたは動作確認を実施してください。
3. **段階的なコミット**: 大きなタスク（1.x、2.x など）が完了したタイミングでGitコミットを行うことを推奨します。
4. **要件の確認**: 各タスクの詳細には対応する要件番号が記載されています。実装時に要件を参照し、すべての受入基準を満たしているか確認してください。
