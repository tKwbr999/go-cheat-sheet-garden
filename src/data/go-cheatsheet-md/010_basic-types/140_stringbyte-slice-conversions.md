## タイトル
title: 文字列とバイトスライス (`[]byte`) の変換

## タグ
tags: ["basic-types", "型変換", "文字列", "string", "バイトスライス", "byte", "[]byte"]

## コード
```go
package main

import "fmt"

func main() {
	s := "Hello Go!"
	fmt.Printf("元の文字列: \"%s\" (%T)\n", s, s)

	// string から []byte へ変換
	byteSlice := []byte(s)
	fmt.Printf("変換後のバイトスライス: %v (%T)\n", byteSlice, byteSlice)

	fmt.Print("バイトスライスの各要素 (ASCII): ")
	for _, b := range byteSlice {
		fmt.Printf("%d ", b)
	}
	fmt.Println()

	// バイトスライスは変更可能
	if len(byteSlice) > 0 {
		byteSlice[0] = 'J' // 'H' (72) -> 'J' (74)
	}
	fmt.Printf("変更後のバイトスライス: %v\n", byteSlice)

	// 元の文字列 s は不変
	fmt.Printf("元の文字列は不変: \"%s\"\n", s)
}
```

## 解説
```text
文字列 (`string`) と**バイトスライス (`[]byte`)** は
密接に関連しており、相互変換がよく行われます。
*   `string`: **不変**なバイトシーケンス。
*   `[]byte`: **変更可能**なバイトシーケンス。

**`string` から `[]byte` へ: `[]byte(s)`**
文字列 `s` の内容 (バイトシーケンス) をコピーした
**新しいバイトスライス**を生成します。
生成されたバイトスライスは元の文字列とは独立しており、
コード例のように内容を変更できます (`byteSlice[0] = 'J'`)。
元の文字列 `s` は不変なので影響を受けません。

**`[]byte` から `string` へ: `string(b)`**
バイトスライス `b` の内容をコピーした
**新しい文字列**を生成します。
生成された文字列は不変です。元のバイトスライス `b` を
後から変更しても、作成された文字列には影響しません。

**なぜ変換が必要か？**
*   **データの読み書き:** ファイルやネットワーク I/O では
    データを `[]byte` で扱うことが多く、文字列として
    処理したい場合に `string()` で変換します。
    逆に文字列を書き込む際は `[]byte()` で変換します。
*   **文字列の部分的な変更:** 文字列は不変ですが、
    `[]byte` は変更可能です。文字列の一部を変更したい場合、
    `[]byte` に変換 → バイトを変更 → `string()` で
    文字列に戻す、という手順を踏むことがあります
    (UTF-8の扱いに注意)。

それぞれの特性 (不変性 vs 可変性) と、
変換時にデータコピーが発生することを理解しましょう。