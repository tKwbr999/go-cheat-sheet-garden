---
title: "データ構造: ネストした構造体 (Nested Structs)"
tags: ["data-structures", "構造体", "struct", "ネスト", "埋め込み", "フィールド"]
---

構造体のフィールドの型には、`int` や `string` などの基本型だけでなく、**別の構造体型**（またはそのポインタ）を指定することもできます。これにより、構造体を入れ子（ネスト）にして、より複雑なデータ構造を表現することができます。

## ネストした構造体の定義と初期化

例えば、「従業員」を表す構造体が、その従業員の「部署」情報（これも構造体）を持つ、といった状況が考えられます。

```go title="ネストした構造体の定義と初期化"
package main

import "fmt"

// Department 構造体: 部署情報
type Department struct {
	ID   int
	Name string
}

// Employee 構造体: 従業員情報
// Department フィールドがネストされた構造体 (値)
// Manager フィールドがネストされた構造体へのポインタ
type Employee struct {
	EmployeeID int
	FullName   string
	Dept       Department // Department 構造体を直接フィールドとして持つ (値)
	Manager    *Employee  // Employee 構造体へのポインタ (自己参照も可能)
}

func main() {
	// --- ネストした構造体の初期化 ---

	// マネージャー情報を作成
	manager := Employee{
		EmployeeID: 101,
		FullName:   "Alice Smith",
		Dept: Department{ // Department もリテラルで初期化
			ID:   10,
			Name: "開発部",
		},
		Manager: nil, // マネージャーの上司はいないので nil
	}

	// 一般従業員情報を作成
	emp1 := Employee{
		EmployeeID: 205,
		FullName:   "Bob Johnson",
		Dept: Department{ // Department を初期化
			ID:   10,
			Name: "開発部",
		},
		Manager: &manager, // manager 変数へのポインタを Manager フィールドに設定
	}

	// 別の従業員 (フィールド名を省略して初期化 - 非推奨)
	// emp2 := Employee{206, "Carol Williams", Department{10, "開発部"}, &manager}

	fmt.Printf("マネージャー: %+v\n", manager)
	fmt.Printf("従業員1: %+v\n", emp1)
	// fmt.Printf("従業員2: %+v\n", emp2)

	// --- ネストしたフィールドへのアクセス ---
	fmt.Println("\n--- フィールドアクセス ---")

	// emp1 の部署名にアクセス
	// ドット演算子を連鎖させる
	departmentName := emp1.Dept.Name
	fmt.Printf("従業員1の部署名: %s\n", departmentName)

	// emp1 のマネージャーの名前にアクセス
	// Manager はポインタなので、Go が自動的にデリファレンスしてくれる
	if emp1.Manager != nil {
		managerName := emp1.Manager.FullName
		fmt.Printf("従業員1のマネージャー名: %s\n", managerName)
	}

	// --- ネストしたフィールドの変更 ---
	fmt.Println("\n--- フィールド変更 ---")
	// emp1 の部署 ID を変更
	emp1.Dept.ID = 11
	fmt.Printf("変更後の従業員1の部署ID: %d\n", emp1.Dept.ID)

	// マネージャーの部署名を変更 (ポインタ経由)
	if emp1.Manager != nil {
		emp1.Manager.Dept.Name = "開発本部"
		fmt.Printf("変更後のマネージャーの部署名 (emp1経由): %s\n", emp1.Manager.Dept.Name)
		fmt.Printf("変更後のマネージャー情報 (manager変数): %+v\n", manager) // manager 変数自身も変更されている
	}
}

/* 実行結果:
マネージャー: {EmployeeID:101 FullName:Alice Smith Dept:{ID:10 Name:開発部} Manager:<nil>}
従業員1: {EmployeeID:205 FullName:Bob Johnson Dept:{ID:10 Name:開発部} Manager:0x1400011c018}

--- フィールドアクセス ---
従業員1の部署名: 開発部
従業員1のマネージャー名: Alice Smith

--- フィールド変更 ---
変更後の従業員1の部署ID: 11
変更後のマネージャーの部署名 (emp1経由): 開発本部
変更後のマネージャー情報 (manager変数): {EmployeeID:101 FullName:Alice Smith Dept:{ID:10 Name:開発本部} Manager:<nil>}
*/
```

**コード解説:**

*   `Employee` 構造体は `Dept` という名前で `Department` 構造体をフィールドとして持っています。これは値としての埋め込みです。
*   `Employee` 構造体は `Manager` という名前で `*Employee` 型（`Employee` 構造体へのポインタ）をフィールドとして持っています。
*   構造体リテラルの中で、ネストされた構造体のフィールドも `{...}` を使って初期化できます (`Dept: Department{...}`).
*   ネストされたフィールドにアクセスするには、ドット演算子 `.` を連鎖させます (`emp1.Dept.Name`)。
*   フィールドがポインタ型の場合 (`emp1.Manager`) でも、Goが自動的にデリファレンスするため、そのままドット演算子でその先のフィールドにアクセスできます (`emp1.Manager.FullName`)。`(*emp1.Manager).FullName` と書く必要はありません。
*   `emp1.Manager.Dept.Name = "開発本部"` のようにポインタ経由でフィールドを変更すると、参照先の元の構造体 (`manager`) の値も変更されます。

構造体をネストさせることで、現実世界の複雑な関係性や階層構造をデータとして表現することができます。次のセクションでは、似ていますが少し異なる「埋め込みフィールド」について見ていきます。