---
title: "Recover" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// Recover は panic をキャプチャし、通常の実行を再開する
// 遅延関数内でのみ有用
func SafeDivide(a, b int) (result int, err error) {
  // 回復を設定
  defer func() {
    if r := recover(); r != nil {
      // panic をエラーに変換
      err = fmt.Errorf("panic occurred: %v", r)
    }
  }()
  
  // b が 0 の場合、これは panic するが、recover がそれをキャッチする
  result = a / b
  return result, nil
}
```