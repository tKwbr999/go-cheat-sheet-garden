## タイトル
title: "デザインパターン: 関数オプションパターン (Function Options Pattern)"

## タグ
tags: ["references", "design pattern", "function options", "constructor", "可読性", "柔軟性"]

## コード
```go
package main

import (
	"fmt"
	"time"
)

// --- 設定対象の構造体 ---
type Server struct {
	Addr    string        // 必須
	Timeout time.Duration // オプション (デフォルトあり)
	MaxConn int           // オプション (デフォルトあり)
	UseTLS  bool          // オプション (デフォルトあり)
	CertFile string       // TLS 用オプション
	KeyFile  string       // TLS 用オプション
}

// --- オプション関数の型 ---
type ServerOption func(*Server)

// --- オプション設定関数 ---

// WithTimeout はタイムアウトを設定するオプション関数を返す
func WithTimeout(timeout time.Duration) ServerOption {
	return func(s *Server) {
		s.Timeout = timeout
	}
}

// WithMaxConn は最大接続数を設定するオプション関数を返す
func WithMaxConn(maxConn int) ServerOption {
	return func(s *Server) {
		s.MaxConn = maxConn
	}
}

// WithTLS は TLS を有効にするオプション関数を返す
func WithTLS(certFile, keyFile string) ServerOption {
	return func(s *Server) {
		s.UseTLS = true
		s.CertFile = certFile
		s.KeyFile = keyFile
	}
}

// --- コンストラクタ ---
func NewServer(addr string, opts ...ServerOption) *Server {
	// 1. デフォルト値で Server を初期化
	server := &Server{
		Addr:    addr,
		Timeout: 30 * time.Second, // デフォルトタイムアウト
		MaxConn: 100,             // デフォルト最大接続数
		UseTLS:  false,            // デフォルトは TLS 無効
	}

	// 2. 渡されたオプションを適用
	fmt.Printf("Applying %d options...\n", len(opts))
	for _, opt := range opts {
		opt(server) // 各オプション関数を実行して server のフィールドを変更
	}

	// 3. 設定済みの Server を返す
	return server
}

func main() {
	// --- サーバーの生成 ---

	// 例1: デフォルト設定 + タイムアウトのみ変更
	fmt.Println("--- Server 1 ---")
	server1 := NewServer(":8080", WithTimeout(10*time.Second))
	fmt.Printf("Server 1 config: %+v\n", *server1)

	// 例2: TLS を有効化 (タイムアウトと最大接続数はデフォルト)
	fmt.Println("\n--- Server 2 ---")
	server2 := NewServer(":443", WithTLS("mycert.pem", "mykey.pem"))
	fmt.Printf("Server 2 config: %+v\n", *server2)

	// 例3: すべてのオプションを設定
	fmt.Println("\n--- Server 3 ---")
	server3 := NewServer("127.0.0.1:9000",
		WithTLS("cert.pem", "key.pem"), // 順番は任意
		WithMaxConn(500),
		WithTimeout(5*time.Second),
	)
	fmt.Printf("Server 3 config: %+v\n", *server3)

	// 例4: オプションなし (すべてデフォルト)
	fmt.Println("\n--- Server 4 ---")
	server4 := NewServer(":8888") // オプションを渡さない
	fmt.Printf("Server 4 config: %+v\n", *server4)
}

/* 実行結果:
--- Server 1 ---
Applying 1 options...
Server 1 config: {Addr::8080 Timeout:10s MaxConn:100 UseTLS:false CertFile: KeyFile:}

--- Server 2 ---
Applying 1 options...
Server 2 config: {Addr::443 Timeout:30s MaxConn:100 UseTLS:true CertFile:mycert.pem KeyFile:mykey.pem}

--- Server 3 ---
Applying 3 options...
Server 3 config: {Addr:127.0.0.1:9000 Timeout:5s MaxConn:500 UseTLS:true CertFile:cert.pem KeyFile:key.pem}

--- Server 4 ---
Applying 0 options...
Server 4 config: {Addr::8888 Timeout:30s MaxConn:100 UseTLS:false CertFile: KeyFile:}
*/
```

