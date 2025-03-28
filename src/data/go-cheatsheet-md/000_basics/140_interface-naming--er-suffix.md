---
title: "インターフェースの命名: `-er` サフィックスの慣習"
tags: ["basics", "命名規則", "インターフェース", "-er"]
---

Go言語には**インターフェース (Interface)** という重要な機能があります。インターフェースは、特定のメソッド（操作）の集まりを定義するものです。ある型がインターフェースで定義されたメソッドをすべて持っていれば、その型はそのインターフェースを「実装している」とみなされます。（インターフェースの詳細は後のセクションで詳しく学びます）

ここでは、特に**メソッドが一つだけ**定義されているインターフェースの命名に関するGoコミュニティの慣習について説明します。

## `-er` サフィックスのルール

Goでは、メソッドを一つだけ持つインターフェースの名前は、そのメソッド名に **`-er`** サフィックスを付けて命名するのが一般的です。もしメソッド名が既に `-er` で終わっている場合は、`-or` を付けることもあります。

この命名規則は、そのインターフェースが「何をするものか」を簡潔に表現することを目的としています。

## 標準ライブラリの例

この `-er` サフィックスの命名規則は、Goの標準ライブラリで広く使われています。

*   **`io.Reader`**: `Read()` メソッドを一つだけ持つインターフェース。「読み取るもの」を表します。
    ```go
    type Reader interface {
        Read(p []byte) (n int, err error)
    }
    ```
*   **`io.Writer`**: `Write()` メソッドを一つだけ持つインターフェース。「書き込むもの」を表します。
    ```go
    type Writer interface {
        Write(p []byte) (n int, err error)
    }
    ```
*   **`fmt.Stringer`**: `String()` メソッドを一つだけ持つインターフェース。「文字列として表現できるもの」を表します。`fmt.Println` などはこのインターフェースをチェックして、オブジェクトをどのように表示するかを決定します。
    ```go
    type Stringer interface {
        String() string
    }
    ```
*   **`http.Handler`**: `ServeHTTP()` メソッドを一つだけ持つインターフェース。「HTTPリクエストを処理するもの」を表します。
    ```go
    type Handler interface {
        ServeHTTP(ResponseWriter, *Request)
    }
    ```

## コード例

簡単な例を見てみましょう。

```go title="単一メソッドインターフェースの命名例"
package main

import "fmt"

// --- インターフェース定義 ---

// Log メソッドを持つインターフェース (ログを出力するもの)
type Logger interface {
	Log(message string)
}

// --- インターフェースの実装 ---

// ConsoleLogger 型を定義 (具体的な実装)
type ConsoleLogger struct {
	Prefix string
}

// ConsoleLogger 型に Log メソッドを実装する
// これにより、ConsoleLogger は Logger インターフェースを実装したことになる
func (cl ConsoleLogger) Log(message string) {
	fmt.Println(cl.Prefix + message)
}

// --- インターフェースを使った関数 ---

// Logger インターフェースを受け取る関数
// この関数は、具体的な実装 (ConsoleLogger など) を知らなくても、
// Log メソッドさえ持っていればどんな型でも受け取れる
func process(logger Logger, data string) {
	// ... 何らかの処理 ...
	logger.Log("処理完了: " + data)
}

func main() {
	// ConsoleLogger のインスタンスを作成
	myLogger := ConsoleLogger{Prefix: "[INFO] "}

	// process 関数に ConsoleLogger を渡す (Logger インターフェースを満たしているので OK)
	process(myLogger, "データA")
}

/* 実行結果:
[INFO] 処理完了: データA
*/
```

**ポイント:**

*   `Logger` インターフェースは `Log` というメソッドを一つだけ持っているので、メソッド名 `Log` に `-er` を付けて `Logger` と命名されています。
*   `ConsoleLogger` 型は `Log` メソッドを実装しているため、`Logger` インターフェースを満たします。
*   `process` 関数は、具体的な型 (`ConsoleLogger`) ではなく、抽象的なインターフェース (`Logger`) を受け取るように定義されています。これにより、`Log` メソッドを持つ他の型（例えばファイルにログを書き出す `FileLogger` など）も `process` 関数に渡せるようになり、コードの柔軟性が高まります。

この `-er` サフィックスの命名規則は、Goのコードを読み書きする上で非常に一般的な慣習であり、インターフェースがどのような振る舞いを期待しているかを理解する助けになります。