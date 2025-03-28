---
title: "インターフェースのベストプラクティス: 小さく保つ (単一責任)"
tags: ["interfaces", "interface", "ベストプラクティス", "設計原則", "単一責任の原則"]
---

Goのインターフェースを効果的に使うための重要なベストプラクティスの一つは、**インターフェースを小さく保つ**ことです。理想的には、インターフェースは**一つのことだけ**をうまく行うように、**最小限のメソッド**だけを持つべきです。これは**単一責任の原則 (Single Responsibility Principle)** にも通じます。

## なぜインターフェースを小さく保つのか？

*   **実装しやすい:** 要求するメソッドが少ないほど、そのインターフェースを実装する具体的な型を作るのが容易になります。多くのメソッドを持つ巨大なインターフェースは、実装の負担が大きくなります。
*   **利用しやすい:** 関数などが引数としてインターフェースを受け取る場合、そのインターフェースが要求するメソッドが少ないほど、その関数が必要とする機能が明確になります。利用者は、関数が必要最低限の振る舞いだけを要求していることを理解しやすくなります。
*   **組み合わせやすい (コンポジション):** 小さなインターフェースは、インターフェースコンポジション（埋め込み）によって組み合わせやすく、より複雑な要求を持つインターフェースを柔軟に構築できます。
*   **疎結合:** 小さなインターフェースは、依存関係を最小限に抑え、システムの各部分をより疎結合にします。

## 良い例: `io.Reader` と `io.Writer`

標準ライブラリの `io` パッケージは、この原則の良いお手本です。

```go
// io.Reader: データを読み取るという単一の責任を持つ
type Reader interface {
	Read(p []byte) (n int, err error)
}

// io.Writer: データを書き込むという単一の責任を持つ
type Writer interface {
	Write(p []byte) (n int, err error)
}

// io.Closer: リソースを閉じるという単一の責任を持つ
type Closer interface {
	Close() error
}
```

これらの小さなインターフェースは、それぞれ明確な役割を持っています。そして、これらを組み合わせることで、より複雑なインターフェースが作られています。

```go
// io.ReadWriter: Reader と Writer の組み合わせ
type ReadWriter interface {
	Reader
	Writer
}

// io.ReadCloser: Reader と Closer の組み合わせ
type ReadCloser interface {
	Reader
	Closer
}

// io.WriteCloser: Writer と Closer の組み合わせ
type WriteCloser interface {
	Writer
	Closer
}

// io.ReadWriteCloser: Reader, Writer, Closer の組み合わせ
type ReadWriteCloser interface {
	Reader
	Writer
	Closer
}
```

## 悪い例: 大きすぎるインターフェース

もし `io` パッケージが以下のような巨大なインターフェースを一つだけ定義していたらどうでしょうか？

```go
// 悪い例: 大きすぎるインターフェース
type BadFile interface {
	Read(p []byte) (n int, err error)
	Write(p []byte) (n int, err error)
	Close() error
	Seek(offset int64, whence int) (int64, error)
	ReadByte() (byte, error)
	WriteByte(c byte) error
	// ... さらに多くのメソッド ...
}
```

*   この `BadFile` インターフェースを実装するのは大変です。すべてのメソッドを実装しなければなりません。
*   もし関数が「データを読み取るだけ」で良い場合でも、引数として `BadFile` を要求すると、その関数が必要以上に多くの機能を要求しているように見えてしまいます。`io.Reader` だけを受け取る方が、関数の意図が明確になります。
*   新しい型が `Read` と `Write` は実装できるけれど `Seek` は実装できない、という場合に、`BadFile` を満たすことができません。

## まとめ

Goでは、「大きいインターフェースよりも小さいインターフェースの方が良い」という考え方が一般的です。インターフェースを設計する際は、本当に必要な最小限のメソッドだけを含めるように心がけましょう。必要であれば、後からインターフェースコンポジションで組み合わせることができます。

**「インターフェースは、それを使う側（利用者）が必要とする振る舞いを定義する」**という視点も重要です。利用者が本当に必要とする最小限のメソッドセットをインターフェースとして定義することで、より柔軟で疎結合な設計が可能になります。（これは次のベストプラクティスにも繋がります。）