## タイトル
title: パッケージ: パッケージ変数 (Package Variables)

## タグ
tags: ["packages", "package", "変数", "var", "スコープ", "グローバル変数", "副作用"]

## コード
```go
// config パッケージ (例)
package config

import "fmt"

// --- パッケージ変数 ---

// 公開されるパッケージ変数
var DefaultPort int = 8080

// 非公開パッケージ変数
var apiKey string = "initial-key"
var accessCount int // ゼロ値 0

// --- 関数 ---

// 非公開 apiKey を取得する公開関数
func GetAPIKey() string {
	accessCount++
	fmt.Printf("  (GetAPIKey: アクセス %d 回目)\n", accessCount)
	return apiKey
}

// 非公開 apiKey を設定する公開関数
func SetAPIKey(newKey string) {
	fmt.Printf("  (SetAPIKey: '%s' に変更)\n", newKey)
	apiKey = newKey
}

// アクセスカウントを取得する公開関数
func GetAccessCount() int {
	return accessCount
}

// --- main パッケージからの利用例 (解説参照) ---
// import "myproject/config"
// func main() {
//     fmt.Println(config.DefaultPort) // OK
//     key := config.GetAPIKey()      // OK
//     config.SetAPIKey("new")      // OK
//     // fmt.Println(config.apiKey) // エラー (非公開)
// }
```

## 解説
```text
関数外（パッケージのトップレベル）で宣言された変数を
**パッケージ変数**と呼びます (グローバル変数に類似)。

**宣言とスコープ:**
*   `var` キーワードで宣言 (`:=` は不可)。
*   パッケージ全体からアクセス可能。
*   **大文字**始まり: 他パッケージからもアクセス可能 (エクスポート)。
*   **小文字**始まり: パッケージ内部のみアクセス可能 (非公開)。
*   プログラム開始前に初期化される (指定なければゼロ値)。

コード例の `config` パッケージ:
*   `DefaultPort`: 公開パッケージ変数。
*   `apiKey`, `accessCount`: 非公開パッケージ変数。
*   `GetAPIKey`, `SetAPIKey`, `GetAccessCount`:
    非公開変数にアクセスするための公開関数 (アクセサ)。

他のパッケージ (例: `main`) からは、`config.DefaultPort` には
直接アクセスできますが、`config.apiKey` には直接アクセスできず、
`config.GetAPIKey()` 等の関数経由で操作します。

**注意点: グローバル状態の弊害**
パッケージ変数はパッケージ全体で共有される**グローバルな状態**となり、
問題を引き起こす可能性があります。
*   **副作用:** どこから変更されたか追跡困難。
*   **並行処理:** データ競合の可能性 (排他制御が必要)。
*   **テスト困難:** 状態依存でテストの独立性が損なわれる。

**推奨:**
**パッケージ変数（特に変更可能なもの）の使用は最小限に**。
状態は構造体フィールドでカプセル化し、関数やメソッドの
引数/レシーバとして渡す方が、依存関係が明確になり、
テストや並行処理も容易になります。
グローバル設定値やシングルトン等、限定的な使用に留めましょう。
(定数 `const` は変更不可なので問題になりにくい)