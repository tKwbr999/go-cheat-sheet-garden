## タイトル
title: ベンチマーク関数 (Benchmark Functions)

## タグ
tags: ["references", "testing", "benchmark", "go test -bench", "performance", "b.N"]

## コード
```go
// テスト対象のコード (例: stringutil/join.go)
package stringutil

import "strings"

// JoinWithPlus は + 演算子で文字列を結合します。
func JoinWithPlus(strs []string) string {
	result := ""
	for _, s := range strs {
		result += s // + 演算子は毎回新しい文字列を生成するため非効率な場合がある
	}
	return result
}

// JoinWithBuilder は strings.Builder で文字列を結合します。
func JoinWithBuilder(strs []string) string {
	var sb strings.Builder
	for _, s := range strs {
		sb.WriteString(s) // Builder は効率的にメモリを管理
	}
	return sb.String()
}
```

## 解説
```text
Goの `testing` パッケージは、ユニットテストだけでなく、コードの**パフォーマンスを測定**するための**ベンチマークテスト**の機能も提供しています。ベンチマークテストを使うことで、特定の関数の実行時間を計測し、最適化の効果を確認したり、異なる実装のパフォーマンスを比較したりすることができます。

## ベンチマークファイルの規約

*   ベンチマーク関数も、通常のテスト関数と同様に **`_test.go`** ファイル内に記述します。
*   `testing` パッケージをインポートします (`import "testing"`)。

## ベンチマーク関数の規約

*   関数名は **`Benchmark`** で始まり、その後に続く名前の最初の文字は**大文字**である必要があります（例: `BenchmarkMyFunction`, `BenchmarkCalculateFibonacci`）。
*   関数は **`*testing.B` 型の引数を一つだけ**受け取ります。この `b` パメータは、ベンチマークの実行を制御するためのフィールドやメソッドを提供します。
*   戻り値はありません。

**シグネチャ:** `func BenchmarkXxx(b *testing.B) { ... }`

## ベンチマークの実行ループ: `b.N`

*   ベンチマーク関数の主な役割は、測定対象のコードを**繰り返し実行**することです。
*   `*testing.B` 型のフィールド **`N`** は、テストフレームワークが**自動的に決定する反復回数**を表します。ベンチマーク関数内の `for` ループは、`i := 0; i < b.N; i++` のように、`b.N` 回繰り返すように記述します。
*   `go test -bench` コマンドは、測定対象のコードが安定した実行時間を示すまで `b.N` の値を増やしながらベンチマーク関数を複数回実行し、1操作あたりの平均実行時間などを算出します。

## ベンチマークの実行: `go test -bench`

ベンチマークテストを実行するには、`go test` コマンドに **`-bench`** フラグを付けて実行します。

*   **`go test -bench=. [パッケージ]`**: 指定したパッケージ内のすべてのベンチマーク関数を実行します (`.` はすべてのベンチマークにマッチする正規表現)。
*   **`go test -bench=BenchmarkMyFunction [パッケージ]`**: 特定のベンチマーク関数のみを実行します。
*   **`go test -bench=. -benchmem`**: `-benchmem` フラグを付けると、1操作あたりのメモリ割り当て回数と割り当てバイト数も表示されます。
*   **`go test -bench=. -count=5`**: `-count` フラグで各ベンチマークの実行回数を指定できます。

## ベンチマークコード例

簡単な文字列結合関数のベンチマーク例です。

**ベンチマークコード (`stringutil/join_test.go` - 例):**
```go
package stringutil_test

import (
	"testing" // testing パッケージをインポート

	"myproject/stringutil" // テスト対象パッケージ (パスは例)
)

var testStrings = []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}

// JoinWithPlus 関数のベンチマーク
func BenchmarkJoinWithPlus(b *testing.B) {
	// ベンチマークのセットアップ (測定対象外)
	// b.ResetTimer() // もしセットアップに時間がかかる場合はタイマーをリセット

	// ★ b.N 回ループして測定対象の関数を呼び出す ★
	for i := 0; i < b.N; i++ {
		stringutil.JoinWithPlus(testStrings)
	}
}

// JoinWithBuilder 関数のベンチマーク
func BenchmarkJoinWithBuilder(b *testing.B) {
	// b.StopTimer() // 測定を一時停止する場合
	// ... セットアップ処理 ...
	// b.StartTimer() // 測定を再開する場合

	for i := 0; i < b.N; i++ {
		stringutil.JoinWithBuilder(testStrings)
	}
}

/*
ベンチマーク実行コマンド: go test -bench=. ./... または go test -bench=. myproject/stringutil

実行結果の例 (環境によって数値は大きく異なります):
goos: darwin
goarch: amd64
pkg: myproject/stringutil
cpu: Intel(R) Core(TM) i7-XXXX CPU @ X.XXGHz
BenchmarkJoinWithPlus-8        	 6046938	       195.3 ns/op	     184 B/op	       9 allocs/op
BenchmarkJoinWithBuilder-8     	29108478	       41.37 ns/op	      80 B/op	       2 allocs/op
PASS
ok  	myproject/stringutil	2.986s

解説:
- BenchmarkJoinWithPlus-8: ベンチマーク関数名と GOMAXPROCS (CPUコア数など)。
- 6046938: ベンチマークが実行された回数 (b.N の最終的な値に近い)。
- 195.3 ns/op: 1回の操作あたりの平均実行時間 (ナノ秒)。小さいほど速い。
- 184 B/op (-benchmem 付き): 1回の操作あたりの平均メモリ割り当て量 (バイト)。小さいほど効率が良い。
- 9 allocs/op (-benchmem 付き): 1回の操作あたりの平均メモリアロケーション回数。小さいほど効率が良い。

この結果から、JoinWithBuilder の方が JoinWithPlus よりも実行時間が短く、メモリ効率も良いことがわかります。
*/
```

**コード解説:**

*   `func BenchmarkJoinWithPlus(b *testing.B)` と `func BenchmarkJoinWithBuilder(b *testing.B)`: ベンチマーク関数を定義します。
*   `for i := 0; i < b.N; i++`: `b.N` 回のループ内で、測定対象の関数 `JoinWithPlus` または `JoinWithBuilder` を呼び出します。
*   **`b.ResetTimer()`, `b.StopTimer()`, `b.StartTimer()`**: ベンチマークの実行時間には含まれないセットアップ処理や後処理がある場合に、タイマーを制御するために使います（この例では使っていませんが、必要に応じて利用します）。

ベンチマークテストは、コードのパフォーマンスを定量的に評価し、改善するための重要なツールです。特に、パフォーマンスが重要な箇所や、複数の実装方法を比較検討する際に役立ちます。