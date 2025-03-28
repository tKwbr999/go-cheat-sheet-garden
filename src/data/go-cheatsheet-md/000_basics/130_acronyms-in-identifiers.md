---
title: "識別子内の頭字語: HTTP, URL, ID などの扱い方"
tags: ["basics", "命名規則", "頭字語", "キャメルケース"]
---

プログラムで使う名前（識別子）には、`HTTP` (HyperText Transfer Protocol), `URL` (Uniform Resource Locator), `ID` (Identifier), `API` (Application Programming Interface), `JSON` (JavaScript Object Notation), `SQL` (Structured Query Language) のような**頭字語 (Acronym)** が含まれることがよくあります。

Go言語のコミュニティでは、これらの頭字語を識別子に含める際の慣習的なルールがあります。

## 頭字語の命名規則: 一貫性が重要

Goでは、識別子内の頭字語は、**一貫してすべて大文字**にするのが一般的です。例えば、`Url` や `Http` のように先頭だけ大文字にするのではなく、`URL` や `HTTP` のように全体を大文字で記述します。

これは、`urlId` や `httpApi` のように複数の頭字語が続く場合に、`UrlId` や `HttpApi` と書くよりも `URLID` や `HTTPAPI` と書く方が、単語の区切りが明確になりやすいという考え方に基づいています（ただし、すべて大文字が続くとかえって読みにくい場合もあるため、バランスも考慮されます）。

**重要なのは一貫性**です。プロジェクトやチーム内でルールを決めて、それに従うことが推奨されます。Goの標準パッケージでは、多くの場合、頭字語はすべて大文字で扱われています。

## エクスポートされる/されない場合

このルールは、識別子がエクスポートされる（公開、大文字始まり）か、されない（非公開、小文字始まり）かに関わらず適用されます。

*   **エクスポートされる場合 (大文字始まり):** 頭字語も大文字のままです。
    *   例: `ServeHTTP`, `ParseURL`, `CustomerID`, `APIKey`
*   **エクスポートされない場合 (小文字始まり):** 識別子全体が小文字で始まるため、それに続く頭字語も**すべて小文字**にするのが一般的です。
    *   例: `serveHTTP`, `parseURL`, `customerID`, `apiKey`

## コード例

```go title="頭字語を含む識別子の例"
package main

import (
	"fmt"
	"strings" // 文字列操作パッケージ
)

// --- エクスポートされる識別子の例 (大文字始まり) ---

// HTTPリクエストを処理する関数 (よくあるパターン)
func ServeHTTP(/* 引数 */) {
	fmt.Println("Serving HTTP request...")
}

// URL文字列を解析する関数
func ParseURL(rawURL string) {
	fmt.Printf("Parsing URL: %s\n", rawURL)
}

// 顧客IDを表す型
type CustomerID string

// API設定を保持する構造体
type APIConfig struct {
	APIKey    string // APIキー (頭字語 + 通常の単語)
	EndpointURL string // エンドポイントURL
}

// --- エクスポートされない識別子の例 (小文字始まり) ---

// 内部で使うHTTPクライアント
var httpClient = "Internal Client" // 例として文字列

// 内部で使うユーザーID
const defaultUserID CustomerID = "user-001"

// 内部で使うURLを組み立てる関数
func buildURL(path string) string {
	baseURL := "https://example.com/api/"
	return baseURL + path
}

func main() {
	// 公開関数の呼び出し
	ServeHTTP()
	ParseURL("https://example.com")

	// 公開型の利用
	var userID CustomerID = "cust-12345"
	fmt.Printf("Customer ID: %s (Type: %T)\n", userID, userID)

	config := APIConfig{
		APIKey:    "xyz789",
		EndpointURL: buildURL("users"), // 非公開関数を内部的に利用
	}
	fmt.Printf("API Key: %s\n", config.APIKey)
	fmt.Printf("Endpoint URL: %s\n", config.EndpointURL)

	// 非公開変数の利用 (同じパッケージ内なので可能)
	fmt.Println("Default User ID:", defaultUserID)
	fmt.Println("Internal HTTP Client:", httpClient)

	// よくある間違い (避けるべき例)
	// func ServeHttp() {} // "Http" ではなく "HTTP"
	// func ParseUrl() {}  // "Url" ではなく "URL"
	// var customerId string // "Id" ではなく "ID" (公開する場合) or "customerID" (非公開の場合)
}

/* 実行結果:
Serving HTTP request...
Parsing URL: https://example.com
Customer ID: cust-12345 (Type: main.CustomerID)
API Key: xyz789
Endpoint URL: https://example.com/api/users
Default User ID: user-001
Internal HTTP Client: Internal Client
*/
```

**ポイント:**

*   `ServeHTTP`, `ParseURL`, `CustomerID`, `APIKey`, `EndpointURL` はエクスポートされるため、頭字語部分 (`HTTP`, `URL`, `ID`, `API`) はすべて大文字です。
*   `httpClient`, `defaultUserID`, `buildURL` はエクスポートされないため、識別子全体が小文字で始まります。`defaultUserID` のように型名 (`CustomerID`) が大文字始まりでも、変数名自体は小文字で始まります。
*   `APIConfig` のように頭字語で始まる型名も、ルールに従って `API` を大文字にします。

この慣習に従うことで、Goコミュニティの他のメンバーが書いたコードとの一貫性が保たれ、コードが読みやすくなります。