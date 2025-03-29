## タイトル
title: "ベストプラクティス: 継承よりコンポジションを優先する"

## タグ
tags: ["references", "best practice", "composition", "embedding", "struct", "継承", "コンポジション", "埋め込み"]

## コード
```go
package main

import "fmt"

// --- 埋め込まれる型: Logger ---
type Logger struct {
	Prefix string
}

// Logger のメソッド
func (l *Logger) Log(message string) {
	fmt.Printf("%s %s\n", l.Prefix, message)
}

// --- 埋め込む型: Server ---
type Server struct {
	Logger // ★ Logger 型を埋め込む ★
	Host   string
	Port   int
}

// Server 独自のメソッド
func (s *Server) Start() {
	// ★ 埋め込まれた Logger の Log メソッドを直接呼び出せる ★
	s.Log(fmt.Sprintf("サーバーを %s:%d で起動します...", s.Host, s.Port))
	// 実際のサーバー起動処理...
}

// --- 埋め込む型: AdvancedServer (Server を埋め込む) ---
type AdvancedServer struct {
	Server // ★ Server 型をさらに埋め込む ★
	TLS    bool
}

// AdvancedServer 独自のメソッド (Server のメソッドをオーバーライドも可能)
func (as *AdvancedServer) Start() {
	// 埋め込まれた Server の Log メソッドを呼び出す
	as.Log("AdvancedServer を起動します...") // Prefix は AdvancedServer.Server.Logger.Prefix が使われる
	if as.TLS {
		as.Log(fmt.Sprintf("TLS 有効 (%s:%d)", as.Host, as.Port))
	} else {
		as.Log(fmt.Sprintf("TLS 無効 (%s:%d)", as.Host, as.Port))
	}
	// 実際の起動処理...

	// もし Server の Start を呼び出したい場合は明示的に行う
	// as.Server.Start() // これは再帰呼び出しになるので注意！
}


func main() {
	// --- Server の使用 ---
	server := &Server{
		Host: "localhost",
		Port: 8080,
		// Logger フィールドはゼロ値 (Prefix="") で初期化される
	}
	// 埋め込まれた Logger のフィールドにアクセス
	server.Prefix = "[BasicServer]"
	// Server のメソッド呼び出し (内部で Logger.Log が呼ばれる)
	server.Start()
	// 埋め込まれた Logger のメソッドを直接呼び出し
	server.Log("BasicServer 処理完了")

	fmt.Println("---")

	// --- AdvancedServer の使用 ---
	advServer := &AdvancedServer{
		Server: Server{ // 埋め込む Server を初期化
			Host: "example.com",
			Port: 443,
			Logger: Logger{ // Logger も初期化
				Prefix: "[Advanced]",
			},
		},
		TLS: true,
	}
	// AdvancedServer の Start メソッド呼び出し
	advServer.Start()
	// 埋め込まれた Server からさらに埋め込まれた Logger のメソッドを呼び出し
	advServer.Log("AdvancedServer 処理完了") // as.Server.Logger.Log が呼ばれる
	// 埋め込まれた Server のフィールドにもアクセス可能
	fmt.Printf("AdvancedServer Host: %s\n", advServer.Host) // as.Server.Host と同じ
}

/* 実行結果:
[BasicServer] サーバーを localhost:8080 で起動します...
[BasicServer] BasicServer 処理完了
---
[Advanced] AdvancedServer を起動します...
[Advanced] TLS 有効 (example.com:443)
[Advanced] AdvancedServer 処理完了
AdvancedServer Host: example.com
*/
```

## 解説
```text
オブジェクト指向プログラミングに慣れていると、「継承 (Inheritance)」を使ってコードを再利用したり、is-a (〜は〜の一種である) 関係を表現したりすることがあります。しかし、Go言語には他の多くのオブジェクト指向言語に見られるような**クラス継承の仕組みがありません**。

その代わりに、Goでは**コンポジション (Composition)**、特に**構造体の埋め込み (Embedding)** を使うことが推奨されます。これは "has-a" (〜は〜を持つ) 関係を表現し、より柔軟で疎結合な設計を促進します。

## コンポジションと埋め込み

*   **コンポジション:** ある型が、別の型の値を**フィールドとして持つ**ことです。
    ```go
    type Engine struct { /* ... */ }
    type Car struct {
        engine Engine // Car は Engine を持つ (has-a)
        Wheels int
    }
    ```
*   **埋め込み (Embedding):** 構造体の中に、**フィールド名を指定せずに**別の型（構造体またはインターフェース）を記述することです。
    ```go
    type Logger struct { Prefix string }
    func (l *Logger) Log(msg string) { fmt.Printf("%s: %s\n", l.Prefix, msg) }

    type Server struct {
        Logger // ★ Logger 型を埋め込む ★
        Host   string
        Port   int
    }

    // 利用例
    s := Server{Host: "localhost", Port: 8080}
    s.Prefix = "[Server]" // 埋め込まれた Logger の Prefix フィールドにアクセス
    s.Log("サーバー起動")   // 埋め込まれた Logger の Log メソッドを呼び出し
    ```
    埋め込みを行うと、埋め込まれた型 (`Logger`) のフィールドやメソッドが、あたかも埋め込んだ側の型 (`Server`) 自身のフィールドやメソッドであるかのように**昇格 (promoted)** され、直接アクセスできるようになります。
    ただし、これはあくまで糖衣構文 (syntactic sugar) であり、内部的には `s.Logger.Prefix` や `s.Logger.Log(...)` のようにアクセスしています。

## なぜコンポジションが好まれるのか？

*   **柔軟性:** 継承はコンパイル時に親子関係を固定しますが、コンポジションは実行時に関係を構築・変更することも可能です（インターフェースを使う場合など）。
*   **疎結合:** 継承は親子クラス間で強い結合を生み出しがちですが、コンポジションはより緩やかな結合を保ちやすいです。埋め込みの場合でも、内部的にはフィールドアクセスなので、継承ほどの強い結合ではありません。
*   **明確性:** "has-a" 関係は "is-a" 関係よりも現実世界のモデリングにおいて自然で分かりやすいことが多いです。
*   **多重継承の問題回避:** 複雑なクラス階層や多重継承の問題（菱形継承問題など）を避けることができます。Goではインターフェースの多重実装は可能ですが、実装の継承はありません。

**コード解説 (メイン例):**

*   `Server` 構造体は `Logger` 型を埋め込んでいます。これにより、`Server` 型の変数 `server` から `server.Prefix` や `server.Log(...)` のように `Logger` のフィールドやメソッドに直接アクセスできます。
*   `Server` の `Start` メソッド内でも `s.Log(...)` のように `Logger` のメソッドを呼び出しています。
*   `AdvancedServer` は `Server` を埋め込んでおり、`Server` が持つフィールド (`Host`, `Port`) やメソッド (`Log`) がさらに昇格して `AdvancedServer` から直接アクセス可能になっています。
*   `AdvancedServer` は自身の `Start` メソッドを定義しており、埋め込まれた `Server` の `Start` メソッドとは独立しています（オーバーライドとは少し異なります）。

Goでは、このように型を埋め込むことで、他の型の機能を取り込み、コードの再利用性を高めることができます。これは継承よりも柔軟性が高く、Goらしい設計パターンの一つです。