## タイトル
title: 複素数 (Complex)

## タグ
tags: ["basic-types", "複素数", "complex64", "complex128"]

## コード
```go
package main

import "fmt"

func main() {
	// complex128 (デフォルト)
	var c1 complex128 = 1.5 + 2.5i
	c2 := 3 + 4i // 型推論
	c3 := complex(0.5, -1.2)

	fmt.Printf("c1: %v (%T)\n", c1, c1)
	fmt.Printf("c2: %v\n", c2)
	fmt.Printf("c3: %v\n", c3)

	// 演算
	addResult := c1 + c2
	mulResult := c1 * c2
	fmt.Printf("c1 + c2 = %v\n", addResult)
	fmt.Printf("c1 * c2 = %v\n", mulResult)

	// 実部と虚部
	fmt.Printf("real(c1): %f\n", real(c1))
	fmt.Printf("imag(c1): %f\n", imag(c1))
}
```

## 解説
```text
Goは**複素数 (Complex Number)** も扱えます。
複素数は `a + bi` (a:実部, b:虚部, i:虚数単位)
の形で表されます。

**Goの複素数型:**
*   **`complex64`**: 実部・虚部が `float32` (計64bit)。
*   **`complex128`**: 実部・虚部が `float64` (計128bit)。
    **複素数リテラル (例: `1+2i`) は
    デフォルトで `complex128`** になります。
    通常はこちらを使うのが一般的です。

**生成方法:**
*   リテラル: `実部 + 虚部i` (例: `1.5 + 2.5i`)
*   組み込み関数: `complex(実部, 虚部)`
    (例: `complex(0.5, -1.2)`)

**基本操作:**
*   四則演算 (`+`, `-`, `*`, `/`) が可能です。
*   組み込み関数 `real(c)` で実部、
    `imag(c)` で虚部を取り出せます。

**`math/cmplx` パッケージ:**
絶対値、位相、平方根など、より高度な
複素数演算関数が提供されています。

**使い分け:**
浮動小数点数と同様、通常は精度の高い
**`complex128`** を使用します。
`complex64` はメモリ節約が必要な場合などに
限定的に使用します。

複素数は科学技術計算などで役立ちますが、
一般的なアプリ開発での使用頻度は低めです。