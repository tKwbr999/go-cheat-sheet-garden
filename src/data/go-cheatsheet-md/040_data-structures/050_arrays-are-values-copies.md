## タイトル
title: 配列は値型 (コピーされる)

## タグ
tags: ["data-structures", "配列", "array", "値型", "コピー", "関数引数"]

## コード
```go
package main

import "fmt"

// 配列を受け取る関数 (値渡し)
func modifyArray(arr [3]int) {
	fmt.Printf("  modifyArray 内 (変更前): %v\n", arr)
	arr[0] = 999 // 関数内のコピーを変更
	fmt.Printf("  modifyArray 内 (変更後): %v\n", arr)
}

func main() {
	// 配列の代入 (コピーが発生)
	original := [3]int{1, 2, 3}
	copied := original // 全要素がコピーされる
	copied[0] = 100    // コピー先を変更

	fmt.Printf("original: %v\n", original) // 元は不変 [1 2 3]
	fmt.Printf("copied:   %v\n", copied)   // コピーが変更 [100 2 3]

	// 関数への配列の引き渡し (コピーが発生)
	arrForFunc := [3]int{10, 20, 30}
	fmt.Printf("\n関数呼び出し前: %v\n", arrForFunc)
	modifyArray(arrForFunc) // 値のコピーが渡される
	fmt.Printf("関数呼び出し後: %v\n", arrForFunc) // 元は不変 [10 20 30]
}

```

## 解説
```text
Goの配列 (`array`) の重要な特性は**値型**であることです。
これは他の多くの言語（参照型が多い）と異なります。

**値型 = コピーが発生**
配列変数を別の変数に代入したり、関数の引数として渡すと、
配列の**完全なコピー**が作成されます。
コピー先の配列を変更しても、元の配列には影響しません。
(`int`, `string`, `struct` などと同じ挙動)

**コード例:**
*   `copied := original`: `original` の全要素がコピーされ、
    独立した配列 `copied` が作られます。
    `copied[0] = 100` としても `original` は変わりません。
*   `modifyArray(arrForFunc)`: `arrForFunc` がコピーされて
    関数に渡されます。関数内で `arr[0]` を変更しても、
    それはコピーに対する変更であり、呼び出し元の
    `arrForFunc` は影響を受けません。

**(補足)** 関数内で元の配列を変更したい場合は、
配列への**ポインタ** (`*[3]int`) を渡します
(例: `func modify(ptr *[3]int) { (*ptr)[0]=... }`)。

**値型であることの影響:**
*   **安全性:** 関数が意図せず元の配列を変更する心配がない。
*   **パフォーマンス:** 配列サイズが大きい場合、コピーのコストが
    問題になる可能性がある。大きなデータの場合は、
    配列のポインタや、より一般的には**スライス**を使うことが推奨される。

Goでは固定長の配列よりも、可変長で参照型のように振る舞う
**スライス**がより頻繁に使われます。