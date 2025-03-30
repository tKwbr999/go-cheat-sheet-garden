## タイトル
title: ディレクトリの作成 (`os.Mkdir`, `os.MkdirAll`)

## タグ
tags: ["io-operations", "os", "directory", "mkdir", "Mkdir", "MkdirAll", "ディレクトリ作成", "パーミッション", "IsExist"]

## コード
```go
package main

import (
	"fmt"
	"log"
	"os" // os.Mkdir, os.MkdirAll
)

func main() {
	// os.Mkdir: 単一ディレクトリ作成 (親が必要)
	dirName1 := "single_dir"
	err := os.Mkdir(dirName1, 0755) // パーミッション 0755
	if err != nil {
		log.Printf("Mkdir %s failed: %v", dirName1, err)
		// if os.IsExist(err) { /* 既に存在する場合の処理 */ }
	} else {
		fmt.Printf("'%s' created.\n", dirName1)
	}
	// os.Remove(dirName1) // 後片付け

	// os.Mkdir: 親がないとエラー
	// err = os.Mkdir("parent/child", 0755)
	// if err != nil { fmt.Println("Mkdir parent/child error:", err) }

	// os.MkdirAll: 親ディレクトリも含めて作成
	dirPathAll := "path/to/nested"
	err = os.MkdirAll(dirPathAll, 0755) // path, path/to も作成
	if err != nil {
		log.Printf("MkdirAll %s failed: %v", dirPathAll, err)
	} else {
		fmt.Printf("'%s' (and parents) created.\n", dirPathAll)
	}
	// os.RemoveAll("path") // 後片付け
}

```

## 解説
```text
ファイル作成前にディレクトリを作成する必要がある場合、
`os` パッケージの **`Mkdir`** と **`MkdirAll`** を使います。
`import "os"` で利用します。

**`os.Mkdir(name string, perm FileMode) error`**
*   指定名 `name` で**単一の**新しいディレクトリを作成。
*   `perm`: パーミッション (例: `0755`)。
*   **注意:** 親ディレクトリが存在しない場合や、`name` が
    既に存在する場合はエラーになる。

**`os.MkdirAll(path string, perm FileMode) error`**
*   指定パス `path` に必要な**すべての親ディレクトリを含めて**作成。
*   `perm`: 作成される全ディレクトリのパーミッション。
*   **利点:** 親が存在しなくても自動作成。`path` が既に存在しても
    (ディレクトリなら) エラーにならない。
*   通常、ディレクトリ構造を確実に作りたい場合はこちらが便利。

**エラーハンドリング: `os.IsExist()`**
`Mkdir` で「既に存在する」エラーを無視したい場合は、
`os.IsExist(err)` でエラーの種類を判別できます。

コード例では `Mkdir` で単一ディレクトリを作成し、
`MkdirAll` でネストしたディレクトリを作成しています。
`MkdirAll` は親ディレクトリがなくても成功し、
再度実行してもエラーにならない点が `Mkdir` と異なります。

**使い分け:**
*   単一ディレクトリ作成 (親の存在保証あり) -> `Mkdir`
*   ネストしたディレクトリ作成、存在してもOK -> **`MkdirAll`** (推奨)