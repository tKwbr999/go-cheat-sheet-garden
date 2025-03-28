---
title: "Unwrapping Multiple Errors (Go 1.20+)" # タイトル内のダブルクォートをエスケープ
tags: ["error-handling"]
---

```go
// 複数のエラーのアンラップ
err := validateForm(form)

// 特定のエラータイプをチェック
var nameErr *NameError // カスタムエラータイプと仮定
if errors.As(err, &nameErr) {
  // name エラーを処理
}

// 結合されたエラーの反復処理 (Go 1.20 では errors.Unwrap はこの目的には使用しない)
// 代わりに、errors.Join によって返されたエラーの Error() メソッドを確認する
if err != nil {
  fmt.Println("Validation errors:")
  // errors.Join は改行でエラーを結合する
  for _, line := range strings.Split(err.Error(), "\n") {
    fmt.Println("-", line)
  }
}
```