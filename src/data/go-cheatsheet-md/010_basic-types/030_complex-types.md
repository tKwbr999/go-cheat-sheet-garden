---
title: "基本の型: 複素数 (Complex)"
tags: ["basic-types", "複素数", "complex64", "complex128"]
---

Go言語は、数学や科学技術計算などで使われる**複素数 (Complex Number)** を扱うための型も標準でサポートしています。

## 複素数型とは？

複素数は、**実部 (Real Part)** と**虚部 (Imaginary Part)** の二つの要素で構成される数です。一般的に `a + bi` の形で表されます。ここで `a` が実部、`b` が虚部、`i` は虚数単位（`i² = -1` となる数）です。

Go言語には、複素数を表現するための2つの型があります。

## Goの複素数型: `complex64` と `complex128`

*   **`complex64`**: 実部と虚部がそれぞれ `float32` で構成される複素数型 (32 + 32 = 64ビット)。
*   **`complex128`**: 実部と虚部がそれぞれ `float64` で構成される複素数型 (64 + 64 = 128ビット)。Go言語では、**複素数リテラル（例: `1 + 2i`）は、デフォルトで `complex128` 型**として扱われます。浮動小数点数と同様に、通常はこちらを使うのが一般的です。

```go title="複素数型の宣言と演算例"
package main

import (
	"fmt"
	"math/cmplx" // 複素数関連の数学関数を含むパッケージ
)

func main() {
	// complex128 型 (デフォルト)
	// リテラルで生成 (実部 + 虚部i)
	var c1 complex128 = 1.5 + 2.5i
	c2 := 3 + 4i // 型推論により complex128 になる

	// complex() 関数で生成 (complex(実部, 虚部))
	c3 := complex(0.5, -1.2) // complex128

	fmt.Printf("c1 (complex128): %v, 型: %T\n", c1, c1)
	fmt.Printf("c2 (complex128): %v\n", c2)
	fmt.Printf("c3 (complex128): %v\n", c3)

	// 複素数の演算
	addResult := c1 + c2 // 加算: (1.5+3) + (2.5+4)i = 4.5 + 6.5i
	subResult := c1 - c2 // 減算: (1.5-3) + (2.5-4)i = -1.5 - 1.5i
	mulResult := c1 * c2 // 乗算: (1.5*3 - 2.5*4) + (1.5*4 + 2.5*3)i = (4.5-10) + (6+7.5)i = -5.5 + 13.5i
	divResult := c1 / c2 // 除算

	fmt.Printf("c1 + c2 = %v\n", addResult)
	fmt.Printf("c1 - c2 = %v\n", subResult)
	fmt.Printf("c1 * c2 = %v\n", mulResult)
	fmt.Printf("c1 / c2 = %v\n", divResult)

	// 実部と虚部を取り出す
	fmt.Printf("c1の実部: %f\n", real(c1)) // real() 組込み関数
	fmt.Printf("c1の虚部: %f\n", imag(c1)) // imag() 組込み関数

	// math/cmplx パッケージの関数例
	fmt.Printf("c2の絶対値: %f\n", cmplx.Abs(c2)) // sqrt(3^2 + 4^2) = 5
	fmt.Printf("c1の位相(ラジアン): %f\n", cmplx.Phase(c1))

	fmt.Println() // 空行

	// complex64 型
	var c64_1 complex64 = complex(1, 2) // 実部・虚部ともに float32
	var c64_2 complex64 = 0.5 + 1.5i
	fmt.Printf("c64_1 (complex64): %v, 型: %T\n", c64_1, c64_1)
	fmt.Printf("c64_2 (complex64): %v\n", c64_2)
	fmt.Printf("c64_1 + c64_2 = %v\n", c64_1+c64_2)
}

/* 実行結果:
c1 (complex128): (1.5+2.5i), 型: complex128
c2 (complex128): (3+4i)
c3 (complex128): (0.5-1.2i)
c1 + c2 = (4.5+6.5i)
c1 - c2 = (-1.5-1.5i)
c1 * c2 = (-5.5+13.5i)
c1 / c2 = (0.62+0.04i)
c1の実部: 1.500000
c1の虚部: 2.500000
c2の絶対値: 5.000000
c1の位相(ラジアン): 1.030377

c64_1 (complex64): (1+2i), 型: complex64
c64_2 (complex64): (0.5+1.5i)
c64_1 + c64_2 = (1.5+3.5i)
*/
```

**コード解説:**

*   複素数リテラルは `実部 + 虚部i` の形式で書きます（例: `1.5 + 2.5i`, `3 + 4i`）。虚部が `1` や `-1` の場合は `i` や `-i` と書けます（例: `1 + i`）。
*   組み込み関数の `complex(実部, 虚部)` を使っても複素数を生成できます。引数には `float32` または `float64` を渡します。
*   複素数同士の四則演算（`+`, `-`, `*`, `/`）が可能です。
*   組み込み関数の `real(複素数)` と `imag(複素数)` を使うと、それぞれ実部と虚部を取り出すことができます。
*   より高度な複素数演算（絶対値、位相、平方根、指数関数など）は、標準ライブラリの `math/cmplx` パッケージで提供されています。

**どちらを使うべきか？**

浮動小数点数と同様に、通常は精度の高い **`complex128`** を使うのが一般的です。`complex64` はメモリ使用量を抑えたい場合などに限定的に使用します。

複素数型は、電気工学、物理学、信号処理などの分野で特に役立ちますが、一般的なアプリケーション開発で直接使う機会はそれほど多くないかもしれません。しかし、Goがこのような数値型もネイティブでサポートしていることは知っておくと良いでしょう。