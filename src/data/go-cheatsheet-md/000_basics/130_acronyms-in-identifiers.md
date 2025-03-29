## タイトル
title: 識別子内の頭字語: HTTP, URL, ID などの扱い方

## タグ
tags: ["basics", "命名規則", "頭字語", "キャメルケース"]

## コード
```go
package main

import "fmt"

// エクスポートされる例 (頭字語は大文字)
func ServeHTTP() { fmt.Println("ServeHTTP called") }
type CustomerID string
type APIConfig struct {
	APIKey    string
	EndpointURL string
}

// エクスポートされない例 (識別子全体が小文字始まり)
const defaultUserID CustomerID = "user-001"
func buildURL(path string) string { return "https://example.com/" + path }
// func serveHTTP() {} // もし非公開ならこう書く

func main() {
	ServeHTTP()
	var userID CustomerID = "cust-123"
	config := APIConfig{APIKey: "xyz", EndpointURL: buildURL("data")}
	fmt.Println(userID, config.APIKey, config.EndpointURL)
	fmt.Println(defaultUserID)
}

```

## 解説
```text
識別子に `HTTP`, `URL`, `ID`, `API` のような**頭字語 (Acronym)** が含まれる場合の命名規則です。

**Goの慣習:**
識別子内の頭字語は、**一貫してすべて大文字**にするのが一般的です (例: `URL`, `HTTP`)。`Url` や `Http` のようにはしません。重要なのは一貫性です。

**エクスポートされる/されない場合:**
*   **エクスポート (大文字始まり):** 頭字語も大文字のまま。
    例: `ServeHTTP`, `CustomerID`, `APIKey`, `EndpointURL`
*   **非エクスポート (小文字始まり):** 識別子全体が小文字で始まるため、それに続く頭字語も**すべて小文字**にするのが一般的。
    例: `serveHTTP`, `customerID`, `apiKey`

コード例では、公開される識別子で頭字語が大文字 (`ServeHTTP`, `APIKey` 等) になっています。非公開の `defaultUserID` や `buildURL` は識別子全体が小文字始まりです。

この慣習に従うことで、Goコミュニティのコードとの一貫性が保たれ、読みやすくなります。