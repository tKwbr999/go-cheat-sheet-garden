---
title: "インターフェースのベストプラクティス: 命名規則 (`-er` サフィックス)"
tags: ["interfaces", "interface", "ベストプラクティス", "命名規則", "-er"]
---

Goのインターフェース設計における慣習として、特に**単一のメソッド**だけを持つインターフェースの命名には**`-er` サフィックス**がよく使われます。

この命名規則については、**「基本」**セクションの**「インターフェースの命名: `-er` サフィックスの慣習」** (`000_basics/140_interface-naming--er-suffix.md`) で既に説明しました。

ここでは、その重要性を再確認します。

## `-er` サフィックスの重要性

*   **役割の明確化:** インターフェース名が `-er` で終わることで、そのインターフェースが「何をするものか」という役割や能力を表していることが一目でわかります。
*   **標準ライブラリとの一貫性:** `io.Reader`, `io.Writer`, `fmt.Stringer`, `http.Handler` など、Goの標準ライブラリで広く使われている命名規則であり、これに従うことでコードの一貫性が保たれ、他の Go プログラマにとって理解しやすくなります。
*   **小さなインターフェースの推奨:** この命名規則は、必然的に単一メソッドのインターフェースに対して適用されるため、「インターフェースを小さく保つ」というベストプラクティスとも関連しています。

## 例 (再掲)

```go
// データを読み取る能力を表す
type Reader interface {
    Read(p []byte) (n int, err error)
}

// データを書き込む能力を表す
type Writer interface {
    Write(p []byte) (n int, err error)
}

// 文字列として表現する能力を表す
type Stringer interface {
    String() string
}

// HTTPリクエストを処理する能力を表す
type Handler interface {
    ServeHTTP(w http.ResponseWriter, r *http.Request)
}

// リソースを閉じる能力を表す
type Closer interface {
    Close() error
}
```

インターフェースを定義する際には、特にメソッドが一つだけの場合は、この `-er` サフィックスによる命名規則を適用することを検討しましょう。