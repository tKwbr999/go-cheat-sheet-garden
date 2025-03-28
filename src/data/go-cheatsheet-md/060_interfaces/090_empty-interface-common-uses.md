---
title: "Empty Interface Common Uses" # タイトル内のダブルクォートをエスケープ
tags: ["interfaces"]
---

```go
// 空インターフェースの一般的な使用法
// 1. fmt.Println は ...interface{} を取る
fmt.Println("value:", 42, true)

// 2. 混合型を保持するコンテナ
mixed := []interface{}{42, "hello", true}

// 3. 動的構造を持つ JSON のアンマーシャリング
var data interface{}
json.Unmarshal(jsonBytes, &data)
```