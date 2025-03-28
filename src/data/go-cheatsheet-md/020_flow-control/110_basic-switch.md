---
title: "Basic Switch" # タイトル内のダブルクォートをエスケープ
tags: ["flow-control"]
---

```go
// 基本的な switch (C/Java と異なり自動的なフォールスルーなし)
switch value {
case 1:
	// 1 の場合のコード
case 2, 3:
	// 2 または 3 の場合のコード
default:
	// デフォルトのコード
}
```