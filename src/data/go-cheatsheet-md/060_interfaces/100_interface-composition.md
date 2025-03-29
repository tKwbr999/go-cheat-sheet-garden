## タイトル
title: インターフェースの組み合わせ (コンポジション)

## タグ
tags: ["interfaces", "interface", "埋め込み", "コンポジション", "io.Reader", "io.Writer", "io.ReadWriter"]

## コード
```go
package main

import (
	"bytes"
	"fmt"
	"io" // Reader, Writer, ReadWriter など
)

// io パッケージのインターフェース定義 (例)
// type Reader interface { Read(p []byte) (n int, err error) }
// type Writer interface { Write(p []byte) (n int, err error) }
// type ReadWriter interface {
//     Reader // Reader インターフェースを埋め込み
//     Writer // Writer インターフェースを埋め込み
// }

func main() {
	var buffer bytes.Buffer // Read と Write メソッドを持つ

	// buffer は Writer を満たす
	var writer io.Writer = &buffer
	writer.Write([]byte("Data "))
	fmt.Printf("Writer (%T): OK\n", writer)

	// buffer は Reader を満たす
	var reader io.Reader = &buffer
	// reader.Write(...) // エラー: Reader に Write はない
	fmt.Printf("Reader (%T): OK\n", reader)

	// buffer は Reader と Writer を両方満たすので、
	// それらを埋め込んだ ReadWriter も満たす
	var readWriter io.ReadWriter = &buffer
	readWriter.Write([]byte("More"))
	buf := make([]byte, 10)
	n, _ := readWriter.Read(buf)
	fmt.Printf("ReadWriter (%T): Read '%s'\n", readWriter, string(buf[:n]))
}

```

## 解説
```text
既存のインターフェースを**埋め込む (Embed)** ことで、
新しいインターフェースを**組み合わせ (Compose)** て定義できます。
(構造体の埋め込みと似ている)

**インターフェースコンポジション:**
複数の小さなインターフェースが持つメソッドセットを
すべて含んだ、より大きなインターフェースを作成できます。

**構文:**
```go
type NewInterface interface {
    EmbeddedInterface1 // 型名のみ記述
    EmbeddedInterface2
    AdditionalMethod() // 追加メソッドも可
}
```
*   インターフェース定義内に他のインターフェース名を記述。
*   `NewInterface` は、埋め込まれたインターフェース
    (`EmbeddedInterface1`, `EmbeddedInterface2`) と
    追加メソッド (`AdditionalMethod`) の**すべて**を要求します。
*   ある型が要求されるメソッドをすべて実装していれば、
    自動的に `NewInterface` も実装したことになります。

**例: `io` パッケージ**
*   `io.Reader`: `Read()` メソッドを要求。
*   `io.Writer`: `Write()` メソッドを要求。
*   `io.ReadWriter`: `Reader` と `Writer` を埋め込んでいる。
    つまり `Read()` と `Write()` の両方を要求する。

コード例では `bytes.Buffer` 型が `Read()` と `Write()` の
両方を持っているため、`io.Reader`, `io.Writer`, そして
`io.ReadWriter` のすべてのインターフェースを満たします。
そのため、`&buffer` (ポインタ) をそれぞれのインターフェース型の
変数に代入できます。

**利点:**
*   **再利用性:** 基本的なインターフェースを組み合わせて
    新しいインターフェースを簡単に作れる。
*   **関心の分離:** 小さなインターフェースで関心事を分離し、
    それらを組み合わせて必要な機能セットを表現できる。
*   **標準ライブラリ:** `io` パッケージなどで広く活用されている。

インターフェースコンポジションは、Goのインターフェースシステムの
柔軟性と強力さを示す重要な機能です。