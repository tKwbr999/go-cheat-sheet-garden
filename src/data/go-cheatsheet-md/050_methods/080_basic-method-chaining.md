## タイトル
title: メソッド: メソッドチェーン (Method Chaining)

## タグ
tags: ["methods", "メソッドチェーン", "流暢なインターフェース", "ビルダーパターン", "ポインタレシーバ"]

## コード
```go
package main

import "fmt"

type StringBuilder struct {
	buffer []byte
}

// Append は *StringBuilder を返し、チェーンを可能にする
func (sb *StringBuilder) Append(s string) *StringBuilder {
	if sb == nil { return nil }
	sb.buffer = append(sb.buffer, s...)
	return sb // レシーバ自身を返す
}

// String は最終結果を返す (チェーンの最後)
func (sb *StringBuilder) String() string {
	if sb == nil { return "" }
	return string(sb.buffer)
}

func main() {
	builder := &StringBuilder{} // ポインタで作成

	// メソッド呼び出しを . で繋げる
	result := builder.Append("Hello").Append(", ").Append("World!").String()

	fmt.Println(result) // Hello, World!
}

```

## 解説
```text
メソッド呼び出しを `.` で繋げて流れるように記述するスタイルを
**メソッドチェーン (Method Chaining)** または
**流暢なインターフェース (Fluent Interface)** と呼びます。
一連の操作を直感的かつ簡潔に表現できます。

**実現方法:**
メソッドが処理後、**レシーバ自身（通常はそのポインタ）を
戻り値として返す**ように設計します。
```go
func (ptr *MyType) DoSomething() *MyType {
    // ptr に対する処理...
    return ptr // レシーバ自身を返す
}
```
戻り値に対してさらに `.` で次のメソッドを呼び出せます。

コード例の `StringBuilder` では、`Append` メソッドが
文字列を追加した後にレシーバ `sb` ( `*StringBuilder` ) を
返しています。これにより、
`builder.Append("Hello").Append(", ").Append("World!")`
のように呼び出しを繋げられます。
最後の `String` メソッドは最終結果 (`string`) を返すため、
チェーンはそこで終了します。

**(補足)** `AppendLine` のように、内部で他のチェーン可能な
メソッドを呼び出しつつ自身もレシーバを返すメソッドも作れます。
また、`NewStringBuilder` のようなコンストラクタ関数で
最初からポインタを返すとチェーンを始めやすくなります。

**利点:**
*   **可読性:** 一連の操作が流れとして読みやすい場合がある。
*   **記述量削減:** 同じ変数名を繰り返さなくて済む。

**注意点:**
*   **デバッグ:** 長いチェーンの途中で問題が起きると特定が難しい。
*   **乱用:** 過度なチェーンは逆に可読性を損なう。

メソッドチェーンは、特に**ビルダーパターン**や設定記述などで有効です。