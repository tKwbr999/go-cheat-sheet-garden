## タイトル
title: データ構造: マップ (Map) をキーでソートして反復処理

## タグ
tags: ["data-structures", "マップ", "map", "for range", "ループ", "繰り返し", "ソート", "sort", "順序"]

## コード
```go
package main

import (
	"fmt"
	"sort" // ソート用パッケージ
)

func main() {
	stock := map[string]int{
		"orange": 0, "grape": 15, "apple": 10, "banana": 25,
	}

	// 1. キーの抽出
	keys := make([]string, 0, len(stock))
	for k := range stock {
		keys = append(keys, k)
	}
	fmt.Printf("キー (ソート前): %q\n", keys)

	// 2. キーのソート (文字列)
	sort.Strings(keys)
	fmt.Printf("キー (ソート後): %q\n", keys)

	// 3. ソート済みキーで反復処理
	fmt.Println("\n--- キー順で表示 ---")
	for _, fruit := range keys {
		fmt.Printf("%s: %d\n", fruit, stock[fruit]) // キーを使ってマップの値を取得
	}
}

```

## 解説
```text
マップの `for range` は反復順序が保証されません。
キーの順序（アルファベット順、数値順など）で
処理したい場合は、以下の手順で行います。

**手順:**
1.  **キーの抽出:** マップの全キーをスライスに抽出します。
    ```go
    keys := make([]keyType, 0, len(myMap))
    for k := range myMap {
        keys = append(keys, k)
    }
    ```
    (`make` で容量を指定すると効率的)
2.  **キーのソート:** 抽出したキースライスを `sort` パッケージで
    ソートします。
    *   文字列キー: `sort.Strings(keys)`
    *   整数キー: `sort.Ints(keys)`
    *   他: `sort.Float64s()`, `sort.Slice()` など
3.  **ソート済みキーで反復:** ソートされたキースライスで
    `for range` ループを実行し、そのキーを使って
    マップの値にアクセスします。
    ```go
    for _, key := range sortedKeys {
        value := myMap[key]
        // key と value を使った処理
    }
    ```

コード例では、`stock` マップのキー (`string`) を
`keys` スライスに抽出し、`sort.Strings()` でソート後、
その `keys` スライスでループしてキーと値を出力しています。
これにより、キーのアルファベット順で処理できます。

この「キー抽出→ソート→ループ」は、マップを
特定の順序で処理するための標準的なテクニックです。