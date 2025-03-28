---
title: "Standard Library: net/http" # タイトル内のダブルクォートをエスケープ
tags: ["packages"]
---

```go
// HTTP
import "net/http"
http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
  fmt.Fprintf(w, "Hello")
})
http.ListenAndServe(":8080", nil)
```