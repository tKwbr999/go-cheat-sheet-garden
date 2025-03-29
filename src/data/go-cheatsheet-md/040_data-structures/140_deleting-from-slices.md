## タイトル
title: データ構造: スライス (Slice) からの要素の削除

## タグ
tags: ["data-structures", "スライス", "slice", "削除", "append", "スライス操作"]

## コード
```go
package main

import "fmt"

func main() {
	fruits := []string{"Apple", "Banana", "Cherry", "Date", "Elderberry"}
	fmt.Printf("元: %q (len=%d)\n", fruits, len(fruits))

	// インデックス 2 ("Cherry") を削除
	i := 2
	fruits = append(fruits[:i], fruits[i+1:]...)
	fmt.Printf("削除後(idx %d): %q (len=%d)\n", i, fruits, len(fruits))

	// 先頭要素 ("Apple" 相当) を削除
	if len(fruits) > 0 {
		fruits = fruits[1:] // 簡単な方法
		// または fruits = append(fruits[:0], fruits[1:]...)
	}
	fmt.Printf("先頭削除後: %q (len=%d)\n", fruits, len(fruits))

	// 末尾要素 ("Elderberry" 相当) を削除
	if len(fruits) > 0 {
		fruits = fruits[:len(fruits)-1] // 簡単な方法
	}
	fmt.Printf("末尾削除後: %q (len=%d)\n", fruits, len(fruits))
}

```

## 解説
```text
スライスから特定の要素を**削除**するための
専用の組み込み関数はありませんが、`append` 関数と
スライス操作を組み合わせて実現できます。

**特定インデックス `i` の要素削除イディオム:**
`s = append(s[:i], s[i+1:]...)`

1. `s[:i]`: 削除要素の**直前**までのスライス。
2. `s[i+1:]`: 削除要素の**次**から最後までのスライス。
3. `append` で 1. に 2. の要素を**展開 (`...`)** して追加する。
   これにより、`i` 番目の要素が除かれた状態になる。

**注意:**
*   この操作は元の内部配列の内容を変更する可能性があります。
*   `append` の結果を元のスライス変数 `s` に再代入します。

**簡単なケース:**
*   **先頭要素の削除:** `s = s[1:]`
*   **末尾要素の削除:** `s = s[:len(s)-1]`

**メモリリークの可能性:**
`append` を使った削除では、削除された要素が内部配列に残り、
ガベージコレクションされない可能性があります。
特にポインタや大きな構造体のスライスの場合、
メモリリークに繋がることがあります。
対策として、`copy` で要素をずらしてから末尾要素に `nil` を代入し、
最後にスライスの長さを縮める方法があります。
```go
// copy(s[i:], s[i+1:])
// s[len(s)-1] = nil // またはゼロ値
// s = s[:len(s)-1]
```
単純な型のスライスなら通常は `append` イディオムで問題ありません。