## タイトル
title: インターフェースの命名: `-er` サフィックスの慣習

## タグ
tags: ["basics", "命名規則", "インターフェース", "-er"]

## コード
```go
package main

import "fmt"

// Logger インターフェース (Log メソッドを一つ持つ)
type Logger interface {
	Log(message string)
}

// ConsoleLogger は Logger インターフェースを実装
type ConsoleLogger struct{ Prefix string }
func (cl ConsoleLogger) Log(message string) {
	fmt.Println(cl.Prefix + message)
}

// Logger インターフェースを受け取る関数
func process(logger Logger, data string) {
	logger.Log("Processing: " + data)
}

func main() {
	myLogger := ConsoleLogger{Prefix: "[INFO] "}
	process(myLogger, "Data A") // ConsoleLogger は Logger として渡せる
}

```

## 解説
```text
Goの**インターフェース**はメソッドの集まりを定義します。

**`-er` サフィックスのルール:**
メソッドを**一つだけ**持つインターフェースの名前は、そのメソッド名に **`-er`** サフィックスを付けて命名するのが一般的です。これは「何をするものか」を簡潔に表現します。

**標準ライブラリの例:**
*   `io.Reader`: `Read()` メソッドを持つ。「読み取るもの」。
*   `io.Writer`: `Write()` メソッドを持つ。「書き込むもの」。
*   `fmt.Stringer`: `String()` メソッドを持つ。「文字列化するもの」。

コード例の `Logger` インターフェースは `Log` メソッドを一つ持つため、`-er` を付けて命名されています。`ConsoleLogger` 型は `Log` メソッドを実装するため `Logger` インターフェースを満たし、`process` 関数に渡すことができます。

この命名規則はGoで一般的な慣習であり、インターフェースの役割理解を助けます。