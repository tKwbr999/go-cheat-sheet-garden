---
title: "Atomic Pointers (Go 1.19+)" # タイトル内のダブルクォートをエスケープ
tags: ["concurrency"]
---

```go
// アトミックポインタ操作 (Go 1.19+)
import "sync/atomic"

type Config struct{ Version string }

var cfg atomic.Pointer[Config]

oldCfg := &Config{Version: "v1"}
newCfg := &Config{Version: "v2"}

cfg.Store(oldCfg)

loadedCfg := cfg.Load()
fmt.Println("Loaded Cfg:", loadedCfg.Version) // v1

swapped := cfg.CompareAndSwap(oldCfg, newCfg)
fmt.Println("Swapped Ptr:", swapped) // true
fmt.Println("Loaded Cfg:", cfg.Load().Version) // v2
```