---
title: "コードスタイル: 定数 (Constants)"
tags: ["references", "code style", "constants", "const", "naming", "iota"]
---

**定数 (Constant)** は、プログラム実行中に値が変わらない識別子です。Goでは `const` キーワードを使って宣言します。

## 定数名

*   **キャメルケース (Camel Case):** Goの定数名は、**変数と同様にキャメルケース** (`maxConnections`, `defaultTimeout`) を使うのが**一般的**です。
*   **エクスポート:** パッケージ外に公開する定数は、変数と同様に名前の最初の文字を大文字にします (`MaxConnections`)。非公開なら小文字で始めます (`maxRetries`)。
*   **すべて大文字は非推奨:** 他の言語で定数によく使われる `ALL_CAPS_WITH_UNDERSCORES` (例: `MAX_CONNECTIONS`) は、**Goの慣習ではありません**。Goではキャメルケースを使用してください。

## 宣言

*   **`const` キーワード:** `const` キーワードを使って宣言します。
*   **型指定:** 定数は型を持つことができますが、多くの場合、型は初期値から推論されるため省略可能です（型付けなし定数）。型付けなし定数は、より柔軟に扱える利点があります。
*   **初期値:** 定数は宣言時に必ず値を設定する必要があります。値はコンパイル時に決定できる必要があります（例: 数値リテラル、文字列リテラル、`true`/`false`、他の定数を使った式など）。
*   **グループ化:** `var` と同様に `const (...)` で複数の定数をまとめて宣言できます。

```go
package config

import "time"

// パッケージレベルで定数を宣言
const defaultPort = 8080 // 型付けなし整数定数 (int になる)
const defaultHost = "localhost" // 型付けなし文字列定数 (string になる)

// グループ化して宣言
const (
	StatusOK         = 200 // 型付けなし整数定数
	StatusNotFound   = 404
	defaultTimeout   = 30 * time.Second // 型付けなし duration 定数 (time.Duration になる)
	MaxIdleConns int = 100              // 型を明示した整数定数 (int)
)

// エクスポートされる定数 (大文字始まり)
const Version = "v1.2.0"

// 非公開の定数 (小文字始まり)
const internalKey = "some-internal-value"

// 非推奨な命名 (Go では使わない)
// const DEFAULT_PORT = 8080
```

## `iota`

`iota` は、`const` 宣言ブロック内で使われる特別な定数ジェネレータです。`iota` は `const` ブロックが登場するたびに `0` にリセットされ、ブロック内の各 `const` 指定（行）ごとに `1` ずつ増加します。連続する定数値を生成するのに便利です。

```go
const (
	LevelDebug = iota // 0
	LevelInfo         // 1 (前の行と同じ式が繰り返される)
	LevelWarning      // 2
	LevelError        // 3
)

const (
	FlagA = 1 << iota // 1 << 0 = 1
	FlagB             // 1 << 1 = 2
	FlagC             // 1 << 2 = 4
	FlagD             // 1 << 3 = 8
)
```
(`iota` の詳細については `000_basics/080_iota-for-enumeration.md` および `090_iota-for-bit-flags.md` を参照してください。)

## まとめ

*   定数名は**キャメルケース**を使います。すべて大文字は使いません。
*   `const` キーワードで宣言し、コンパイル時に値が決定できる必要があります。
*   型指定は多くの場合省略可能です（型付けなし定数）。
*   `iota` を使うと連続した値を簡単に生成できます。

定数を適切に使うことで、マジックナンバー（コード中に直接書かれた具体的な数値や文字列）を減らし、コードの意図を明確にし、変更を容易にすることができます。