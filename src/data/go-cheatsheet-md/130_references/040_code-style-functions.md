## タイトル
title: 関数とメソッド (Functions and Methods)

## タグ
tags: ["references", "code style", "functions", "methods", "naming", "camel case", "error handling", "return values", "documentation"]

## コード
```go
// 同じ型の引数が続く場合は型をまとめることができる
func process(id int, name string, age int, city string) // OK
func process(id, age int, name, city string)       // より簡潔
```

## 解説
```text
関数とメソッドは Go プログラムの基本的な構成要素です。読みやすく、保守しやすいコードを書くために、以下のスタイルガイドラインに従うことが推奨されます。

## 名前付け

*   **キャメルケース (Camel Case / MixedCaps):** 関数名やメソッド名は、変数や定数と同様にキャメルケースを使います。アンダースコア (`_`) は通常使いません。
    *   良い例: `getUser`, `CalculateTotal`, `parseRequest`, `ConnectToDatabase`
    *   悪い例: `get_user`, `calculatetotal`, `Connect_To_Database`
*   **エクスポート:**
    *   パッケージ外に公開する関数やメソッドは、名前の最初の文字を**大文字**にします (例: `CalculateTotal`)。
    *   パッケージ内部でのみ使う関数やメソッドは、名前の最初の文字を**小文字**にします (例: `calculateSubtotal`)。
*   **明確かつ簡潔に:** 関数名やメソッド名は、その処理内容を明確に、かつ簡潔に表すようにします。動詞または動詞句で始めることが多いです (例: `GetUser`, `Save`, `Validate`)。

## 関数の責務と長さ

*   **単一責任の原則:** 一つの関数は、一つの明確な責務を持つように設計します。複数の異なる処理を一つの大きな関数に詰め込むのは避けましょう。
*   **短く保つ:** 関数はできるだけ短く、理解しやすい長さに保つように心がけます。数十行を超えるような長い関数は、より小さなヘルパー関数に分割することを検討します。

## 引数と戻り値

*   **引数の型:** （上記「コード」セクション参照）
*   **エラー処理:** エラーが発生する可能性のある関数は、通常、**最後の戻り値**として `error` 型を返します。成功した場合は `nil` を返します。
    ```go
    import "errors" // errors.New や fmt.Errorf を使う場合

    // User 型の定義 (例)
    type User struct {
        ID   int
        Name string
    }

    // センチネルエラーの例
    var ErrNotFound = errors.New("user not found")

    func FindUser(id int) (*User, error) {
        // ... ユーザーを探す処理 ...
        userNotFound := false // 仮のフラグ
        var user *User = nil // 仮のユーザーデータ

        if userNotFound {
            return nil, ErrNotFound // 結果のゼロ値とエラーを返す
        }
        // user = &User{ID: id, Name: "Taro"} // 成功した場合の例
        return user, nil // 結果と nil エラーを返す
    }
    ```
*   **名前付き戻り値:** 戻り値に名前を付けることができます。これにより、`return` 文で値を省略できたり (`naked return`)、`defer` から戻り値を変更できたりしますが、短い関数以外では可読性を損なう可能性があるため、**使いすぎに注意**が必要です。特に `naked return` は避けるのが一般的です。
    ```go
    import "os" // os.Open, f.Close を使う場合
    import "errors" // errors.New を使う場合

    // あまり推奨されない例 (naked return)
    func getLocation() (lat, lon float64, err error) {
        lat = 35.68
        lon = 139.76
        someError := false // 仮のフラグ
        if someError {
            err = errors.New("failed to get location")
            return // lat, lon, err が暗黙的に返される
        }
        return // lat, lon, err が暗黙的に返される
    }

    // defer で戻り値を変更する例 (080_error-handling/180 参照)
    func readFile(path string) (err error) {
        f, openErr := os.Open(path)
        if openErr != nil {
            return openErr // 開けなかった場合はそのエラーを返す
        }
        defer func() {
            closeErr := f.Close()
            if err == nil && closeErr != nil { // 元のエラーがなく、closeでエラーが発生した場合
                err = closeErr // closeのエラーを返す
            }
            // 元々 err があれば、closeErr は無視される（またはログに出力するなど）
        }()

        // ... ファイル f を使った処理 ...
        // もし処理中にエラーが発生したら err に代入する
        // err = someProcessingError

        return // err の最終的な値が返る
    }
    ```

## ドキュメンテーションコメント

*   **エクスポートされる関数/メソッド:** パッケージ外に公開されるすべての関数とメソッドには、その機能、引数、戻り値、特別な動作などを説明する**ドキュメンテーションコメント**を記述すべきです (`// FunctionName は ... を行います。`)。
*   **godoc:** これらのコメントは `go doc` コマンドや `pkg.go.dev` でドキュメントとして表示されます。

## スタイルガイドとツール

*   **Effective Go:** [https://go.dev/doc/effective_go](https://go.dev/doc/effective_go)
*   **`go fmt` / `gofmt`:** コードフォーマットを自動整形します。
*   **`go vet`:** 潜在的な問題を静的解析で検出します。
*   **リンター (Staticcheck など):** より詳細なスタイルチェックや問題検出を行います。

関数やメソッドを明確に、一貫したスタイルで記述することは、Go プログラム全体の品質を向上させる上で非常に重要です。