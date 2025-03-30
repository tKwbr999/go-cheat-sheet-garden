## タイトル
title: 匿名構造体 (Anonymous Struct)

## タグ
tags: ["data-structures", "構造体", "struct", "匿名構造体", "リテラル"]

## コード
```go
package main

import "fmt"

func main() {
	// 匿名構造体の作成と初期化
	point := struct {
		X int
		Y int
	}{
		X: 10,
		Y: 20,
	}
	fmt.Printf("point: %+v (%T)\n", point, point)
	fmt.Printf("point.X = %d\n", point.X)

	// 匿名構造体のスライス
	users := []struct {
		ID   int
		Role string
	}{
		{1, "Admin"},
		{2, "Editor"},
	}
	fmt.Println("\n--- 匿名構造体スライス ---")
	for _, user := range users {
		fmt.Printf(" ID:%d, Role:%s\n", user.ID, user.Role)
	}
}

```

## 解説
```text
通常、構造体は `type` で名前を付けて定義しますが、
Goでは**名前を付けずに**その場で構造体を定義して使う
**匿名構造体 (Anonymous Struct)** も可能です。

**構文:**
```go
変数 := struct {
    フィールド名1 型1
    // ...
}{ // 定義直後に初期化リテラル
    フィールド名1: 値1,
    // ...
}
```
*   `struct { ... }`: `type` なしでフィールドを定義。
*   `{ ... }`: 直後にリテラルで初期化。フィールド名指定推奨。

コード例の `point` は `X`, `Y` フィールドを持つ匿名構造体です。
その型は `struct { X int; Y int }` となります。
フィールドアクセスは通常の構造体と同じです (`point.X`)。

匿名構造体のスライス (`users`) も作成できます。

**使い所:**
その場で一時的にデータをグループ化したい場合に便利です。
*   テストデータ
*   JSON/YAML 等の一時的なデータ構造
*   テーブル駆動テストの入力/期待値

**注意点:**
*   **再利用性低い:** 名前がないため、複数箇所での利用には不向き。
    その場合は `type` で名前付き構造体を定義すべきです。
*   **型の同一性:** フィールド構成が同じでも、異なる場所で
    定義された匿名構造体は、異なる型として扱われる場合があります。

一時的な利用には便利ですが、再利用性や型の明確さが
重要な場合は名前付き構造体を使いましょう。