## 解説
```text
Goで構造体のインスタンスを生成する際、特にその構造体が多くの設定可能なフィールド（オプション）を持つ場合、コンストラクタ関数に多数の引数を渡す必要が出てきて、コードが読みにくくなったり、将来的なオプション追加が難しくなったりすることがあります。

このような問題を解決するための一般的なデザインパターンが**関数オプションパターン (Function Options Pattern)** です。これは、オプションを設定するための関数（オプション関数）を定義し、コンストラクタに可変長引数として渡す方法です。

## 関数オプションパターンの仕組み

1.  **オプション関数の型を定義:** オプションを設定したい対象の構造体（例: `*MyType`）へのポインタを引数に取り、戻り値のない関数型を定義します。
    ```go
    type Option func(*MyType)
    ```
2.  **オプション設定関数を作成:** 各オプションを設定するための具体的な関数を作成します。これらの関数は、上記で定義したオプション関数の型 (`Option`) を**返す**ようにします。通常、これらの関数は `WithXxx` という名前になります。
    ```go
    func WithFieldA(value int) Option {
        return func(mt *MyType) {
            mt.fieldA = value
        }
    }
    func WithFieldB(flag bool) Option {
        return func(mt *MyType) {
            mt.fieldB = flag
        }
    }
    ```
3.  **コンストラクタ関数を定義:** コンストラクタ関数は、必須の引数（もしあれば）に加えて、オプション関数のスライスを**可変長引数 (`...Option`)** として受け取ります。
    ```go
    func NewMyType(requiredArg string, opts ...Option) *MyType {
        // 1. デフォルト値でインスタンスを作成
        instance := &MyType{
            required: requiredArg,
            fieldA:   defaultValueA, // デフォルト値
            fieldB:   defaultValueB, // デフォルト値
        }
        // 2. 渡されたオプション関数を順番に適用
        for _, opt := range opts {
            opt(instance) // オプション関数を実行して instance を変更
        }
        // 3. 設定済みのインスタンスを返す
        return instance
    }
    ```
4.  **呼び出し:** コンストラクタを呼び出す際に、必須の引数の後に、設定したいオプションに対応する関数 (`WithFieldA(...)`, `WithFieldB(...)` など) を必要なだけカンマ区切りで渡します。

**コード解説 (メイン例):**

*   `ServerOption` 型が `func(*Server)` として定義されています。
*   `WithTimeout`, `WithMaxConn`, `WithTLS` は、それぞれ `Server` の対応するフィールドを変更するクロージャを `ServerOption` 型として返します。
*   `NewServer` は必須の `addr` と、可変長の `opts ...ServerOption` を受け取ります。
*   `NewServer` 内で、まずデフォルト値で `server` を初期化し、その後 `for _, opt := range opts { opt(server) }` で渡されたオプション関数を適用しています。
*   呼び出し側 (`main` 関数) では、`NewServer` の第二引数以降に、設定したいオプションに対応する `WithXxx` 関数を必要なだけ渡しています。渡す順番は関係ありません。

## 関数オプションパターンの利点

*   **可読性:** どのオプションが設定されているかが、コンストラクタ呼び出しを見るだけで明確になります (`NewServer(addr, WithTimeout(...), WithTLS(...))`)。
*   **柔軟性:** オプションの指定は任意であり、順番も問いません。必要なオプションだけを指定できます。
*   **拡張性:** 将来新しいオプションを追加する場合、新しい `WithYyy` 関数を追加するだけで済み、既存のコンストラクタのシグネチャを変更する必要がありません。
*   **ゼロ値との区別:** オプションが指定されなかった場合（デフォルト値が使われる）と、明示的にゼロ値を設定したい場合を区別できます（ただし、この例では示していません）。

関数オプションパターンは、多くのオプションを持つ構造体の初期化を扱うための、Goで非常に一般的で効果的な方法です。