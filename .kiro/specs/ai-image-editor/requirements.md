# Requirements Document

## Introduction
Metamoは、AI技術を活用した画像編集Webアプリケーションです。ユーザーは自然言語によるチャット機能やビジュアルキャンバス機能を通じて、直感的に画像編集の指示を出すことができます。本システムは、従来の複雑な画像編集ツールのUIを学習する必要なく、誰でも簡単に高度な画像加工を実現できることを目指しています。

### 技術スタック
- **フロントエンド**: React, TypeScript, Vite, TanStack Router
- **スタイリング**: TailwindCSS, DaisyUI
- **バックエンド**: RESTful API
- **データベース**: Prisma
- **認証**: Supabase
- **AI統合**: ai-sdk (Google Gemini, OpenAI, Anthropic対応)
- **パッケージ管理**: pnpm

### アーキテクチャ原則
- RESTful APIとURL設計
- AI モデルの差し替え可能な設計
- プラグイン可能なストレージ設計（NFSマウント対応）

## Requirements

### Requirement 1: ユーザー認証とアカウント管理
**Objective:** ユーザーとして、安全にアカウントを作成・ログインし、自分のプロジェクトを管理できるようにしたい。これにより、個人の作業を保護し継続的に利用できるようにする。

#### Acceptance Criteria
1. WHEN ユーザーが `/register` にアクセスする THEN Metamo SHALL ユーザー登録フォーム（name, email, password）を表示する
2. WHEN ユーザーが有効な登録情報を送信する THEN Metamo SHALL Supabaseで認証情報を作成し、usersテーブルにユーザーレコードを登録する
3. IF 登録時にメールアドレスが既に存在する THEN Metamo SHALL エラーメッセージ「このメールアドレスは既に登録されています」を表示する
4. WHEN ユーザーが `/login` にアクセスする THEN Metamo SHALL ログインフォーム（email, password）を表示する
5. WHEN 認証に成功する THEN Metamo SHALL last_login_atを更新し、ダッシュボード (`/dashboard`) にリダイレクトする
6. IF 認証に失敗する THEN Metamo SHALL エラーメッセージを表示し、再入力を促す
7. WHEN 認証済みユーザーがアプリケーションにアクセスする THEN Metamo SHALL AuthContextを通じて認証状態を保持する

### Requirement 2: プラン管理とトークン制限
**Objective:** システムとして、ユーザーごとにプランと使用量を管理し、適切な制限を適用できるようにしたい。これにより、サービスの持続可能な運用を実現する。

#### Acceptance Criteria
1. WHEN ユーザーが新規登録される THEN Metamo SHALL デフォルトプランをuser_plansテーブルに関連付ける
2. WHERE user_plansレコードが存在する THE Metamo SHALL billing_interval_term_typeとcost_reset_term_typeに基づき請求期間を計算する
3. WHEN ユーザーがAI機能を使用する THEN Metamo SHALL user_usage_logsにトークン消費を記録する
4. WHEN 現在の請求期間内のトークン消費合計がcost_limitに達する THEN Metamo SHALL AI機能の利用を制限し、制限メッセージを表示する
5. WHEN 請求期間が終了する AND is_auto_renewがtrueである THEN Metamo SHALL 次の請求期間を自動的に開始し、トークンカウントをリセットする
6. IF next_plan_idが設定されている THEN Metamo SHALL 次回更新時に新しいプランを適用する
7. WHEN ユーザーがプランをキャンセルする THEN Metamo SHALL status_typeを2に更新し、canceled_atを記録する

### Requirement 3: プロジェクト管理（ダッシュボード）
**Objective:** ユーザーとして、複数の画像編集プロジェクトを作成・管理し、過去のプロジェクトに簡単にアクセスできるようにしたい。これにより、作業を整理し効率的に進められるようにする。

#### Acceptance Criteria
1. WHEN 認証済みユーザーが `/dashboard` にアクセスする THEN Metamo SHALL 自分のuser_projectsレコード一覧を表示する
2. WHEN ユーザーがプロジェクト作成ボタンをクリックする THEN Metamo SHALL プロジェクト名と説明の入力フォームを表示する
3. WHEN プロジェクトが作成される THEN Metamo SHALL user_projectsテーブルに新規レコードを登録し、`storages/storage1/projects/{projectId}/` ディレクトリ構造を作成する
4. IF 現在のプランで作成可能なプロジェクト数（create_project_count）を超える THEN Metamo SHALL 作成を拒否し、プランアップグレードを促すメッセージを表示する
5. WHERE ダッシュボードが表示されている THE Metamo SHALL 各プロジェクトのサムネイル、名前、最終更新日時を表示する
6. WHEN ユーザーがプロジェクトをクリックする THEN Metamo SHALL エディターページ (`/editor/{userProjectId}`) にリダイレクトする
7. WHEN ユーザーがプロジェクト削除を実行する THEN Metamo SHALL deleted_atを設定し、論理削除する

