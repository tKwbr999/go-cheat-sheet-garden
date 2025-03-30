## タイトル
title: スライス (Slice) の宣言

## タグ
tags: ["data-structures", "スライス", "slice", "可変長", "参照型", "nil"]

## コード
```go
package main

import "fmt"

func main() {
	// スライスの宣言 (初期値なし)
	var numbers []int
	var names []string

	// ゼロ値は nil
	fmt.Printf("numbers: %v (%T)\n", numbers, numbers)
	fmt.Printf("names:   %q (%T)\n", names, names)

	if numbers == nil {
		fmt.Println("numbers は nil スライスです。")
	}

	// nil スライスの長さと容量は 0
	fmt.Printf("len=%d, cap=%d\n", len(numbers), cap(numbers))

	// nil スライスへの append は可能
	numbers = append(numbers, 10)
	fmt.Printf("append 後: %v (len=%d, cap=%d)\n", numbers, len(numbers), cap(numbers))
}

```

## 解説
```text
**スライス (Slice)** は、Goで配列以上に頻繁に使われる
重要なデータ構造です。配列と似ていますが、より柔軟です。

**スライスとは？**
配列の一部または全体への**ビュー（参照のようなもの）**です。
内部的には以下の情報を持ちます。
1.  **ポインタ:** 参照している内部配列の要素へのポインタ。
2.  **長さ (Length):** スライスに含まれる要素数 (`len()`)。
3.  **容量 (Capacity):** 内部配列の利用可能な要素数 (`cap()`)。

**配列との主な違い:**
*   **可変長:** `append` 関数で要素を追加でき、
    必要なら内部配列が自動で拡張されます。配列は固定長。
*   **参照型のような振る舞い:** 代入や関数渡しでは、
    内部配列へのポインタ等がコピーされます（参照渡しに近い）。
    コピー先のスライス変更が元の内部配列に影響します。

**宣言構文:** `var 変数名 []要素の型`
配列と似ていますが、**サイズを指定しません** (`[]`)。

**ゼロ値: `nil`**
初期値を指定せずに `var` で宣言したスライスのゼロ値は
**`nil`** です。
`nil` スライスは長さも容量も `0` で、内部配列も参照しません。
コード例のように `== nil` でチェックできます。
`nil` スライスに対しても `append` は可能です
(新しい内部配列が確保されます)。

スライスは非常に強力で柔軟なため、Goでは配列よりも
一般的に使われます。