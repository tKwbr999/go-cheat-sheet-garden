---
title: "Timeout/Deadline in Database Operations" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

```go
// データベース操作での使用
ctxDb, cancelDb := context.WithTimeout(context.Background(), 1*time.Second)
defer cancelDb()

// db は *sql.DB
rows, err := db.QueryContext(ctxDb, "SELECT * FROM users WHERE id = ?", 1)
if err != nil {
	if errors.Is(err, context.DeadlineExceeded) {
		fmt.Println("Database query timed out")
	}
	// その他のエラー処理
}
if rows != nil {
	defer rows.Close()
}
```