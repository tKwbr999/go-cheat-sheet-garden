## タイトル
title: 標準ライブラリ: `fmt` パッケージ (フォーマット付き I/O)

## タグ
tags: ["packages", "standard library", "fmt", "Println", "Printf", "Sprintf", "フォーマット", "入出力"]

## コード
```go
package main

import "fmt"

type Point struct{ X, Y int }

func main() {
	name := "Gopher"
	age := 13
	pi := 3.14159
	p := Point{10, 20}

	// Println: 引数をスペース区切りで出力し、最後に改行
	fmt.Println("--- Println ---")
	fmt.Println("Hello,", name, "Age:", age)

	// Printf: 書式指定文字列に従って出力 (改行なし)
	fmt.Println("\n--- Printf ---")
	fmt.Printf("Name: %s, Age: %d\n", name, age)
	fmt.Printf("Pi (approx): %.2f\n", pi)       // 小数点以下2桁
	fmt.Printf("Point: %v, Type: %T\n", p, p)   // デフォルト形式と型

	// Sprintf: フォーマット結果を文字列として返す
	fmt.Println("\n--- Sprintf ---")
	message := fmt.Sprintf("User: %s (ID: %d)", name, 1)
	fmt.Println(message)
}

```

## 解説
```text
**`fmt`** パッケージは、データの**フォーマット**と
**入出力 (I/O)** を行う標準ライブラリで、非常によく使われます。
`import "fmt"` で利用します。

**基本的な出力関数 (標準出力へ):**
*   **`fmt.Println(a ...any)`:**
    引数をデフォルト書式でスペース区切りで出力し、最後に改行。
*   **`fmt.Print(a ...any)`:**
    `Println` と似ているが、スペースも最後の改行も自動追加しない。
*   **`fmt.Printf(format string, a ...any)`:**
    第一引数の**書式指定文字列 (`format`)** に従い、
    後続の引数 (`a...`) をフォーマットして出力。改行は自動追加されない (`\n` が必要)。

**文字列へのフォーマット:**
*   **`fmt.Sprintf(format string, a ...any) string`:**
    `Printf` と同じ書式指定で、結果を文字列として返す。
*   `fmt.Sprint(...)`, `fmt.Sprintln(...)` もあります。

**ファイル等への書き込み:**
標準出力以外 (ファイル等 `io.Writer`) へ書き込む場合は
`Fprint` 系を使います。
*   `fmt.Fprintln(w io.Writer, a ...any)`
*   `fmt.Fprint(w io.Writer, a ...any)`
*   `fmt.Fprintf(w io.Writer, format string, a ...any)`

**代表的なフォーマット動詞 (`Printf` 系):**
*   `%v`: デフォルト形式
*   `%+v`: 構造体でフィールド名付き
*   `%#v`: Go構文形式
*   `%T`: 型情報
*   `%d`: 10進数整数
*   `%b`: 2進数, `%o`: 8進数, `%x`/`%X`: 16進数
*   `%f`: 浮動小数点数 (例: `%.2f` で小数点以下2桁)
*   `%e`/`%E`: 指数形式
*   `%s`: 文字列
*   `%q`: ダブルクォート付き文字列
*   `%t`: 真偽値 (`true`/`false`)
*   `%p`: ポインタアドレス

`fmt` はデバッグ、メッセージ出力、文字列組み立て等、
様々な場面で不可欠なパッケージです。