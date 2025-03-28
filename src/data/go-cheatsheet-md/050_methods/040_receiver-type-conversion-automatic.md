---
title: "Receiver Type Conversion (Automatic)" # タイトル内のダブルクォートをエスケープ
tags: ["methods"]
---

```go
// Go は自動的に変換を処理する:
rect := Rectangle{5, 10}
// 値に対してメソッドを呼び出す
area := rect.Area()

prect := &Rectangle{5, 10}
// Go は値メソッドを呼び出すためにポインタを自動的に逆参照する
area = prect.Area()

// しかし、ポインタレシーバを必要とするメソッドはアドレス可能な値に対してのみ機能する
// Go は自動的に rect へのポインタを取得する
rect.Resize(20, 30)
// エラー: 一時的な値のアドレスを取得できない
// Rectangle{5, 10}.Resize(20, 30)
```