---
title: "iota for Bit Flags" # タイトル内のダブルクォートをエスケープ
tags: ["basics"]
---

```go
// iota は新しい const ブロックでリセットされる
const (
// 1 (1 << 0)
  Readable = 1 << iota
// 2 (1 << 1)
  Writable
// 4 (1 << 2)
  Executable
  
  // パーミッションの組み合わせ
// 3
  ReadWrite = Readable | Writable
)
```