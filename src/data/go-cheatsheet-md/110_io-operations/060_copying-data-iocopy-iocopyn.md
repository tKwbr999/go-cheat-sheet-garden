---
title: "Copying Data (io.Copy, io.CopyN)" # タイトル内のダブルクォートをエスケープ
tags: ["io-operations"]
---

```go
// reader から writer へデータをコピー
nBytes, err := io.Copy(dstWriter, srcReader)
if err != nil { /* エラー処理 */
}

// バッファサイズ制限付きでコピー
nBytesLimited, err := io.CopyN(dstWriter, srcReader, 1024)
if err != nil && err != io.EOF { /* エラー処理 */
}
```