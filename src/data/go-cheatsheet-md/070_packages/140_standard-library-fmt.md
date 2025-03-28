---
title: "標準ライブラリ: `fmt` パッケージ (フォーマット付き I/O)"
tags: ["packages", "standard library", "fmt", "Println", "Printf", "Sprintf", "フォーマット", "入出力"]
---

Go言語の標準ライブラリの中でも、**`fmt`** パッケージは最も頻繁に使われるものの一つです。`fmt` は "format" の略で、データの**フォーマット（整形）**と、コンソール（標準出力/標準エラー出力）や文字列、ファイルなどへの**入出力 (I/O)** を行うための関数を提供します。

`import "fmt"` として利用します。

## 基本的な出力関数

*   **`fmt.Println(a ...any)`:**
    *   引数として渡された値を**標準出力**（通常はコンソール画面）に表示します。
    *   各値の間にはデフォルトでスペースが挿入され、最後には**改行**が追加されます。
    *   任意の型の値を任意の数だけ渡すことができます (`...any`)。
*   **`fmt.Print(a ...any)`:**
    *   `Println` と似ていますが、値の間にスペースを自動挿入せず、最後にも**改行を追加しません**。
*   **`fmt.Printf(format string, a ...any)`:**
    *   第一引数に**書式指定文字列 (format string)** を、第二引数以降にその書式に従って表示したい値を渡します。
    *   書式指定文字列中の**フォーマット動詞 (format verb)**（例: `%d`, `%s`, `%f`）が、対応する値で置き換えられて標準出力に表示されます。
    *   最後に**改行は自動追加されません**。改行したい場合は `\n` を書式指定文字列に含めます。

## 文字列へのフォーマット関数

`Printf` と同様のフォーマット機能を使って、結果を標準出力ではなく**文字列として**取得したい場合は、`Sprintf` を使います。

*   **`fmt.Sprintf(format string, a ...any) string`:**
    *   `Printf` と同じように書式指定文字列と値を受け取りますが、結果を標準出力に表示する代わりに、フォーマットされた**文字列を返します**。

同様に `Sprint` や `Sprintln` もあります。

## ファイルなどへの書き込み関数

標準出力以外の場所（ファイル、ネットワーク接続など）にフォーマットして書き込みたい場合は、`Fprint`系の関数を使います。これらの関数は、第一引数に `io.Writer` インターフェースを満たす値（書き込み先）を取ります。

*   `fmt.Fprintln(w io.Writer, a ...any)`
*   `fmt.Fprint(w io.Writer, a ...any)`
*   `fmt.Fprintf(w io.Writer, format string, a ...any)`

## 代表的なフォーマット動詞 (`Printf` 系)

`Printf` や `Sprintf`, `Fprintf` で使われる主なフォーマット動詞には以下のようなものがあります。

| 動詞   | 説明                                       | 例 (値: 123, "Go", true, Point{1,2}) |
| :----- | :----------------------------------------- | :----------------------------------- |
| `%v`   | 値をデフォルトの書式で表示                 | `123`, `"Go"`, `true`, `{1 2}`       |
| `%+v`  | 構造体の場合、フィールド名も表示           | `{X:1 Y:2}`                          |
| `%#v`  | 値をGoの構文に準拠した形式で表示           | `123`, `"Go"`, `true`, `main.Point{X:1, Y:2}` |
| `%T`   | 値の型をGoの構文形式で表示                 | `int`, `string`, `bool`, `main.Point` |
| `%d`   | 整数を10進数で表示                         | `123`                                |
| `%b`   | 整数を2進数で表示                          | `1111011`                            |
| `%o`   | 整数を8進数で表示                          | `173`                                |
| `%x`, `%X` | 整数を16進数で表示 (小文字/大文字)       | `7b`, `7B`                           |
| `%f`, `%.2f` | 浮動小数点数を表示 (小数点以下6桁/2桁) | `3.141590`, `3.14`                   |
| `%e`, `%E` | 浮動小数点数を指数形式で表示             | `1.234e+05`, `1.234E+05`             |
| `%g`, `%G` | `%e`/`%E` または `%f` の短い方            | `3.14159265`                         |
| `%s`   | 文字列またはバイトスライスをそのまま表示     | `"Go"`                               |
| `%q`   | 文字列をダブルクォートで囲んで安全に表示   | `"\"Go\""`                           |
| `%t`   | 真偽値 (`true` または `false`)             | `true`                               |
| `%p`   | ポインタのアドレスを16進数で表示           | `0x1400011c018`                      |
| `%%`   | `%` 記号自体を表示                         | `%`                                  |

## コード例

```go title="fmt パッケージの使用例"
package main

import (
	"fmt"
	"os" // os.Stdout (標準出力) を使うため
)

type Point struct { X, Y int }

func main() {
	name := "Gopher"
	age := 13
	pi := 3.14159
	p := Point{10, 20}

	// --- Println, Print ---
	fmt.Println("--- Println/Print ---")
	fmt.Println("Hello,", name, "Age:", age) // 自動でスペースと改行
	fmt.Print("Pi is approx. ")
	fmt.Print(pi) // 改行なし
	fmt.Println() // 改行だけ出力

	// --- Printf とフォーマット動詞 ---
	fmt.Println("\n--- Printf ---")
	fmt.Printf("名前: %s, 年齢: %d歳\n", name, age)
	fmt.Printf("円周率 (小数点以下3桁): %.3f\n", pi)
	fmt.Printf("Point (デフォルト): %v\n", p)
	fmt.Printf("Point (フィールド名付き): %+v\n", p)
	fmt.Printf("Point (Go構文): %#v\n", p)
	fmt.Printf("age の型: %T\n", age)
	fmt.Printf("10進数: %d, 2進数: %b, 16進数: %X\n", age, age, age)
	fmt.Printf("ポインタ p のアドレス: %p\n", &p)
	fmt.Printf("パーセント記号: %%\n")

	// --- Sprintf ---
	fmt.Println("\n--- Sprintf ---")
	message := fmt.Sprintf("ユーザー %s (ID: %04d) がログインしました。", name, 1) // 4桁ゼロ埋め
	fmt.Println(message)

	// --- Fprintf ---
	fmt.Println("\n--- Fprintf (標準出力へ) ---")
	// os.Stdout は標準出力を表す io.Writer
	fmt.Fprintf(os.Stdout, "Fprintf を使って標準出力に書き込み: %d\n", 123)
	// (ファイルなどに書き込む場合は、開いた *os.File を第一引数に渡す)
}

/* 実行結果:
--- Println/Print ---
Hello, Gopher Age: 13
Pi is approx. 3.14159

--- Printf ---
名前: Gopher, 年齢: 13歳
円周率 (小数点以下3桁): 3.142
Point (デフォルト): {10 20}
Point (フィールド名付き): {X:10 Y:20}
Point (Go構文): main.Point{X:10, Y:20}
age の型: int
10進数: 13, 2進数: 1101, 16進数: D
ポインタ p のアドレス: 0x1400011c018
パーセント記号: %

--- Sprintf ---
ユーザー Gopher (ID: 0001) がログインしました。

--- Fprintf (標準出力へ) ---
Fprintf を使って標準出力に書き込み: 123
*/
```

`fmt` パッケージは、デバッグ情報の表示、ユーザーへのメッセージ出力、ログ記録、文字列の組み立てなど、Goプログラミングの様々な場面で不可欠なツールです。フォーマット動詞を使いこなすことで、データを分かりやすく整形して表示・利用することができます。