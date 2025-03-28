---
title: "パッケージ: パッケージ変数 (Package Variables)"
tags: ["packages", "package", "変数", "var", "スコープ", "グローバル変数", "副作用"]
---

関数の中だけでなく、関数の**外側**（パッケージのトップレベル）で変数を宣言することもできます。これを**パッケージ変数 (Package Variable)** と呼びます。他の言語ではグローバル変数と呼ばれるものに似ています。

## パッケージ変数の宣言とスコープ

*   **宣言:** パッケージ変数は `var` キーワードを使って宣言します。関数外では `:=` による短縮宣言は使えません。
*   **スコープ:** パッケージ変数は、それが宣言された**パッケージ全体**からアクセス可能です。
    *   識別子が大文字で始まっていれば（例: `var ExportedVar int`）、他のパッケージからも `パッケージ名.変数名` の形でアクセスできます（エクスポートされる）。
    *   識別子が小文字で始まっていれば（例: `var internalVar string`）、そのパッケージ内部からのみアクセス可能です。
*   **初期化:** パッケージ変数は、プログラムの実行開始前に初期化されます。初期値を指定しない場合はゼロ値で初期化されます。初期値には定数だけでなく、関数呼び出しの結果なども使うことができます（ただし、初期化の順序には注意が必要です）。

```go title="パッケージ変数の宣言とアクセス"
// config パッケージ (例)
package config

import "fmt"

// --- パッケージ変数 ---

// DefaultPort: 公開されるパッケージ変数 (大文字始まり)
var DefaultPort int = 8080

// apiKey: パッケージ内部でのみ使われる非公開パッケージ変数 (小文字始まり)
var apiKey string = "initial-key" // ゼロ値ではない初期値

// accessCount: アクセスカウント (非公開)
var accessCount int // ゼロ値 (0) で初期化される

// --- 関数 ---

// GetAPIKey: 非公開の apiKey を取得する公開関数
func GetAPIKey() string {
	accessCount++ // パッケージ変数を変更
	fmt.Printf("  (GetAPIKey: apiKey アクセス %d 回目)\n", accessCount)
	return apiKey
}

// SetAPIKey: 非公開の apiKey を設定する公開関数
func SetAPIKey(newKey string) {
	fmt.Printf("  (SetAPIKey: apiKey を '%s' に変更)\n", newKey)
	apiKey = newKey // パッケージ変数を変更
}

// GetAccessCount: アクセスカウントを取得する公開関数
func GetAccessCount() int {
	return accessCount
}

// --- main パッケージ (別のパッケージ) ---
package main

import (
	"fmt"
	"myproject/config" // config パッケージをインポート (パスは例)
)

func main() {
	// --- 公開パッケージ変数へのアクセス ---
	fmt.Printf("デフォルトポート (config.DefaultPort): %d\n", config.DefaultPort)
	// config.DefaultPort = 9090 // 公開されていれば変更も可能

	// --- 非公開パッケージ変数へのアクセス (関数経由) ---
	key1 := config.GetAPIKey()
	fmt.Printf("現在の API キー: %s\n", key1)

	config.SetAPIKey("new-secret-key") // 関数経由で非公開変数を変更

	key2 := config.GetAPIKey()
	fmt.Printf("変更後の API キー: %s\n", key2)

	fmt.Printf("API キーへのアクセス回数: %d\n", config.GetAccessCount())

	// --- 非公開パッケージ変数への直接アクセスは不可 ---
	// fmt.Println(config.apiKey) // エラー: cannot refer to unexported name config.apiKey
	// config.accessCount = 0   // エラー: cannot refer to unexported name config.accessCount
}

/* 実行結果:
デフォルトポート (config.DefaultPort): 8080
  (GetAPIKey: apiKey アクセス 1 回目)
現在の API キー: initial-key
  (SetAPIKey: apiKey を 'new-secret-key' に変更)
  (GetAPIKey: apiKey アクセス 2 回目)
変更後の API キー: new-secret-key
API キーへのアクセス回数: 2
*/
```

**コード解説:**

*   `config` パッケージ内で、`DefaultPort` (公開) と `apiKey`, `accessCount` (非公開) というパッケージ変数が宣言されています。
*   `GetAPIKey`, `SetAPIKey`, `GetAccessCount` は、これらのパッケージ変数にアクセスしたり変更したりするための公開関数です。
*   `main` パッケージからは、公開されている `config.DefaultPort` には直接アクセスできますが、非公開の `apiKey` や `accessCount` には直接アクセスできず、`config` パッケージが提供する関数 (`GetAPIKey` など) を通じて間接的に操作する必要があります。

## パッケージ変数の注意点: グローバル状態の弊害

パッケージ変数は、そのパッケージ全体で共有される**グローバルな状態**を持つことになります。これは便利な場合もありますが、多くの問題を引き起こす可能性もあります。

*   **副作用:** パッケージ内のどの関数からでも（あるいは公開されていれば他のパッケージからでも）変更できてしまうため、どこで値が変更されたのか追跡するのが難しくなり、予期しない副作用を生む可能性があります。
*   **並行処理の問題:** 複数の Goroutine が同時に同じパッケージ変数を読み書きしようとすると、データ競合が発生する可能性があります。これを防ぐためには、ミューテックス (`sync.Mutex`) などを使った排他制御が必要になります。
*   **テストの難しさ:** パッケージ変数の状態に依存する関数は、テストごとに状態をリセットしたり、特定の状態を作り出したりするのが難しくなり、テストの独立性が損なわれることがあります。

**推奨:**

一般的に、**パッケージ変数（特に変更可能なもの）の使用は最小限に留める**ことが推奨されます。状態は、構造体のフィールドとしてカプセル化し、関数やメソッドの引数やレシーバとして渡す方が、コードの依存関係が明確になり、テストや並行処理も容易になります。

本当にグローバルな設定値や、パッケージ全体で共有されるシングルトン（ただし注意が必要）のような場合に限定して使用を検討しましょう。定数 (`const`) であれば、値が変更されないため、パッケージレベルで定義しても問題は起こりにくいです。