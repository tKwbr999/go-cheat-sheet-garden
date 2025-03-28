---
title: "パッケージ: エイリアス付きインポート (別名)"
tags: ["packages", "package", "import", "エイリアス", "別名"]
---

パッケージをインポートする際、通常はそのパッケージパスの最後の要素がコード内で使うパッケージ名となります（例: `"math/rand"` なら `rand`）。しかし、場合によってはこのデフォルトのパッケージ名を変更したいことがあります。そのために使うのが**エイリアス付きインポート (Aliased Import)** です。

## エイリアス付きインポートの構文

`import` 文で、パッケージパスの前に**別名（エイリアス）**を指定します。

**構文:** `import エイリアス "パッケージパス"`

*   `エイリアス`: コード内でこのパッケージを参照する際に使う名前。
*   `"パッケージパス"`: インポートするパッケージのパス。

エイリアスを指定すると、コード内では元のパッケージ名ではなく、指定した**エイリアス名**を使ってそのパッケージの要素にアクセスします。

## なぜエイリアスを使うのか？

1.  **パッケージ名の衝突回避:** 異なるパスからインポートしたパッケージが、偶然同じ名前を持っている場合に、どちらか一方（または両方）に別名を付けて区別する必要があります。
    ```go
    import (
        "project/internal/auth" // 内部の auth パッケージ
        githubAuth "github.com/some/auth" // 外部ライブラリの auth パッケージ
    )
    ```
2.  **パッケージ名の短縮:** パッケージ名が長くて何度も入力するのが面倒な場合や、コードの可読性を上げるために、より短い別名を付けることがあります。
    ```go
    import fm "fmt" // fmt を fm として使う
    ```
3.  **慣習的なエイリアス:** 特定のパッケージには、コミュニティで慣習的に使われるエイリアスが存在する場合があります（ただし、乱用は避けるべきです）。

## コード例

```go title="エイリアス付きインポートの使用例"
package main

// 複数のパッケージをインポートし、一部にエイリアスを付ける
import (
	"fmt" // 通常のインポート
	// "math" パッケージを "m" というエイリアスでインポート
	m "math"
	// "crypto/rand" パッケージを "crand" というエイリアスでインポート
	// (標準の "math/rand" と区別するためなど)
	crand "crypto/rand"
	// "strings" パッケージはそのままインポート
	"strings"
)

func main() {
	// 通常のインポート ("fmt", "strings")
	fmt.Println(strings.ToUpper("hello"))

	// エイリアスを使ったアクセス ("math" -> "m")
	// math.Pi ではなく m.Pi でアクセスする
	fmt.Printf("円周率 (m.Pi): %f\n", m.Pi)
	fmt.Printf("平方根 (m.Sqrt): %f\n", m.Sqrt(2))

	// エイリアスを使ったアクセス ("crypto/rand" -> "crand")
	// crypto/rand パッケージの Reader 変数にアクセス
	// rand.Reader ではなく crand.Reader でアクセスする
	fmt.Printf("暗号論的乱数生成器 (crand.Reader): %T\n", crand.Reader)

	// エイリアス名で呼び出す必要がある
	// fmt.Println(math.Pi) // エラー: undefined: math
	// fmt.Println(rand.Reader) // エラー: undefined: rand (math/rand をインポートしていない場合)
}

/* 実行結果:
HELLO
円周率 (m.Pi): 3.141593
平方根 (m.Sqrt): 1.414214
暗号論的乱数生成器 (crand.Reader): *io.LimitedReader
*/
```

**コード解説:**

*   `import m "math"`: `math` パッケージをインポートし、コード内では `m` という名前で参照するように指定しています。そのため、`math.Pi` ではなく `m.Pi` と書く必要があります。
*   `import crand "crypto/rand"`: `crypto/rand` パッケージを `crand` という名前で参照するように指定しています。`crand.Reader` でアクセスします。
*   `fmt` と `strings` はエイリアスなしでインポートされているため、そのまま `fmt.Println` や `strings.ToUpper` のように使えます。

エイリアス付きインポートは、特にパッケージ名の衝突を避けるために必要な機能ですが、不必要に短いエイリアスを多用すると、かえってコードの可読性を損なう可能性もあるため、バランスを考えて使いましょう。