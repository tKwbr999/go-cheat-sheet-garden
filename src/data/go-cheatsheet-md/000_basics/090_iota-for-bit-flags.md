---
title: "`iota` とビット演算: ビットフラグを賢く定義する"
tags: ["basics", "定数", "const", "iota", "ビット演算", "ビットフラグ"]
---

`iota` は、単なる連番だけでなく、**ビット演算**と組み合わせることで、**ビットフラグ**と呼ばれるテクニックを簡潔に表現するためにも使われます。ビットフラグは、複数のON/OFF状態を一つの整数値で効率的に管理する方法です。

## ビットフラグとは？

コンピュータ内部では、数値は2進数（0と1の並び）で表現されます。ビットフラグは、この2進数の各桁（ビット）を、それぞれ独立したON/OFFスイッチ（フラグ）として利用する考え方です。

例えば、ファイルのアクセス権限（読み取り、書き込み、実行）を考えます。

*   読み取り可能 (Readable): 1 (2進数: `001`)
*   書き込み可能 (Writable): 2 (2進数: `010`)
*   実行可能 (Executable): 4 (2進数: `100`)

これらの値は、2進数で見たときにONになっているビットの位置が重ならないように選ばれています（それぞれ1桁目、2桁目、3桁目がON）。

## `iota` とビットシフト `<<` でビットフラグを定義

`iota` と**ビットシフト演算子 `<<`** を組み合わせると、このような2のべき乗（1, 2, 4, 8, 16...）の値を簡単に生成できます。`1 << iota` は、「1を `iota` の値だけ左にビットシフトする」という意味です。

```go title="iota とビットシフトでビットフラグ定義"
package main

import "fmt"

// iota とビットシフトを使ってビットフラグを定義
const (
	Readable   = 1 << iota // iota = 0 なので 1 << 0 = 1 (2進数: 001)
	Writable   = 1 << iota // iota = 1 なので 1 << 1 = 2 (2進数: 010)
	Executable = 1 << iota // iota = 2 なので 1 << 2 = 4 (2進数: 100)
	// 必要ならさらに追加できる
	// Admin      = 1 << iota // iota = 3 なので 1 << 3 = 8 (2進数: 1000)
)

func main() {
	fmt.Println("--- ビットフラグの値 ---")
	fmt.Printf("Readable:   %d (2進数: %03b)\n", Readable, Readable)
	fmt.Printf("Writable:   %d (2進数: %03b)\n", Writable, Writable)
	fmt.Printf("Executable: %d (2進数: %03b)\n", Executable, Executable)

	// フラグを組み合わせてパーミッションを表現 (ビットOR演算子 | を使用)
	readWrite := Readable | Writable // 1 | 2 = 3 (2進数: 011)
	fmt.Printf("\nReadWrite:  %d (2進数: %03b)\n", readWrite, readWrite)

	readExec := Readable | Executable // 1 | 4 = 5 (2進数: 101)
	fmt.Printf("ReadExec:   %d (2進数: %03b)\n", readExec, readExec)

	allPermissions := Readable | Writable | Executable // 1 | 2 | 4 = 7 (2進数: 111)
	fmt.Printf("All:        %d (2進数: %03b)\n", allPermissions, allPermissions)

	// 特定のフラグが立っているか確認 (ビットAND演算子 & を使用)
	currentPermissions := readWrite // 現在の権限は読み書き可能 (3)

	// 書き込み権限があるか？
	canWrite := (currentPermissions & Writable) != 0 // (3 & 2) != 0 -> (2 != 0) -> true
	fmt.Printf("\n書き込み権限あり？ %t\n", canWrite)

	// 実行権限があるか？
	canExecute := (currentPermissions & Executable) != 0 // (3 & 4) != 0 -> (0 != 0) -> false
	fmt.Printf("実行権限あり？ %t\n", canExecute)
}

/* 実行結果:
--- ビットフラグの値 ---
Readable:   1 (2進数: 001)
Writable:   2 (2進数: 010)
Executable: 4 (2進数: 100)

ReadWrite:  3 (2進数: 011)
ReadExec:   5 (2進数: 101)
All:        7 (2進数: 111)

書き込み権限あり？ true
実行権限あり？ false
*/
```

**コード解説:**

*   `1 << iota`:
    *   `iota` が 0 の行: `1 << 0` は 1 を 0 ビット左シフトするので `1`。
    *   `iota` が 1 の行: `1 << 1` は 1 を 1 ビット左シフトするので `10` (2進数) = `2`。
    *   `iota` が 2 の行: `1 << 2` は 1 を 2 ビット左シフトするので `100` (2進数) = `4`。
    *   このように、2のべき乗が簡単に生成されます。
*   `|` (ビットOR): フラグを組み合わせるために使います。対応するビットのどちらか一方が1なら結果も1になります。`Readable | Writable` ( `001 | 010` ) は `011` (3) となり、「読み取り可能かつ書き込み可能」な状態を表します。
*   `&` (ビットAND): 特定のフラグが立っているか確認するために使います。対応するビットの両方が1の場合のみ結果も1になります。`currentPermissions & Writable` ( `011 & 010` ) は `010` (2) となります。この結果が0でなければ (`!= 0`)、`Writable` フラグが立っていることが分かります。

`iota` とビットシフトを組み合わせることで、ビットフラグの定義を非常に簡潔かつ明確に記述できます。これは、特に低レベルな操作や、複数の状態をコンパクトに扱いたい場合に有効なテクニックです。