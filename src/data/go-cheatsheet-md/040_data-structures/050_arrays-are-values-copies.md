---
title: "データ構造: 配列は値型 (コピーされる)"
tags: ["data-structures", "配列", "array", "値型", "コピー", "関数引数"]
---

Go言語における配列 (`array`) の非常に重要な特性の一つは、それが**値型 (Value Type)** であるということです。これは、他の多くのプログラミング言語における配列の挙動（参照型として扱われることが多い）とは異なります。

## 値型とは？ コピーが発生する

配列が値型であるということは、配列変数を別の変数に代入したり、関数の引数として渡したりする際に、配列の**完全なコピー**が作成されることを意味します。コピー先の配列を変更しても、元の配列には影響しません。

これは、`int` や `float64`, `bool`, `string`, `struct` といった他の基本的な値型と同じ挙動です。

```go title="配列の代入と関数への引き渡し (コピーが発生)"
package main

import "fmt"

// 配列を受け取り、その要素を変更しようとする関数
// Go では配列は値渡しされるため、関数内で配列を変更しても呼び出し元の配列には影響しない
func modifyArray(arr [3]int) {
	fmt.Printf("  modifyArray 内 (変更前): arr = %v\n", arr)
	arr[0] = 999 // 関数内のコピーを変更
	fmt.Printf("  modifyArray 内 (変更後): arr = %v\n", arr)
}

// 配列へのポインタを受け取る関数
// ポインタを使うと、関数内で元の配列を変更できる (詳細はポインタのセクションで)
func modifyArrayByPointer(arrPtr *[3]int) {
	fmt.Printf("  modifyArrayByPointer 内 (変更前): *arrPtr = %v\n", *arrPtr)
	(*arrPtr)[0] = 888 // ポインタを通じて元の配列を変更
	// arrPtr[0] = 888 とも書ける (Go のシンタックスシュガー)
	fmt.Printf("  modifyArrayByPointer 内 (変更後): *arrPtr = %v\n", *arrPtr)
}

func main() {
	// --- 配列の代入 ---
	original := [3]int{1, 2, 3}
	fmt.Printf("代入前: original = %v\n", original)

	// 配列を別の変数に代入すると、全要素がコピーされる
	copied := original
	fmt.Printf("コピー直後: copied = %v\n", copied)

	// コピー先の配列を変更する
	copied[0] = 100
	fmt.Printf("コピーを変更後: copied = %v\n", copied)

	// 元の配列は変更されていないことを確認
	fmt.Printf("元の配列は不変: original = %v\n", original)

	fmt.Println("\n--- 関数への配列の引き渡し ---")
	arrForFunc := [3]int{10, 20, 30}
	fmt.Printf("関数呼び出し前: arrForFunc = %v\n", arrForFunc)

	// modifyArray 関数に配列を渡す (値のコピーが渡される)
	modifyArray(arrForFunc)

	// modifyArray 関数内でコピーが変更されても、元の配列は影響を受けない
	fmt.Printf("関数呼び出し後: arrForFunc = %v\n", arrForFunc)

	fmt.Println("\n--- 関数への配列ポインタの引き渡し ---")
	arrForPtr := [3]int{11, 22, 33}
	fmt.Printf("ポインタ渡し前: arrForPtr = %v\n", arrForPtr)

	// modifyArrayByPointer 関数に配列のポインタ (&arrForPtr) を渡す
	modifyArrayByPointer(&arrForPtr)

	// ポインタを通じて関数内で変更されたため、元の配列も変更されている
	fmt.Printf("ポインタ渡し後: arrForPtr = %v\n", arrForPtr)
}

/* 実行結果:
代入前: original = [1 2 3]
コピー直後: copied = [1 2 3]
コピーを変更後: copied = [100 2 3]
元の配列は不変: original = [1 2 3]

--- 関数への配列の引き渡し ---
関数呼び出し前: arrForFunc = [10 20 30]
  modifyArray 内 (変更前): arr = [10 20 30]
  modifyArray 内 (変更後): arr = [999 20 30]
関数呼び出し後: arrForFunc = [10 20 30]

--- 関数への配列ポインタの引き渡し ---
ポインタ渡し前: arrForPtr = [11 22 33]
  modifyArrayByPointer 内 (変更前): *arrPtr = [11 22 33]
  modifyArrayByPointer 内 (変更後): *arrPtr = [888 22 33]
ポインタ渡し後: arrForPtr = [888 22 33]
*/
```

**コード解説:**

*   `copied := original`: `original` 配列の全要素がコピーされ、新しい配列 `copied` が作成されます。`copied` と `original` はメモリ上で別の場所に存在する独立した配列です。
*   `copied[0] = 100`: `copied` 配列の要素を変更しても、`original` 配列には影響しません。
*   `modifyArray(arrForFunc)`: `arrForFunc` 配列が**コピーされて** `modifyArray` 関数に渡されます。関数内で `arr[0]` を変更しても、それはコピーに対する変更であり、`main` 関数内の `arrForFunc` は変わりません。
*   `modifyArrayByPointer(&arrForPtr)`: `arrForPtr` 配列のメモリアドレス（ポインタ）を関数に渡しています。関数内では、そのポインタを通じて**元の配列** `arrForPtr` にアクセスし、変更することができます。

## 値型であることの影響

*   **安全性:** 関数が意図せず元の配列を変更してしまう心配がありません。
*   **パフォーマンス:** 配列のサイズが大きい場合、代入や関数呼び出しのたびに全要素のコピーが発生するため、パフォーマンスに影響を与える可能性があります。大きなデータを扱う場合は、配列そのものではなく、配列への**ポインタ**や、より一般的には**スライス**を使うことが推奨されます。

Goにおいて配列が値型であることは、他の言語から来た開発者にとっては少し驚きかもしれませんが、この特性を理解することは重要です。多くの場合、Goでは固定長の配列よりも可変長で参照型のように振る舞う**スライス**がより頻繁に使われます。