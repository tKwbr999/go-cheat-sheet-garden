---
title: "関数: 可変長引数 (スライス) の一部を渡す"
tags: ["functions", "func", "引数", "パラメータ", "可変長引数", "...", "スライス", "スライス操作"]
---

可変長引数として関数に渡された値は、関数内部ではスライスとして扱われます。このスライスに対して、さらに**スライス操作** (`[i:j]`) を行い、その一部分を別の可変長引数関数に渡すことも可能です。

## スライス操作のおさらい

スライス `s` に対して `s[i:j]` とすると、インデックス `i` から `j-1` までの要素を持つ新しいスライス（部分スライス）が得られます。

*   `s[i:]`: インデックス `i` から最後まで。
*   `s[:j]`: 最初からインデックス `j-1` まで。
*   `s[:]`: 全要素。

## 可変長引数スライスの一部を渡す

可変長引数として受け取ったスライスの一部を、別の可変長引数関数に渡すには、以下の手順で行います。

1.  受け取った可変長引数（スライス）に対して、スライス操作 (`[i:j]`) を行い、渡したい部分のスライスを取得します。
2.  その部分スライスを、呼び出す関数の可変長引数部分で `...` を付けて展開します。

```go title="可変長引数スライスの一部を渡す例"
package main

import (
	"fmt"
	"strings"
)

// 任意の個数の文字列を受け取り、スペースで連結する関数
func joinStrings(strs ...string) string {
	fmt.Printf("joinStrings に渡されたスライス: %v\n", strs)
	return strings.Join(strs, " ")
}

// 最初の文字列をタイトルとして、残りの文字列を本文として処理する関数
// body は []string として扱われる
func processDocument(title string, body ...string) {
	fmt.Printf("\n--- ドキュメント処理 ---\n")
	fmt.Printf("タイトル: %s\n", title)

	// body スライスが空でなければ処理
	if len(body) > 0 {
		// body スライス全体を joinStrings に渡す
		fullBody := joinStrings(body...) // body を展開
		fmt.Printf("本文全体: \"%s\"\n", fullBody)

		// body スライスの最初の2要素だけを joinStrings に渡す (要素数が足りれば)
		if len(body) >= 2 {
			firstTwo := joinStrings(body[:2]...) // body の 0番目から 1番目までをスライスし、展開
			fmt.Printf("本文冒頭2単語: \"%s\"\n", firstTwo)
		}

		// body スライスの2番目以降の要素を joinStrings に渡す (要素数が足りれば)
		if len(body) >= 2 {
			remaining := joinStrings(body[1:]...) // body の 1番目から最後までをスライスし、展開
			fmt.Printf("本文2単語目以降: \"%s\"\n", remaining)
		}
	} else {
		fmt.Println("本文はありません。")
	}
	fmt.Println("--------------------")
}

func main() {
	processDocument("レポート", "これは", "テスト", "です")
	processDocument("短いメモ", "重要")
	processDocument("タイトルのみ")
}

/* 実行結果:
--- ドキュメント処理 ---
タイトル: レポート
joinStrings に渡されたスライス: [これは テスト です]
本文全体: "これは テスト です"
joinStrings に渡されたスライス: [これは テスト]
本文冒頭2単語: "これは テスト"
joinStrings に渡されたスライス: [テスト です]
本文2単語目以降: "テスト です"
--------------------

--- ドキュメント処理 ---
タイトル: 短いメモ
joinStrings に渡されたスライス: [重要]
本文全体: "重要"
--------------------

--- ドキュメント処理 ---
タイトル: タイトルのみ
本文はありません。
--------------------
*/
```

**コード解説:**

*   `processDocument` 関数は、最初の引数 `title` を通常の `string` として受け取り、それ以降の引数を `body ...string` として可変長引数（内部では `[]string` スライス）で受け取ります。
*   `fullBody := joinStrings(body...)`: `body` スライス全体を `...` で展開して `joinStrings` 関数に渡しています。
*   `firstTwo := joinStrings(body[:2]...)`: `body` スライスに対して `[:2]` というスライス操作を行い、最初の2要素からなる新しいスライスを取得します。そして、その新しいスライスを `...` で展開して `joinStrings` 関数に渡しています。
*   `remaining := joinStrings(body[1:]...)`: `body` スライスに対して `[1:]` というスライス操作を行い、2番目以降の要素からなる新しいスライスを取得し、それを `...` で展開して `joinStrings` 関数に渡しています。

このように、可変長引数は関数内部ではスライスとして扱われるため、通常のスライス操作を適用し、その結果をさらに別の可変長引数関数に渡すといった柔軟な処理が可能です。