---
title: "Table-Driven Tests" # タイトル内のダブルクォートをエスケープ
tags: ["references"]
---

```go
// テーブル駆動テスト
func TestAdd_Table(t *testing.T) {
	tests := []struct {
		name string
		a, b int
		want int
	}{
		{"positive", 2, 3, 5},
		{"negative", -1, -2, -3},
		{"mixed", -1, 5, 4},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := mypackage.Add(tt.a, tt.b)
			if got != tt.want {
				t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, got, tt.want)
			}
		})
	}
}
```