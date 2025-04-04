## タイトル
title: インポート時のエイリアス (別名)

## タグ
tags: ["packages", "package", "import", "エイリアス"]

## コード
```go
package main

// fmt パッケージを f というエイリアスでインポート
import f "fmt"
import "strings" // 比較用

func main() {
	// エイリアス f を使って fmt の関数を呼び出す
	f.Println("エイリアスを使って出力")

	s := strings.ToUpper("hello")
	f.Println(s) // ここでも f を使う
}

```

## 解説
```text
`import` 文でパッケージをインポートする際、
パッケージ名の前に**エイリアス (別名)** を
指定することができます。

**構文:** `エイリアス名 "パッケージパス"`
例: `import f "fmt"`

**主な用途:**
*   **名前の衝突回避:** 異なるパッケージで同じ名前
    (関数名、型名など) が使われている場合に、
    どちらのパッケージのものかを区別するために
    別名を付けます。
*   **短縮:** パッケージ名が非常に長い場合に、
    短い別名を付けてコードの記述量を減らすことがあります
    (ただし、分かりにくくならない範囲で)。

コード例では、標準の `fmt` パッケージを `f` という
エイリアスでインポートしています。
そのため、`fmt.Println` の代わりに `f.Println` として
関数を呼び出すことができます。

エイリアスは、特に名前の衝突を解決するために
重要な機能です。