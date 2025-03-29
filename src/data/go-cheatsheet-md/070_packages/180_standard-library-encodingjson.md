## タイトル
title: 標準ライブラリ: `encoding/json` パッケージ (JSONの処理)

## タグ
tags: ["packages", "standard library", "encoding/json", "json", "マーシャリング", "アンマーシャリング", "エンコード", "デコード", "構造体タグ"]

## コード
```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

type Person struct {
	Name string `json:"name"`            // JSONキーは "name"
	Age  int    `json:"age,omitempty"` // キーは "age", ゼロ値なら省略
	City string `json:"city"`
	// secret string `json:"-"` // JSONに含めない
}

func main() {
	// 構造体を JSON にマーシャリング
	p1 := Person{Name: "Alice", Age: 30, City: "New York"}
	p2 := Person{Name: "Bob", City: "London"} // Age=0 なので省略される

	jsonData1, err := json.Marshal(p1)
	if err != nil { log.Fatal(err) }
	fmt.Printf("p1 JSON: %s\n", jsonData1) // {"name":"Alice","age":30,"city":"New York"}

	jsonData2, err := json.Marshal(p2)
	if err != nil { log.Fatal(err) }
	fmt.Printf("p2 JSON: %s\n", jsonData2) // {"name":"Bob","city":"London"}

	// マップを JSON にマーシャリング
	mapData := map[string]any{"id": 123, "active": true}
	jsonDataMap, err := json.Marshal(mapData)
	if err != nil { log.Fatal(err) }
	fmt.Printf("Map JSON: %s\n", jsonDataMap) // {"active":true,"id":123}
}

```

## 解説
```text
**`encoding/json`** パッケージは、Goのデータ構造と
JSONデータとの相互変換機能を提供します。
`import "encoding/json"` で利用します。

**主な操作:**
*   **マーシャリング (Marshal):** Goデータ構造 -> JSONバイト列 (`[]byte`)。
*   **アンマーシャリング (Unmarshal):** JSONバイト列 -> Goデータ構造。

**Go -> JSON: `json.Marshal()`**
`jsonData, err := json.Marshal(value)`
*   `value`: 変換したいGoの値 (struct, map, slice等)。
*   `jsonData`: JSON形式の `[]byte`。
*   `err`: エラー情報。

**構造体タグ (`json:"..."`):**
構造体フィールドにタグを付け、JSONでの挙動を制御できます。
*   `json:"fieldName"`: JSONキー名を指定。
*   `json:"fieldName,omitempty"`: フィールドがゼロ値ならJSONから省略。
*   `json:"-"`: JSONに含めない。
**注意:** JSONに含めるフィールドは**大文字始まり** (エクスポート可能) である必要があります。

コード例では `Person` 構造体にタグを付け、`omitempty` の効果も示しています。
マップもマーシャリング可能です。

**JSON -> Go: `json.Unmarshal()`**
`err := json.Unmarshal(jsonData, &targetValue)`
*   `jsonData`: 解析したいJSONデータ (`[]byte`)。
*   `targetValue`: デコード結果を格納するGoの値への**ポインタ**
    (例: `&myStruct`, `&myMap`)。**ポインタ渡しが必須**です。
*   JSONキーと構造体フィールド名(またはタグ名)が一致する
    フィールドに値が設定されます。
*   JSONにないフィールドはゼロ値のままです。
*   構造が不明なJSONは `map[string]any` や `any` に
    アンマーシャルできますが、アクセスには型アサーションが必要です。

`encoding/json` はWeb API連携や設定ファイル等で不可欠です。