### Requirement 4: 画像のアップロードと管理
**Objective:** ユーザーとして、編集したい画像をプロジェクトにアップロードし、管理できるようにしたい。これにより、編集対象の画像を簡単に扱えるようにする。

#### Acceptance Criteria
1. WHEN ユーザーがエディターで画像ファイルをドラッグ&ドロップする THEN Metamo SHALL 画像を `storages/storage1/projects/{projectId}/assets/` に保存し、キャンバスに表示する
2. WHEN ユーザーがファイル選択ダイアログから画像を選択する THEN Metamo SHALL 選択された画像をアセットディレクトリに保存し、キャンバスに読み込む
3. IF アップロードされたファイルがサポート対象外の形式である THEN Metamo SHALL エラーメッセージを表示し、サポートされる形式（JPEG、PNG、WebP）を案内する
4. WHEN 画像が正常に読み込まれた THEN Metamo SHALL 画像のメタデータを `config.json` に記録する
5. IF アップロードされた画像のサイズが10MBを超える THEN Metamo SHALL 警告メッセージを表示し、処理に時間がかかる可能性を通知する

### Requirement 5: チャットベースの画像編集指示
**Objective:** ユーザーとして、自然言語のチャットを通じて画像編集の指示を出せるようにしたい。これにより、専門的な編集知識がなくても意図した編集を実現できるようにする。

#### Acceptance Criteria
1. WHEN ユーザーがチャット欄にテキスト指示を入力する THEN Metamo SHALL 入力内容をEditorContextに保存し、AIによる解釈処理を開始する
2. WHEN AIが編集指示を解釈完了する THEN Metamo SHALL 解釈された編集内容の確認メッセージをチャットに表示する
3. WHEN user_project_operationレコードが作成される THEN Metamo SHALL type='chat'、process_jsonに指示内容、actions_jsonに実行アクションを記録する
4. IF ユーザーの指示が曖昧または不明確である THEN Metamo SHALL 明確化のための質問をチャットに返す
5. WHEN ユーザーが編集実行を承認する THEN Metamo SHALL 指示された編集処理をキャンバス上の画像に適用する
6. WHILE 編集処理が実行中である THE Metamo SHALL プログレスインジケーターを表示する
7. WHEN 編集処理が完了する THEN Metamo SHALL 編集結果を `storages/storage1/projects/{projectId}/current/` に保存し、キャンバスに反映する
8. IF 編集処理がエラーで失敗する THEN Metamo SHALL エラー内容をチャットに表示し、代替案を提案する
9. WHEN AI APIを呼び出す THEN Metamo SHALL user_usage_logsにトークン消費、ai_model、user_project_operation_idを記録する

### Requirement 6: キャンバス機能による画像編集
**Objective:** ユーザーとして、ビジュアルなキャンバス上で画像を直接操作し編集できるようにしたい。これにより、視覚的なフィードバックを得ながら編集作業を進められるようにする。

#### Acceptance Criteria
1. WHERE キャンバス上に画像が表示されている THE Metamo SHALL 画像の拡大・縮小・パン操作を可能にする
2. WHEN ユーザーがキャンバス上で領域を選択する THEN Metamo SHALL 選択範囲をハイライト表示する
3. WHEN 選択範囲が確定される THEN Metamo SHALL その領域に対する編集オプション（トリミング、部分的な効果適用など）を提示する
4. WHEN ユーザーがキャンバス上の特定箇所をクリックする THEN Metamo SHALL その位置情報をEditorContextに保持する
5. IF チャット指示で「ここを」「この部分を」などの指示語が使われる THEN Metamo SHALL キャンバス上の選択領域または最後にクリックした位置を参照する
6. WHEN 編集が適用される THEN Metamo SHALL 編集前の状態を `storages/storage1/projects/{projectId}/history/` に保存する

### Requirement 7: 編集履歴とアンドゥ・リドゥ
**Objective:** ユーザーとして、編集履歴を管理し、必要に応じて以前の状態に戻せるようにしたい。これにより、試行錯誤しながら安心して編集作業を進められるようにする。

