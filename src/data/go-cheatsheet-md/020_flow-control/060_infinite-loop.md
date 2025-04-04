## タイトル
title: 無限ループ `for {}` と `break`

## タグ
tags: ["flow-control", "for", "無限ループ", "ループ", "繰り返し", "break"]

## コード
```go
package main

import "fmt"

func main() {
	count := 0
	fmt.Println("無限ループ開始 (5回で break)")

	for { // 条件式を省略すると無限ループ
		count++
		fmt.Printf("ループ %d 回目\n", count)

		if count >= 5 {
			fmt.Println("break します。")
			break // ループを終了
		}
	}

	fmt.Println("ループ終了。")
}
```

## 解説
```text
Goの `for` 文は条件式も省略できます。
条件式を省略すると**無限ループ**となり、
明示的に中断されるまで処理を繰り返します。

**構文:** `for { ... }`

**無限ループからの脱出: `break` 文**
無限ループは、通常ループ内部の特定の条件で
中断する必要があります。そのために **`break`** 文を使います。
`break` が実行されると、それが含まれる最も内側の
`for`, `switch`, `select` 文の実行を直ちに終了し、
そのループ等の次の処理に進みます。

コード例では `count >= 5` の条件が `true` になると
`break` が実行され、`for` ループが終了します。

**無限ループの用途:**
*   サーバープログラム (リクエスト待ち受け)
*   イベントループ (GUIなど)
*   バックグラウンドタスク

**注意点:**
無限ループを使う際は、必ずループから脱出する条件
(`break`, `return` 等) が存在することを確認します。
そうしないとプログラムが停止しなくなる可能性があります。