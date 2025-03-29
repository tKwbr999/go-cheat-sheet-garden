## タイトル
title: パッケージ: `go.mod` ファイルの構造 (Go Modules)

## タグ
tags: ["packages", "package", "go modules", "go.mod", "依存関係管理", "module", "go", "require", "replace", "exclude", "retract"]

## コード
```go.mod
// モジュールパス (必須、通常はリポジトリパス)
module example.com/mymodule

// Go の最小バージョン (必須)
go 1.20

// 依存モジュールとそのバージョン (go get などで自動管理)
require (
	github.com/google/uuid v1.3.0
	golang.org/x/exp v0.0.0-20230310184433-ae3f4189d583
	gopkg.in/yaml.v2 v2.4.0 // indirect (間接的な依存)
)

// 特定バージョンの除外 (オプション)
exclude github.com/unstable/dependency v0.5.1

// 依存の置き換え (オプション、ローカル開発などで使用)
replace example.com/mylibrary => ../mylibrary

// 公開済みバージョンの取り消し (オプション、モジュール作者が使用)
retract (
	v0.1.0 // バグがあったバージョンなど
	[v0.1.5, v0.1.9]
)

```

## 解説
```text
Go Modules の中心がプロジェクトルートの **`go.mod`** ファイルです。
モジュールの定義、Goバージョン、依存関係などを記述します。
通常は `go mod init` で生成され、`go get` 等で自動更新されます。

**主要なディレクティブ:**
*   **`module` (必須):** モジュールパスを定義。
    例: `module github.com/user/repo`
    これがインポートパスの基準になります。
*   **`go` (必須):** 期待する Go の最小バージョンを指定。
    例: `go 1.21`
*   **`require`:** 直接依存するモジュールとバージョンを指定。
    `go get` 等で自動管理されます。
    `// indirect` は間接的な依存を示します。
    ```go.mod
    require (
        github.com/gin-gonic/gin v1.9.1
        golang.org/x/text v0.14.0 // indirect
    )
    ```
*   **`replace` (オプション):** 依存モジュールの取得元や
    バージョンを置き換えます。ローカル開発やフォーク利用時に使います。
    `replace example.com/original => ../local/fork`
*   **`exclude` (オプション):** 特定バージョンの依存モジュールを
    使用禁止にします (稀に利用)。
    `exclude github.com/buggy/lib v1.2.3`
*   **`retract` (オプション):** モジュール作者が公開済みバージョンの
    問題を示し、使用非推奨を伝えます。
    `retract v0.1.0 // 深刻なバグあり`

`go.mod` はプロジェクト構成と依存関係の中心です。
構造を理解しておくと問題解決に役立ちます。