---
title: "Benchmark Functions" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// ベンチマーク
func BenchmarkAdd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		mypackage.Add(2, 3)
	}
}
```