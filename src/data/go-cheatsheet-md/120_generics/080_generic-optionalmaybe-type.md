## タイトル
title: ジェネリクス: Optional/Maybe 型パターン

## タグ
tags: ["generics", "ジェネリクス", "型パラメータ", "type parameter", "データ構造", "struct", "Optional", "Maybe", "nil", "ゼロ値"]

## コード
```go
package optional // (パッケージ名は例)

// Optional[T any]: T 型の値が存在するかもしれないことを示す型
type Optional[T any] struct {
	value T    // 値 (存在しない場合はゼロ値)
	valid bool // 値が有効か (存在するか)
}

// Some: 値が存在する Optional を作成
func Some[T any](value T) Optional[T] {
	return Optional[T]{value: value, valid: true}
}

// None: 値が存在しない Optional を作成
func None[T any]() Optional[T] {
	return Optional[T]{valid: false} // value は T のゼロ値
}

// IsPresent: 値が存在するかどうか
func (o Optional[T]) IsPresent() bool {
	return o.valid
}

// Get: 値と存在有無 (bool) を返す (マップのカンマOK風)
func (o Optional[T]) Get() (T, bool) {
	return o.value, o.valid
}

// (IsEmpty, OrElse などのヘルパーメソッドも追加可能)

```

## 解説
```text
関数が値を返す際、その値が**存在する場合**と**存在しない場合**を
明確に示したいことがあります (例: マップ検索)。

Goでは複数戻り値 (`value, ok := ...`) が一般的ですが、
他の言語で見られる **Optional** / **Maybe** パターンを
ジェネリクスで実装することも可能です。
値の有無と値自体を一つの型でカプセル化します。

**実装:**
*   ジェネリック構造体 `Optional[T any]` を定義。
*   内部に値 `value T` と有効フラグ `valid bool` を持つ。
*   `Some(value T)`: 値を持つ Optional (`valid=true`) を作成。
*   `None[T any]()`: 値を持たない Optional (`valid=false`) を作成。
    (型パラメータ `T` の指定が必要)
*   `IsPresent()`, `Get()` 等のメソッドで値の有無確認や取得を行う。

コード例は `Optional[T]` 型とその基本的なコンストラクタ、
メソッドを示しています。

**使用例:**
```go
// import "myproject/optional"
func parseIntOptional(s string) optional.Optional[int] {
    val, err := strconv.Atoi(s)
    if err != nil { return optional.None[int]() }
    return optional.Some(val)
}

opt := parseIntOptional("123") // Some(123)
if val, ok := opt.Get(); ok {
    fmt.Println("Parsed:", val) // Parsed: 123
}

optNone := parseIntOptional("abc") // None[int]()
fmt.Println(optNone.IsPresent()) // false
fmt.Println(optNone.OrElse(0))   // 0 (デフォルト値)
```

ジェネリック Optional 型は、「値がない」状態を `nil` やゼロ値と
明確に区別したい場合や、メソッドチェーン等で役立つことがあります。
ただし、Go 標準のエラー処理やカンマOKイディオムで十分な場合も多いため、
状況に応じて使い分けることが重要です。