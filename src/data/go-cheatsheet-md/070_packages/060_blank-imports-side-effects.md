---
title: "パッケージ: ブランクインポート (`_`) と副作用"
tags: ["packages", "package", "import", "ブランクインポート", "_", "副作用", "init"]
---

`import` 文には、エイリアスとして**ブランク識別子 (`_`)** を使う特殊な形式があります。これを**ブランクインポート (Blank Import)** と呼びます。

**構文:** `import _ "パッケージパス"`

## ブランクインポートの動作と目的

ブランクインポートされたパッケージは、そのパッケージ内の**エクスポートされた識別子（変数、関数、型など）を現在のパッケージから参照することはできません**。もし参照しようとするとコンパイルエラーになります。

では、なぜこのようなインポート方法が存在するのでしょうか？ その主な目的は、パッケージをインポートすることによる**副作用 (Side Effect)** を利用するためです。

Goでは、パッケージがインポートされる（またはプログラムが開始される）際に、そのパッケージ内で定義されている **`init` 関数**が自動的に実行されます（`init` 関数については後のセクションで詳しく説明します）。`init` 関数は、パッケージの初期化処理（例えば、何らかの内部状態の設定や、他のパッケージへの登録処理など）を行うために使われます。

ブランクインポートは、インポートしたパッケージの識別子を直接使う必要はないけれど、そのパッケージの **`init` 関数を実行させたい**場合に利用されます。

## 一般的な使用例

ブランクインポートは、以下のような場面でよく使われます。

1.  **データベースドライバの登録:** `database/sql` パッケージを使ってデータベースに接続する際、使用するデータベースの種類に応じたドライバパッケージをブランクインポートします。ドライバパッケージの `init` 関数が、自身を `database/sql` パッケージに登録する処理を行います。
    ```go
    import (
        "database/sql"
        _ "github.com/go-sql-driver/mysql" // MySQL ドライバの init() を実行して登録
        // _ "github.com/lib/pq" // PostgreSQL ドライバの場合
    )

    func main() {
        // sql.Open("mysql", ...) や sql.Open("postgres", ...) が使えるようになる
    }
    ```
2.  **画像フォーマットの登録:** `image` パッケージで様々な形式の画像ファイル（PNG, JPEG, GIFなど）をデコード（読み込み）できるようにするために、対応する画像フォーマットのパッケージをブランクインポートします。各フォーマットパッケージの `init` 関数が、自身を `image` パッケージに登録します。
    ```go
    import (
        "image"
        _ "image/png"  // PNG フォーマットを image パッケージに登録
        _ "image/jpeg" // JPEG フォーマットを image パッケージに登録
    )

    func main() {
        // image.Decode(...) が PNG や JPEG を扱えるようになる
    }
    ```
3.  **プロファイリングハンドラの有効化:** `net/http/pprof` パッケージをブランクインポートすると、その `init` 関数が Go プログラムのランタイムプロファイリング情報を提供する HTTP ハンドラをデフォルトの `http.ServeMux` に登録します。これにより、`http://localhost:ポート/debug/pprof/` のような URL にアクセスしてプロファイリング情報を取得できるようになります（別途 HTTP サーバーを起動する必要あり）。
    ```go
    import (
        "log"
        "net/http"
        _ "net/http/pprof" // pprof ハンドラを登録
    )

    func main() {
        // ... 他の HTTP ハンドラの設定など ...
        log.Println(http.ListenAndServe("localhost:6060", nil))
    }
    ```

## コード例: 画像フォーマット登録

```go title="ブランクインポートによる画像フォーマット登録"
package main

import (
	"bytes"
	"fmt"
	"image"
	// ★ PNG フォーマットを扱えるようにするためにブランクインポート
	// この行がないと、image.Decode は PNG を認識できない
	_ "image/png"
	"os"
)

// 簡単な PNG データの例 (1x1 の透明ピクセル)
var pngData = []byte{
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
	0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
	0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
	0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
	0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
	0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
}

func main() {
	// バイトスライスから image.Image をデコード
	// _ "image/png" がインポートされているため、PNG 形式を認識できる
	img, formatName, err := image.Decode(bytes.NewReader(pngData))
	if err != nil {
		fmt.Fprintf(os.Stderr, "画像デコードエラー: %v\n", err)
		return
	}

	fmt.Printf("画像フォーマット: %s\n", formatName) // "png" と表示されるはず
	fmt.Printf("画像サイズ: %dx%d\n", img.Bounds().Dx(), img.Bounds().Dy())

	// もし import _ "image/png" がなければ、image.Decode はエラーを返す
	// (image: unknown format)
}

/* 実行結果:
画像フォーマット: png
画像サイズ: 1x1
*/
```

ブランクインポートは、パッケージの識別子を直接使わずに、そのパッケージが初期化時に行う処理（副作用）だけを利用したい場合に使う、Goの少し特殊ですが重要な機能です。