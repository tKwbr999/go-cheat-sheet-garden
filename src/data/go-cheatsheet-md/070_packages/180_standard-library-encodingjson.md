---
title: "標準ライブラリ: `encoding/json` パッケージ (JSONの処理)"
tags: ["packages", "standard library", "encoding/json", "json", "マーシャリング", "アンマーシャリング", "エンコード", "デコード", "構造体タグ"]
---

**JSON (JavaScript Object Notation)** は、軽量なデータ交換フォーマットとして、Web API や設定ファイルなど、様々な場面で広く使われています。Go言語の標準ライブラリ **`encoding/json`** パッケージは、Goのデータ構造とJSONデータとの間で相互に変換するための機能を提供します。

`import "encoding/json"` として利用します。

## 主な操作

*   **マーシャリング (Marshaling) / エンコード (Encoding):** Goのデータ構造（通常は構造体やマップ）をJSON形式のバイトデータ (`[]byte`) に変換します。
*   **アンマーシャリング (Unmarshaling) / デコード (Decoding):** JSON形式のバイトデータ (`[]byte`) をGoのデータ構造（通常は構造体やマップへのポインタ）に変換します。

## Goデータ構造 -> JSON: `json.Marshal()`

`json.Marshal()` 関数は、Goのデータ構造を受け取り、それをJSON形式のバイトスライス (`[]byte`) と `error` に変換します。

`func Marshal(v any) ([]byte, error)`

*   `v`: JSONに変換したいGoの値 (`any` なので任意の型を渡せるが、通常は構造体やマップ、スライスなどが使われる)。
*   戻り値: JSON形式のバイトスライスと、変換中に発生したエラー。

**構造体タグ (`json:"..."`):**
構造体のフィールドに**構造体タグ**を付けることで、JSONでのキー名をカスタマイズしたり、特定のオプションを指定したりできます。
`json:"fieldName"`: JSONでのキー名を `fieldName` にします。
`json:"fieldName,omitempty"`: フィールドの値がゼロ値の場合、JSON出力からそのフィールドを省略します。
`json:"-"`: このフィールドをJSONに含めません。

```go title="json.Marshal の例"
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

// Person 構造体 (JSON タグ付き)
type Person struct {
	// フィールド名は大文字 (エクスポートされる必要がある)
	Name string `json:"name"` // JSON では "name" というキーになる
	Age  int    `json:"age,omitempty"` // JSON では "age"、ゼロ値(0)なら省略
	City string `json:"city"`
	// email string `json:"-"` // タグに "-" を指定すると無視される
	secret string // 小文字なのでエクスポートされず、JSON に含まれない
}

func main() {
	// --- 構造体を JSON にマーシャリング ---
	p1 := Person{Name: "Alice", Age: 30, City: "New York", secret: "abc"}
	p2 := Person{Name: "Bob", City: "London"} // Age はゼロ値 (0)

	jsonData1, err1 := json.Marshal(p1)
	if err1 != nil {
		log.Fatalf("Marshal エラー (p1): %v", err1)
	}
	// jsonData1 は []byte 型
	fmt.Printf("p1 の JSON: %s\n", string(jsonData1)) // 文字列に変換して表示

	jsonData2, err2 := json.Marshal(p2)
	if err2 != nil {
		log.Fatalf("Marshal エラー (p2): %v", err2)
	}
	// p2 の Age は 0 なので "omitempty" により出力されない
	fmt.Printf("p2 の JSON: %s\n", string(jsonData2))

	// --- マップを JSON にマーシャリング ---
	mapData := map[string]any{
		"id":     123,
		"active": true,
		"tags":   []string{"go", "json"},
	}
	jsonDataMap, errMap := json.Marshal(mapData)
	if errMap != nil {
		log.Fatalf("Marshal エラー (map): %v", errMap)
	}
	fmt.Printf("マップの JSON: %s\n", string(jsonDataMap))
}

/* 実行結果 (マップのキーの順序は不定):
p1 の JSON: {"name":"Alice","age":30,"city":"New York"}
p2 の JSON: {"name":"Bob","city":"London"}
マップの JSON: {"active":true,"id":123,"tags":["go","json"]}
*/
```

## JSON -> Goデータ構造: `json.Unmarshal()`

`json.Unmarshal()` 関数は、JSON形式のバイトスライス (`[]byte`) を受け取り、それをGoのデータ構造（通常は構造体やマップへの**ポインタ**）にデコードします。

`func Unmarshal(data []byte, v any) error`

*   `data`: 解析したいJSONデータ (`[]byte`)。
*   `v`: デコード結果を格納するGoの値への**ポインタ** (`any` なので任意の型へのポインタを渡せるが、通常は構造体やマップへのポインタ）。JSONのキーと構造体のフィールド名（またはタグ名）が一致するフィールドに値が設定されます。
*   戻り値: デコード中に発生したエラー。

**重要:** `Unmarshal` の第二引数には、値を書き込む先の**ポインタ**を渡す必要があります。値そのものを渡すと、関数内でコピーが変更されるだけで、呼び出し元の値は変わりません。

```go title="json.Unmarshal の例"
package main

import (
	"encoding/json"
	"fmt"
	"log"
)

// Person 構造体 (Marshal の例と同じ)
type Person struct {
	Name string `json:"name"`
	Age  int    `json:"age,omitempty"`
	City string `json:"city"`
}

func main() {
	// --- JSON データを構造体にアンマーシャリング ---
	jsonStr1 := `{"name":"Alice","age":30,"city":"New York"}`
	jsonData1 := []byte(jsonStr1)

	var p1 Person // デコード結果を格納する変数 (ゼロ値)
	// ★ Unmarshal には p1 のポインタ (&p1) を渡す
	err1 := json.Unmarshal(jsonData1, &p1)
	if err1 != nil {
		log.Fatalf("Unmarshal エラー (p1): %v", err1)
	}
	fmt.Printf("デコード結果 p1: %+v\n", p1)

	// Age が省略された JSON
	jsonStr2 := `{"name":"Bob","city":"London"}`
	jsonData2 := []byte(jsonStr2)
	var p2 Person
	err2 := json.Unmarshal(jsonData2, &p2)
	if err2 != nil {
		log.Fatalf("Unmarshal エラー (p2): %v", err2)
	}
	// JSON に age がないので、p2.Age はゼロ値 (0) のまま
	fmt.Printf("デコード結果 p2: %+v\n", p2)

	// --- JSON データを map[string]any にアンマーシャリング ---
	// 構造が不明な場合に使う
	jsonStr3 := `{"id": 456, "status": "pending", "details": {"priority": 1}}`
	jsonData3 := []byte(jsonStr3)
	var data map[string]any // または var data any
	err3 := json.Unmarshal(jsonData3, &data)
	if err3 != nil {
		log.Fatalf("Unmarshal エラー (data): %v", err3)
	}
	fmt.Printf("デコード結果 data: %v\n", data)
	// 値にアクセスするには型アサーションが必要
	if id, ok := data["id"].(float64); ok { // JSON の数値は float64 になる
		fmt.Printf("ID: %d\n", int(id))
	}
}

/* 実行結果:
デコード結果 p1: {Name:Alice Age:30 City:New York}
デコード結果 p2: {Name:Bob Age:0 City:London}
デコード結果 data: map[details:map[priority:1] id:456 status:pending]
ID: 456
*/
```

`encoding/json` パッケージは、Web API との通信や設定ファイルの読み書きなど、現代的なアプリケーション開発において非常に重要な役割を果たします。構造体タグをうまく使うことで、Goのデータ構造とJSON表現を柔軟に対応付けることができます。