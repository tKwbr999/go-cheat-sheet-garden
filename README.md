<div align="center">
  <!-- ヘッダー画像（例: public/go-logo.svg を使う場合） -->
  <img src="./public/go-logo.svg" alt="Go Logo" width="200"/>

  <h1>Go Cheat Sheet Garden</h1>

  <p>
    Go言語の基本的な文法や機能を素早く参照できるインタラクティブなチートシートアプリケーションです。
  </p>

  <!-- 技術スタックバッジ -->
  <p>
    <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black" alt="React"/>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Bun-FFD700?logo=bun&logoColor=black" alt="Bun"/>
    <!-- 他の技術スタックがあれば追加 -->
  </p>
</div>

## 🚀 概要

このプロジェクトは、Go言語の学習者や開発者が、必要な情報を効率的に見つけられるように設計されたウェブアプリケーションです。各機能はセクションごとに分類され、コード例と共に表示されます。

## 🛠️ 技術スタック

- フロントエンド: React, TypeScript, Vite
- スタイリング: Tailwind CSS, shadcn/ui
- データ: JSON ファイル (`src/data/go-cheatsheet/`)
- パッケージマネージャー: Bun (npm/yarn も使用可能)

## 📦 インストール

1. リポジトリをクローンします:
   ```bash
   git clone https://github.com/tKwbr999/go-cheat-sheet-garden.git
   cd go-cheat-sheet-garden
   ```
2. 依存関係をインストールします (Bun を推奨):
   ```bash
   bun install
   # または npm install / yarn install
   ```
3. 開発サーバーを起動します:
   ```bash
   bun run dev
   # または npm run dev / yarn dev
   ```
4. ブラウザで `http://localhost:5173` (ポートは異なる場合があります) を開きます。

## 📖 使い方

アプリケーションを開くと、Go言語の様々なトピックが左側のサイドバー（またはアコーディオン）に表示されます。トピックを選択すると、中央のエリアに関連するチートシートの内容とコード例が表示されます。

<!-- スクリーンショットがあればここに追加 -->
<!-- <img src="path/to/screenshot.png" alt="アプリケーションのスクリーンショット" width="600"/> -->


## 🛠️ 開発コマンド

開発中に役立つコマンドです。

- **Markdown 内の Go コードブロックをフォーマット:**
  ```bash
  make format-go-md
  ```
  `src/data/go-cheatsheet-md/` ディレクトリ以下の Markdown ファイルに含まれる Go コードブロックを `gofmt -s` でフォーマットします。

## � ディレクトリ構造 (主要部分)

```
.
├── public/             # 静的ファイル
├── src/                # ソースコード
│   ├── components/     # 再利用可能なUIコンポーネント
│   ├── data/           # チートシートデータ (JSON)
│   │   └── go-cheatsheet/
│   ├── hooks/          # カスタムフック
│   ├── lib/            # ユーティリティ関数
│   ├── pages/          # ページコンポーネント
│   ├── App.tsx         # アプリケーションルート
│   └── main.tsx        # エントリーポイント
├── .gitignore          # Git無視ファイル
├── package.json        # 依存関係とスクリプト
├── README.md           # このファイル
└── vite.config.ts      # Vite設定
```

## 🤝 コントリビュート

コントリビューションを歓迎します！ Issue の作成や Pull Request の送信をお願いします。

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。