#### Acceptance Criteria
1. WHEN 編集操作が実行される THEN Metamo SHALL user_project_operationsにsequence_numberを自動採番してレコードを追加する
2. WHEN ユーザーがアンドゥ操作を実行する THEN Metamo SHALL 現在のsequence_numberより1つ前の状態を `history/` から読み込み、キャンバスを復元する
3. WHEN ユーザーがリドゥ操作を実行する AND アンドゥ済みの操作が存在する THEN Metamo SHALL 次のsequence_numberの状態を適用する
4. WHERE 履歴パネルが表示されている THE Metamo SHALL user_project_operationsを時系列で表示し、各操作のサムネイルと説明を表示する
5. WHEN ユーザーが履歴パネル内の特定の履歴項目をクリックする THEN Metamo SHALL その sequence_number の状態に画像を復元する
6. IF 新しい編集が実行される AND 現在が過去の状態である THEN Metamo SHALL 新しいsequence_numberでブランチを作成し、prev_sequence_numberに前の番号を記録する

### Requirement 8: 編集結果のエクスポート
**Objective:** ユーザーとして、編集完了後の画像をローカルに保存またはダウンロードできるようにしたい。これにより、編集成果物を他の用途で活用できるようにする。

#### Acceptance Criteria
1. WHEN ユーザーがエクスポート機能を実行する THEN Metamo SHALL 保存形式の選択オプション（JPEG、PNG、WebP）を提示する
2. WHEN 保存形式が選択される THEN Metamo SHALL 品質設定オプション（該当する形式の場合）を表示する
3. WHEN ユーザーが保存設定を確定する THEN Metamo SHALL `storages/storage1/projects/{projectId}/current/` から最新画像を読み込み、指定形式でダウンロード可能にする
4. IF エクスポート処理中にエラーが発生する THEN Metamo SHALL エラーメッセージを表示し、再試行オプションを提供する
5. WHEN エクスポートが成功する THEN Metamo SHALL 完了通知を表示する

### Requirement 9: レスポンシブUI
**Objective:** ユーザーとして、デスクトップおよびタブレット端末で快適に利用できるUIを提供したい。これにより、様々なデバイスから柔軟にアクセスできるようにする。

#### Acceptance Criteria
1. WHERE アプリケーションがデスクトップブラウザで表示される THE Metamo SHALL キャンバスとチャットを横並びレイアウトで表示する
2. WHERE アプリケーションがタブレット端末で表示される THE Metamo SHALL キャンバスとチャットを縦並びまたはタブ切り替え形式で表示する
3. WHEN 画面サイズが変更される THEN Metamo SHALL TailwindCSSのブレークポイントに基づきレイアウトを適切に再調整する
4. WHILE ユーザーが操作中である THE Metamo SHALL タッチ操作とマウス操作の両方をサポートする
5. WHERE DaisyUIコンポーネントが使用されている THE Metamo SHALL 一貫したテーマとアクセシビリティを提供する

### Requirement 10: AIモデルとの統合（拡張可能な設計）
**Objective:** システムとして、複数のAIプロバイダ（Google, OpenAI, Anthropic）と連携し、画像編集指示を解釈・実行できるようにしたい。これにより、高度な自然言語理解と画像処理を実現し、将来的なモデル追加を容易にする。

#### Acceptance Criteria
1. WHEN ユーザーがチャットで指示を入力する THEN Metamo SHALL ai_modelsテーブルから利用可能なモデルを取得し、ai-sdkを通じてAI APIに送信する
2. WHEN AI APIから編集パラメータが返される THEN Metamo SHALL それを画像処理パイプラインに適用可能な形式に変換する
3. IF AI APIとの通信がタイムアウトする THEN Metamo SHALL エラーメッセージを表示し、再試行オプションを提供する
4. IF AI APIがレート制限エラーを返す THEN Metamo SHALL ユーザーに待機を促すメッセージを表示する
5. WHEN AI APIから複数の解釈候補が返される THEN Metamo SHALL ユーザーに選択肢を提示する
6. WHERE ai_modelsテーブルが管理されている THE Metamo SHALL platform（google, openai, anthropic）とparamsを基にAIモデルを動的に切り替え可能にする
7. WHEN 新しいAIモデルを追加する THEN Metamo SHALL ai_modelsテーブルに新規レコードを追加するだけで利用可能にする

### Requirement 11: RESTful API設計
**Objective:** システムとして、RESTfulな原則に基づいたAPIエンドポイントを提供したい。これにより、保守性と拡張性を確保する。

#### Acceptance Criteria
1. WHERE APIルーティングが定義されている THE Metamo SHALL リソースベースのURL構造 (`/api/users`, `/api/projects`, `/api/operations`) を使用する
2. WHEN クライアントがプロジェクト一覧を取得する THEN Metamo SHALL `GET /api/projects` エンドポイントを提供し、認証済みユーザーのプロジェクトを返す
3. WHEN 新規プロジェクトを作成する THEN Metamo SHALL `POST /api/projects` でリクエストを受け付け、作成されたプロジェクトをレスポンスで返す
4. WHEN プロジェクトを更新する THEN Metamo SHALL `PUT /api/projects/{id}` または `PATCH /api/projects/{id}` を提供する
5. WHEN プロジェクトを削除する THEN Metamo SHALL `DELETE /api/projects/{id}` で論理削除を実行する
6. WHEN 操作履歴を取得する THEN Metamo SHALL `GET /api/projects/{id}/operations` を提供し、sequence_number順にソートされた履歴を返す
7. WHERE すべてのAPIエンドポイントが定義されている THE Metamo SHALL 認証トークンをヘッダーで検証し、未認証の場合は401を返す

