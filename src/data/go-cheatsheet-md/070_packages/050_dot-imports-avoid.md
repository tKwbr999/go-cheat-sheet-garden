---
title: "パッケージ: ドットインポート (`.`) - 非推奨"
tags: ["packages", "package", "import", "ドットインポート", "非推奨", "可読性"]
---

`import` 文には、エイリアスとしてドット (`.`) を使う特殊な形式があります。これを**ドットインポート (Dot Import)** と呼びます。

**構文:** `import . "パッケージパス"`

## ドットインポートの動作

ドットインポートを使うと、インポートしたパッケージの**エクスポートされた（大文字始まりの）識別子**（変数、定数、関数、型など）を、現在のパッケージ内で**パッケージ名を付けずに直接**参照できるようになります。あたかも、それらが現在のパッケージで直接定義されたかのように振る舞います。

```go title="ドットインポートの例 (非推奨)"
package main

import (
	// fmt パッケージをドットインポート
	// これにより、fmt.Println ではなく Println で呼び出せるようになる
	. "fmt"
	// math パッケージもドットインポート
	. "math"
)

// 現在のパッケージで定義された関数
func Println(a ...any) {
	// わざと fmt.Println と同じ名前の関数を定義してみる
	fmt.Println("これは main パッケージの Println です:", a)
}

func main() {
	// fmt.Println(...) と書かずに直接 Println を呼び出す
	// しかし、これは main パッケージの Println なのか、
	// ドットインポートされた fmt パッケージの Println なのか不明瞭
	Println("Hello") // main.Println が呼ばれる

	// math.Pi ではなく直接 Pi を参照
	// これは math パッケージの Pi 定数
	fmt.Printf("円周率: %f\n", Pi) // fmt.Printf は main.Println とは別

	// math.Sqrt ではなく直接 Sqrt を参照
	fmt.Printf("平方根: %f\n", Sqrt(2))

	// もし main パッケージにも Pi という変数が定義されていたら、
	// どちらの Pi が使われるか混乱を招く
	// var Pi = 999 // この行があると、上の fmt.Printf でどちらが使われるか？
}

/* 実行結果:
これは main パッケージの Println です: [Hello]
円周率: 3.141593
平方根: 1.414214
*/
```

## なぜドットインポートは非推奨なのか？

ドットインポートはコードを短く書けるように見えますが、一般的には**強く非推奨**とされています。その理由は以下の通りです。

1.  **可読性の低下:** `Println()` や `Pi` と書かれているだけでは、それが現在のパッケージで定義されたものなのか、それともドットインポートされた `fmt` や `math` パッケージのものなのか、コードを読んだだけでは判別しにくくなります。どのパッケージの機能を使っているのかを追跡するのが難しくなります。
2.  **名前空間の汚染:** インポートしたパッケージのすべての公開識別子が、現在のパッケージの名前空間に直接持ち込まれます。これにより、意図しない名前の衝突が発生するリスクが高まります。例えば、自分のパッケージで `Pi` という変数を定義しようとしたら、ドットインポートした `math` パッケージの `Pi` と衝突してしまいます。
3.  **保守性の低下:** 将来的にインポートしたパッケージが更新され、新しい識別子が追加された場合、それが現在のパッケージ内の既存の識別子と衝突する可能性があります。

## 例外的な利用: テストコード

ドットインポートが許容される、あるいは便利とされる稀なケースとして、**テストコード**（`_test.go` ファイル）があります。特に、`ginkgo` や `gomega` のような BDD (Behavior-Driven Development) スタイルのテストフレームワークでは、テストコードをより自然言語に近く記述するために、ドットインポートが慣習的に使われることがあります。

```go
// mypackage_test.go (テストファイル内での例)
package mypackage_test

import (
	"testing"
	. "github.com/onsi/ginkgo/v2" // Ginkgo をドットインポート
	. "github.com/onsi/gomega"    // Gomega をドットインポート
	"myproject/mypackage"        // テスト対象のパッケージ
)

func TestMyPackage(t *testing.T) {
	RegisterFailHandler(Fail) // Gomega の関数
	RunSpecs(t, "MyPackage Suite") // Ginkgo の関数
}

var _ = Describe("MyFunction", func() { // Ginkgo の関数
	It("should return correct value", func() { // Ginkgo の関数
		result := mypackage.MyFunction()
		Expect(result).To(Equal("expected")) // Gomega の関数
	})
})
```
この場合、`Describe`, `It`, `Expect`, `To`, `Equal` などが、パッケージ名を付けずに直接呼び出されています。テストコードという限定的な文脈で、テストの記述を簡潔にするために使われています。

## まとめ

ドットインポート (`import . "path"`) は、インポートしたパッケージの識別子を現在の名前空間に直接導入しますが、可読性や保守性の問題から**通常は避けるべき**です。パッケージ名 (`fmt.Println`) を明示的に書くことで、コードの明確さが保たれます。例外的に、特定のテストフレームワークなど、規約としてドットインポートが推奨されている場合にのみ、その規約に従って使用を検討します。