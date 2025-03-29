## タイトル
title: パッケージ: ブランクインポート (`_`) と副作用

## タグ
tags: ["packages", "package", "import", "ブランクインポート", "_", "副作用", "init"]

## コード
```go
package main

import (
	"bytes"
	"fmt"
	"image"
	// ★ PNG フォーマットを扱えるようにブランクインポート
	// この行がないと image.Decode は PNG を認識できない
	_ "image/png"
	"os"
)

// 簡単な PNG データ (1x1 透明ピクセル)
var pngData = []byte{ /* ... (バイトデータは省略) ... */
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
	0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
	0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
	0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
	0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
	0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
}

func main() {
	// _ "image/png" がインポートされているため PNG を認識可能
	img, formatName, err := image.Decode(bytes.NewReader(pngData))
	if err != nil {
		fmt.Fprintf(os.Stderr, "デコードエラー: %v\n", err)
		return
	}
	fmt.Printf("フォーマット: %s, サイズ: %dx%d\n", formatName, img.Bounds().Dx(), img.Bounds().Dy())
}

```

## 解説
```text
`import` 文でエイリアスとして**ブランク識別子 (`_`)** を使う
特殊な形式を**ブランクインポート**と呼びます。

**構文:** `import _ "パッケージパス"`

**動作と目的:**
ブランクインポートされたパッケージの**識別子は参照できません**。
主な目的は、パッケージインポートによる**副作用**、
特にパッケージ内の **`init` 関数の実行**を利用することです。
`init` 関数はパッケージ初期化時に自動実行されます。

つまり、パッケージの関数などを直接使わないが、
そのパッケージが初期化時に行う処理（登録処理など）だけを
実行させたい場合にブランクインポートを使います。

**一般的な使用例:**
1.  **データベースドライバ登録:**
    ```go
    import _ "github.com/go-sql-driver/mysql"
    ```
    `mysql` ドライバの `init` が `database/sql` に自身を登録する。
2.  **画像フォーマット登録 (コード例):**
    ```go
    import _ "image/png"
    import _ "image/jpeg"
    ```
    各フォーマットの `init` が `image` パッケージに自身を登録し、
    `image.Decode` がその形式を扱えるようになる。
3.  **プロファイリングハンドラ有効化:**
    ```go
    import _ "net/http/pprof"
    ```
    `pprof` の `init` が HTTP ハンドラを登録する。

ブランクインポートは、パッケージの副作用（主に `init` 関数）のみを
利用するための Go の特殊な機能です。