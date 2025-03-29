## タイトル
title: インターフェースのベストプラクティス: 命名規則 (`-er` サフィックス)

## タグ
tags: ["interfaces", "interface", "ベストプラクティス", "命名規則", "-er"]

## コード
```go
// 例: 標準ライブラリのインターフェース

// 読み取るもの
type Reader interface {
	Read(p []byte) (n int, err error)
}

// 書き込むもの
type Writer interface {
	Write(p []byte) (n int, err error)
}

// 文字列化するもの
type Stringer interface {
	String() string
}

// 閉じるもの
type Closer interface {
	Close() error
}

// HTTPリクエストを処理するもの
// type Handler interface { ServeHTTP(...) } // net/http

```

## 解説
```text
Goのインターフェース設計の慣習として、特に
**単一のメソッド**だけを持つインターフェースの命名には
**`-er` サフィックス**がよく使われます。
(例: メソッド名 `Read` -> インターフェース名 `Reader`)

**重要性:**
*   **役割の明確化:** `-er` で終わる名前は、そのインターフェースが
    「何をするものか」という役割や能力を表すことを示す。
*   **標準ライブラリとの一貫性:** `io.Reader`, `fmt.Stringer` など
    標準ライブラリで広く使われており、コードの理解を助ける。
*   **小さなインターフェース推奨:** この規則は単一メソッドに
    適用されるため、「インターフェースを小さく保つ」
    ベストプラクティスとも関連する。

コード例は標準ライブラリでよく使われる `-er` インターフェースです。

インターフェースを定義する際、特にメソッドが一つだけの場合は、
この `-er` サフィックスによる命名規則を適用することを検討しましょう。