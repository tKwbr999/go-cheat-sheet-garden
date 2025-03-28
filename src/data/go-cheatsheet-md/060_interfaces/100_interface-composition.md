---
title: "インターフェース: インターフェースの組み合わせ (コンポジション)"
tags: ["interfaces", "interface", "埋め込み", "コンポジション", "io.Reader", "io.Writer", "io.ReadWriter"]
---

Go言語では、既存のインターフェースを**埋め込む (Embed)** ことで、新しいインターフェースを**組み合わせ (Compose)** て定義することができます。これは、構造体の埋め込みと似た概念ですが、インターフェースに対して行われます。

## インターフェースコンポジションとは？

インターフェースコンポジションを使うと、複数の小さなインターフェースが持つメソッドセットをすべて含んだ、より大きな（より具体的な要求を持つ）インターフェースを簡単に作成できます。

**構文:**
```go
type 新インターフェース名 interface {
	埋め込むインターフェース名1
	埋め込むインターフェース名2
	// ...
	追加のメソッドシグネチャ1 // 必要なら追加のメソッドも定義できる
	// ...
}
```

*   インターフェース定義の中に、他のインターフェース名を（フィールド名なしで）記述します。
*   新しいインターフェースは、埋め込まれたすべてのインターフェースが持つメソッドと、追加で定義されたメソッドの両方を要求するようになります。
*   ある型が、埋め込まれたすべてのインターフェースのメソッド（および追加されたメソッド）を実装していれば、その型は自動的に新しいインターフェースも実装していることになります。

## コード例: `io.Reader`, `io.Writer`, `io.ReadWriter`

標準ライブラリの `io` パッケージにあるインターフェースは、コンポジションの良い例です。

*   `io.Reader`: データの読み取り元を表すインターフェース。`Read` メソッドを要求します。
*   `io.Writer`: データの書き込み先を表すインターフェース。`Write` メソッドを要求します。
*   `io.ReadWriter`: 読み取りと書き込みの両方が可能なものを表すインターフェース。`Reader` と `Writer` を埋め込むことで定義されています。

