## タイトル
title: データ構造: マップ (Map) は参照型

## タグ
tags: ["data-structures", "マップ", "map", "参照型", "ポインタ", "共有", "関数引数"]

## コード
```go
package main

import "fmt"

// マップを受け取り変更する関数 (参照渡し)
func modifyMap(m map[string]int) {
	fmt.Printf("  modifyMap 内 (変更前): %v\n", m)
	m["Carol"] = 75 // 関数内でマップを変更
	delete(m, "Bob")
	fmt.Printf("  modifyMap 内 (変更後): %v\n", m)
}

func main() {
	// マップの代入 (参照がコピーされる)
	originalMap := map[string]int{"Alice": 85, "Bob": 92}
	copiedMap := originalMap // 同じマップデータを指す
	copiedMap["Bob"] = 90    // copiedMap 経由で変更

	fmt.Printf("originalMap: %v\n", originalMap) // 元のマップも変更されている
	fmt.Printf("copiedMap:   %v\n", copiedMap)

	// 関数へのマップの引き渡し (参照が渡される)
	mapForFunc := map[string]int{"Alice": 100, "Bob": 200}
	fmt.Printf("\n関数呼び出し前: %v\n", mapForFunc)
	modifyMap(mapForFunc) // 関数内で mapForFunc が変更される
	fmt.Printf("関数呼び出し後: %v\n", mapForFunc)
}

```

## 解説
```text
配列 (`array`) が値型だったのに対し、Goの**マップ (`map`)** は
**参照型 (Reference Type)** です (スライスやチャネルも同様)。

**参照型とは？ データ共有**
マップ変数を別の変数に代入 (`m2 := m1`) したり、
関数の引数として渡したりする際、マップのデータ構造全体ではなく、
そのデータ構造への**参照（ポインタのようなもの）**がコピーされます。

結果として、複数のマップ変数が**同じマップデータ**を指し示します。
一方の変数を通じてマップの内容を変更すると、
**もう一方の変数からもその変更が見えます**。

**コード例:**
*   `copiedMap := originalMap`: `copiedMap` と `originalMap` は
    同じマップデータを共有します。`copiedMap["Bob"] = 90` とすると
    `originalMap["Bob"]` も `90` になります。
*   `modifyMap(mapForFunc)`: `mapForFunc` の参照が関数に渡されます。
    関数内で `m` (渡された参照) を通じて要素を追加・削除すると、
    呼び出し元の `mapForFunc` も変更されます。

**なぜ参照型か？**
マップは内部的に複雑で動的なデータ構造を持つため、
代入や関数渡しで毎回全データをコピーするのは非効率です。
参照型にすることで効率的に扱えます。

マップが参照型であることを理解することは、意図しない
データ変更を防ぎ、効率的なデータ共有のために重要です。
マップの独立したコピーが必要な場合は、新しいマップを作成し、
元のマップの要素をループでコピーする必要があります。