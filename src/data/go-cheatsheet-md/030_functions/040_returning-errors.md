## タイトル
title: エラーを返す (`error` 型)

## タグ
tags: ["functions", "func", "戻り値", "return", "エラー処理", "error", "nil", "errors", "fmt.Errorf"]

## コード
```go
package main

import (
	"fmt"
	"io"
	"os"
)

// ファイル内容 ([]byte) と エラー (error) を返す関数
func readFileContent(path string) ([]byte, error) {
	file, err := os.Open(path) // エラーの可能性
	if err != nil {
		// 失敗: 結果のゼロ値(nil)とエラーを返す
		return nil, fmt.Errorf("ファイル '%s' を開けません: %w", path, err)
	}
	defer file.Close() // 必ず閉じる

	data, err := io.ReadAll(file) // エラーの可能性
	if err != nil {
		// 失敗: 結果のゼロ値(nil)とエラーを返す
		return nil, fmt.Errorf("ファイル '%s' 読込失敗: %w", path, err)
	}

	// 成功: データと nil (エラーなし) を返す
	return data, nil
}

func main() {
	// テスト用ファイル作成 (エラー無視)
	_ = os.WriteFile("temp.txt", []byte("テスト"), 0644)
	defer os.Remove("temp.txt") // 終了時に削除

	// 成功例
	content, err := readFileContent("temp.txt")
	if err != nil { fmt.Println("エラー:", err) } else { fmt.Printf("成功: %s\n", string(content)) }

	// 失敗例
	_, err = readFileContent("not_exist.txt")
	if err != nil { fmt.Println("エラー:", err) }
}

```

## 解説
```text
Goには例外 (`try-catch`) はなく、エラー処理は
**`error` 型の値を返す**ことで行います。
「エラーは値である (Errors are values)」という考え方です。

**`error` 型:**
組み込みインターフェース型です。
```go
type error interface {
    Error() string
}
```
`Error() string` メソッドを持つ型は `error` を満たします。
このメソッドはエラーメッセージ文字列を返します。

関数は、成功時は `error` として **`nil`** を、
失敗時は `nil` でない `error` 値を返します。

**エラーの生成:**
*   `errors.New("メッセージ")`: 単純なエラーを作成。
*   `fmt.Errorf("書式 %v", 値)`: 書式付きエラーを作成。
    `%w` でエラーのラップも可能 (別記)。

**`(結果, error)` パターン:**
処理結果とエラーを返す関数の一般的な形式です。
最後の戻り値を `error` にします。
```go
func DoSomething() (ResultType, error) {
    if success {
        return result, nil // 成功: 結果と nil
    } else {
        // 失敗: 結果のゼロ値と error 値
        return zeroValue, errors.New("失敗")
    }
}
```

**呼び出し側の処理:**
関数呼び出し後、必ず `error` 値をチェックします。
```go
result, err := DoSomething()
if err != nil {
    // エラー処理
    log.Println("エラー:", err)
    return // または他の処理
}
// 成功時の処理 (result を使う)
fmt.Println("成功:", result)
```
コード例の `readFileContent` 関数と `main` 関数での
エラーチェックはこのパターンに従っています。

この `(結果, error)` と `if err != nil` の組み合わせは
Goにおけるエラー処理の基本であり非常に重要です。