```go title="インターフェースコンポジションの例 (io パッケージ風)"
package main

import (
	"bytes" // バイトバッファを提供
	"fmt"
	"io"    // Reader, Writer, ReadWriter などが定義されている
)

// --- インターフェース定義 (io パッケージの定義と同様) ---
// type Reader interface {
// 	Read(p []byte) (n int, err error)
// }
// type Writer interface {
// 	Write(p []byte) (n int, err error)
// }

// ReadWriter インターフェースは Reader と Writer を埋め込んでいる
// type ReadWriter interface {
// 	Reader
// 	Writer
// }

// --- 具体的な型の実装例 ---
// bytes.Buffer は Read と Write の両方のメソッドを持つため、
// io.Reader, io.Writer, そして io.ReadWriter のすべてを実装している

func main() {
	// bytes.Buffer のインスタンスを作成 (ポインタ)
	// bytes.Buffer はメモリ上で読み書き可能なバッファを提供する
	var buffer bytes.Buffer // または var buffer = new(bytes.Buffer)

	// --- インターフェース変数への代入 ---

	// buffer は Write メソッドを持つので io.Writer 型変数に代入可能
	var writer io.Writer = &buffer
	fmt.Printf("writer の型: %T\n", writer)
	writer.Write([]byte("Hello, ")) // Writer として書き込み

	// buffer は Read メソッドを持つので io.Reader 型変数に代入可能
	var reader io.Reader = &buffer
	fmt.Printf("reader の型: %T\n", reader)
	// reader.Write([]byte("World!")) // エラー: reader (io.Reader) には Write メソッドはない

	// buffer は Read と Write の両方を持つので io.ReadWriter 型変数に代入可能
	var readWriter io.ReadWriter = &buffer
	fmt.Printf("readWriter の型: %T\n", readWriter)
	readWriter.Write([]byte("World!")) // ReadWriter として書き込み

	// --- インターフェースを利用する関数 ---
	// io.Reader を受け取る関数 (例)
	processReader(reader)
	// io.Writer を受け取る関数 (例)
	processWriter(writer, []byte(" How are you?"))
	// io.ReadWriter を受け取る関数 (例)
	processReadWriter(readWriter)
}

// io.Reader を受け取る関数
func processReader(r io.Reader) {
	fmt.Println("\n--- processReader ---")
	buf := make([]byte, 10)
	n, err := r.Read(buf) // Read メソッドを呼び出す
	if err != nil && err != io.EOF {
		fmt.Println("読み取りエラー:", err)
		return
	}
	fmt.Printf("読み取ったデータ (%d バイト): %s\n", n, string(buf[:n]))
}

// io.Writer を受け取る関数
func processWriter(w io.Writer, data []byte) {
	fmt.Println("\n--- processWriter ---")
	n, err := w.Write(data) // Write メソッドを呼び出す
	if err != nil {
		fmt.Println("書き込みエラー:", err)
		return
	}
	fmt.Printf("書き込んだデータ (%d バイト): %s\n", n, string(data))
}

// io.ReadWriter を受け取る関数
func processReadWriter(rw io.ReadWriter) {
	fmt.Println("\n--- processReadWriter ---")
	// ReadWriter は Reader と Writer の両方のメソッドを持つ
	data := []byte(" Test!")
	_, _ = rw.Write(data) // 書き込み
	buf := make([]byte, 32)
	n, _ := rw.Read(buf) // 読み取り
	fmt.Printf("ReadWriter から読み取り: %s\n", string(buf[:n]))
}


/* 実行結果:
writer の型: *bytes.Buffer
reader の型: *bytes.Buffer
readWriter の型: *bytes.Buffer

--- processReader ---
読み取ったデータ (10 バイト): Hello, Wor

--- processWriter ---
書き込んだデータ (14 バイト):  How are you?

--- processReadWriter ---
ReadWriter から読み取り: ld! How are you? Test!
*/
```

**コード解説:**

*   `io.ReadWriter` インターフェースは、`io.Reader` と `io.Writer` を埋め込むことで定義されています。これは、「`ReadWriter` であるためには、`Reader` のメソッド (`Read`) と `Writer` のメソッド (`Write`) の両方を持っていなければならない」という契約を意味します。
*   `bytes.Buffer` 型は、`Read` メソッドと `Write` メソッドの両方を実装しています。
*   そのため、`*bytes.Buffer` 型の値 (`&buffer`) は、`io.Reader`, `io.Writer`, `io.ReadWriter` の**すべてのインターフェースを満たし**、それぞれの型の変数に代入できます。
*   `processReader`, `processWriter`, `processReadWriter` 関数は、それぞれ対応するインターフェース型の引数を受け取ります。`&buffer` はこれらすべての関数に渡すことができます。

## 利点

*   **再利用性:** `Reader` や `Writer` のような基本的なインターフェースを定義しておけば、それらを組み合わせて `ReadWriter`, `ReadCloser`, `WriteCloser`, `ReadWriteCloser` のような、より具体的な要求を持つインターフェースを簡単に作成できます。
*   **関心の分離:** 小さなインターフェースは、それぞれ特定の関心事（読み取り、書き込み、クローズなど）に焦点を当てています。これらを組み合わせることで、必要な機能セットを柔軟に表現できます。
*   **標準ライブラリでの活用:** Goの標準ライブラリ、特に `io` パッケージでは、このインターフェースコンポジションが広く活用されており、様々なデータソースやデータシンクを統一的に扱うための基盤となっています。

インターフェースコンポジションは、Goのインターフェースシステムの柔軟性と強力さを示す重要な機能です。小さなインターフェースをうまく組み合わせることで、拡張性が高く、理解しやすいコードを設計することができます。