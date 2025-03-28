---
title: "データ構造: スライス (Slice) からの要素の削除"
tags: ["data-structures", "スライス", "slice", "削除", "append", "スライス操作"]
---

スライスに要素を追加するには `append` 関数がありますが、スライスから特定の要素を**削除**するための専用の組み込み関数はGoにはありません。しかし、`append` 関数とスライス操作を組み合わせることで、要素の削除を実現できます。

## 特定インデックスの要素を削除するイディオム

スライス `s` からインデックス `i` の要素を削除するには、以下のイディオム（慣用的な書き方）がよく使われます。

`s = append(s[:i], s[i+1:]...)`

これは、以下の2つの部分スライスを `append` で連結しています。

1.  `s[:i]`: スライスの先頭から、削除したい要素の**直前**まで (`i` 番目の要素は含まない）。
2.  `s[i+1:]`: 削除したい要素の**次**の要素から、スライスの最後まで。

この2つを連結することで、結果的にインデックス `i` の要素が取り除かれた新しい（ように見える）スライスが得られます。

**注意:** この操作は、元のスライス `s` が参照していた内部配列の内容を変更する可能性があります。また、`append` の結果を元のスライス変数 `s` に再代入する必要があります。

```go title="スライスからの要素削除"
package main

import "fmt"

func printSliceInfo(name string, s []string) {
	fmt.Printf("%s: %q (len=%d, cap=%d)\n", name, s, len(s), cap(s))
}

func main() {
	fruits := []string{"Apple", "Banana", "Cherry", "Date", "Elderberry"}
	printSliceInfo("元のスライス", fruits)

	// --- インデックス 2 ("Cherry") の要素を削除 ---
	i := 2
	fmt.Printf("\nインデックス %d (\"%s\") を削除します...\n", i, fruits[i])

	// 削除前の部分: fruits[:i] -> ["Apple", "Banana"]
	// 削除後の部分: fruits[i+1:] -> ["Date", "Elderberry"]
	// append(["Apple", "Banana"], "Date", "Elderberry") を実行
	fruits = append(fruits[:i], fruits[i+1:]...) // ... で展開して渡す

	printSliceInfo("削除後のスライス", fruits)
	// 長さが 1 減る。容量は変わらないことが多い（内部配列が再利用されるため）。

	// --- 先頭要素 (インデックス 0) を削除 ---
	fmt.Println("\n先頭要素を削除します...")
	if len(fruits) > 0 {
		fruits = append(fruits[:0], fruits[1:]...) // または単に fruits = fruits[1:] でも良い
	}
	printSliceInfo("削除後のスライス", fruits)

	// --- 末尾要素を削除 ---
	fmt.Println("\n末尾要素を削除します...")
	if len(fruits) > 0 {
		fruits = fruits[:len(fruits)-1] // スライス操作で最後の要素を除外するだけ
	}
	printSliceInfo("削除後のスライス", fruits)
}

/* 実行結果 (容量は環境/バージョンにより異なる可能性あり):
元のスライス: ["Apple" "Banana" "Cherry" "Date" "Elderberry"] (len=5, cap=5)

インデックス 2 ("Cherry") を削除します...
削除後のスライス: ["Apple" "Banana" "Date" "Elderberry"] (len=4, cap=5)

先頭要素を削除します...
削除後のスライス: ["Banana" "Date" "Elderberry"] (len=3, cap=4)

末尾要素を削除します...
削除後のスライス: ["Banana" "Date"] (len=2, cap=4)
*/
```

**コード解説:**

*   `fruits = append(fruits[:i], fruits[i+1:]...)`:
    *   `fruits[:i]` は、インデックス `i` より前の要素を持つスライスです。
    *   `fruits[i+1:]` は、インデックス `i` より後の要素を持つスライスです。
    *   `append` は、最初の引数 (`fruits[:i]`) に、2番目以降の引数（`fruits[i+1:]...` で展開された要素）を追加します。この操作は、多くの場合、元の内部配列上で要素を上書き・移動させる形で実行されます。
    *   結果として得られる、要素 `i` が除かれたスライスを、元の変数 `fruits` に再代入しています。
*   **先頭要素の削除:** `fruits = fruits[1:]` というより簡単な書き方もあります。これは、インデックス 1 から最後までを指す新しいスライスを作成し、それを `fruits` に再代入しています。
*   **末尾要素の削除:** `fruits = fruits[:len(fruits)-1]` というスライス操作だけで実現できます。これは、最後の要素を除いた部分を指す新しいスライスを作成し、それを `fruits` に再代入しています。

## 注意点: メモリリークの可能性

この `append` を使った削除方法は、削除された要素がまだ内部配列内に残り、ガベージコレクションの対象にならない可能性があるという注意点があります。もし削除する要素がポインタ型や大きなデータ構造への参照を含んでいる場合、メモリリークの原因となる可能性があります。

そのような場合は、削除後に該当する要素に `nil` を代入して参照を明示的に切るか、あるいはコピーを使って完全に新しいスライスを作成するなどの対策が必要になることがあります。

```go
// ポインタを含むスライスからの削除でメモリリークを防ぐ例
type BigStruct struct { /* ... 大量のデータ ... */ }

pointers := []*BigStruct{ /* ... */ }
i := 2 // 削除するインデックス

// copy を使って要素を移動させ、最後の要素を nil にする
copy(pointers[i:], pointers[i+1:]) // i番目以降の要素を一つ前にずらす
pointers[len(pointers)-1] = nil    // 最後の要素 (元々 i+1 番目にあったものへの参照が残っている) を nil にする
pointers = pointers[:len(pointers)-1] // スライスの長さを短くする
```

単純な型のスライスであれば、通常は `append(s[:i], s[i+1:]...)` のイディオムで問題ありません。