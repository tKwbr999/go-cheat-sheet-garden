---
title: "メソッド: メソッドチェーン (Method Chaining)"
tags: ["methods", "メソッドチェーン", "流暢なインターフェース", "ビルダーパターン", "ポインタレシーバ"]
---

メソッド呼び出しを `.` で繋げて、流れるように記述するスタイルを**メソッドチェーン (Method Chaining)** または**流暢なインターフェース (Fluent Interface)** と呼びます。これにより、一連の操作をより直感的かつ簡潔に表現できます。

## メソッドチェーンの実現方法

メソッドチェーンを実現する一般的な方法は、メソッドが処理を行った後、**レシーバ自身（通常はそのポインタ）を戻り値として返す**ように設計することです。

```go
func (レシーバ *型) メソッド名(引数...) *型 {
	// レシーバに対する処理...
	return レシーバ // レシーバ自身へのポインタを返す
}
```

メソッドがレシーバへのポインタを返すことで、その戻り値に対してさらに別のメソッドを `.` で繋げて呼び出すことが可能になります。

## コード例: 文字列ビルダー

簡単な文字列ビルダーを例に、メソッドチェーンを実装してみましょう。

```go title="メソッドチェーンを使った文字列ビルダー"
package main

import "fmt"

// StringBuilder: 文字列を効率的に組み立てるための構造体
type StringBuilder struct {
	buffer []byte // 文字列のバイトデータを保持するスライス
}

// NewStringBuilder: 新しい StringBuilder を作成するコンストラクタ関数
func NewStringBuilder() *StringBuilder {
	// ポインタを返すことで、メソッドチェーンを始めやすくする
	return &StringBuilder{}
}

// Append: 文字列を末尾に追加するメソッド
// レシーバへのポインタ (*StringBuilder) を返すことでチェーンを可能にする
func (sb *StringBuilder) Append(s string) *StringBuilder {
	if sb == nil { // 安全のための nil チェック
		return nil
	}
	sb.buffer = append(sb.buffer, s...) // 文字列 s をバイトスライスとして buffer に追加
	return sb // レシーバ自身 (sb) を返す
}

// AppendLine: 文字列と改行を末尾に追加するメソッド
func (sb *StringBuilder) AppendLine(s string) *StringBuilder {
	if sb == nil {
		return nil
	}
	sb.Append(s) // 既存の Append メソッドを利用
	sb.Append("\n") // 改行を追加
	return sb // レシーバ自身を返す
}

// String: 組み立てられた最終的な文字列を返すメソッド
// このメソッドはチェーンの最後に呼ばれることが多いため、*StringBuilder を返す必要はない
func (sb *StringBuilder) String() string {
	if sb == nil {
		return ""
	}
	return string(sb.buffer) // バイトスライスを文字列に変換して返す
}

func main() {
	// --- メソッドチェーンによる呼び出し ---
	builder := NewStringBuilder() // まずビルダーを作成

	// メソッド呼び出しを . で繋げる
	result := builder.Append("Hello").Append(", ").AppendLine("World!").Append("How are you?").String()
	// 1. builder.Append("Hello") -> builder を返す
	// 2. (返された builder).Append(", ") -> builder を返す
	// 3. (返された builder).AppendLine("World!") -> builder を返す
	// 4. (返された builder).Append("How are you?") -> builder を返す
	// 5. (返された builder).String() -> 最終的な文字列を返す

	fmt.Println("--- メソッドチェーンの結果 ---")
	fmt.Println(result)

	// --- 個別に呼び出す場合 (比較用) ---
	builder2 := NewStringBuilder()
	builder2.Append("This")
	builder2.Append(" ")
	builder2.Append("is")
	builder2.Append(" ")
	builder2.Append("another")
	builder2.Append(" ")
	builder2.Append("test.")
	result2 := builder2.String()

	fmt.Println("\n--- 個別呼び出しの結果 ---")
	fmt.Println(result2)
}

/* 実行結果:
--- メソッドチェーンの結果 ---
Hello, World!
How are you?

--- 個別呼び出しの結果 ---
This is another test.
*/
```

**コード解説:**

*   `StringBuilder` 構造体は、文字列データを保持するためのバイトスライス `buffer` を持ちます。
*   `Append` と `AppendLine` メソッドは、文字列を `buffer` に追加した後、レシーバ自身 (`sb`) へのポインタ (`*StringBuilder`) を `return` しています。
*   `String` メソッドは、最終的な文字列を生成して返すため、`*StringBuilder` を返す必要はありません。
*   `main` 関数では、`builder.Append("Hello").Append(", ").AppendLine("World!")...` のように、`Append` や `AppendLine` の呼び出しが `.` で繋がっています。これは、各メソッドがレシーバ (`builder`) へのポインタを返すため、その戻り値に対してさらに次のメソッドを呼び出すことができるからです。
*   比較のために示した個別呼び出しの場合よりも、メソッドチェーンを使った方がコードが短く、一連の操作であることが分かりやすくなっています。

## 利点と注意点

**利点:**

*   **可読性:** 一連の操作が流れるように記述でき、コードが読みやすくなる場合があります。
*   **記述量の削減:** 同じ変数名を繰り返し書く必要がなくなります。

**注意点:**

*   **デバッグ:** チェーンの途中で問題が発生した場合、どのメソッド呼び出しで問題が起きたのか特定しにくくなることがあります。
*   **乱用:** 過度に長いメソッドチェーンは、逆に可読性を損なう可能性もあります。

メソッドチェーンは、特に**ビルダーパターン**（オブジェクトの構築プロセスを段階的に行うデザインパターン）や、設定を流れるように記述したい場合などに有効なテクニックです。