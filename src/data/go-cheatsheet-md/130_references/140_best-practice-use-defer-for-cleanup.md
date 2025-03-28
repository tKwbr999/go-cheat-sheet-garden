---
title: "Best Practice: Use defer for Cleanup" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// 6. クリーンアップに defer を使用する
f, err := os.Open(filename)
if err != nil {
  return err
}
// エラーパスでも常に閉じる
defer f.Close()
```