### Requirement 12: データベーススキーマとマイグレーション
**Objective:** システムとして、Prismaを使用して一貫性のあるデータベーススキーマを管理し、マイグレーションを安全に実行できるようにしたい。これにより、開発とデプロイメントの信頼性を確保する。

#### Acceptance Criteria
1. WHERE Prismaスキーマが定義されている THE Metamo SHALL すべてのidフィールドをUUID型として定義する
2. WHEN テーブル間にリレーションが必要な場合 THEN Metamo SHALL `{table}_id` 命名規則で外部キーを定義する
3. WHEN スキーマ変更が必要な場合 THEN Metamo SHALL `pnpm run db:push` または `prisma migrate dev` でマイグレーションを実行する
4. WHEN 初期データが必要な場合 THEN Metamo SHALL `prisma/seed.ts` でデフォルトプランや初期AIモデルを登録する
5. WHERE Prismaクライアントが使用される THE Metamo SHALL 型安全なクエリインターフェースを提供する

### Requirement 13: ストレージとファイル管理
**Objective:** システムとして、プロジェクトのアセット、現在の状態、履歴を構造化されたストレージに保存し、NFSマウントなどの外部ストレージにも対応できるようにしたい。これにより、スケーラビリティとバックアップの柔軟性を確保する。

#### Acceptance Criteria
1. WHEN 新規プロジェクトが作成される THEN Metamo SHALL `storages/storage1/projects/{projectId}/` 配下に `assets/`, `current/`, `history/`, `config.json` を作成する
2. WHEN 画像がアップロードされる THEN Metamo SHALL ファイルを `assets/` ディレクトリに保存し、ファイル名をUUIDまたはタイムスタンプベースで管理する
3. WHEN 編集が適用される THEN Metamo SHALL 最新の画像を `current/` に保存し、変更前の状態を `history/{sequence_number}.{ext}` として保存する
4. WHERE config.jsonが存在する THE Metamo SHALL プロジェクトのメタデータ（画像サイズ、使用AIモデル、設定など）を管理する
5. IF ストレージパスが環境変数で設定されている THEN Metamo SHALL 動的にストレージルートを切り替え可能にする

### Requirement 14: 開発環境とデプロイメント
**Objective:** 開発者として、簡単に環境をセットアップし、開発サーバーを起動できるようにしたい。これにより、オンボーディングとメンテナンスを効率化する。

#### Acceptance Criteria
1. WHEN 開発者が `pnpm install` を実行する THEN Metamo SHALL すべての依存関係をインストールする
2. WHEN `.env.example` をコピーして `.env` を作成する THEN Metamo SHALL 必要な環境変数のテンプレートを提供する
3. WHEN `pnpm run data:reset` を実行する THEN Metamo SHALL データベース、ストレージ、ログを初期化する
4. WHEN `pnpm run dev:full` を実行する THEN Metamo SHALL Supabaseを起動し、開発サーバーを `localhost:3000` で起動する
5. WHEN `pnpm run dev` を実行する AND Supabaseが既に起動している THEN Metamo SHALL 開発サーバーのみを起動する
6. WHERE Docker Composeが使用される THE Metamo SHALL app、db、nginxコンテナを定義し、`docker-compose up` で起動可能にする

### Requirement 15: 設定画面
**Objective:** ユーザーとして、アカウント情報やプラン情報を確認・変更できる設定画面にアクセスしたい。これにより、自分のアカウントを管理できるようにする。

#### Acceptance Criteria
1. WHEN 認証済みユーザーが `/settings` にアクセスする THEN Metamo SHALL ユーザー情報（name, email）と現在のプラン情報を表示する
2. WHEN ユーザーが名前を変更する THEN Metamo SHALL usersテーブルのnameを更新する
3. WHEN ユーザーがパスワード変更を要求する THEN Metamo SHALL Supabaseのパスワード変更フローを呼び出す
4. WHERE プラン情報が表示される THE Metamo SHALL 現在のプラン名、トークン使用量、次回請求日を表示する
5. IF ユーザーがプラン変更を希望する THEN Metamo SHALL 利用可能なプラン一覧と比較を表示する
