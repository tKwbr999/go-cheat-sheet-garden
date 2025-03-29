## タイトル
title: データ構造: ネストした構造体 (Nested Structs)

## タグ
tags: ["data-structures", "構造体", "struct", "ネスト", "埋め込み", "フィールド"]

## コード
```go
package main

import "fmt"

type Department struct {
	ID   int
	Name string
}

type Employee struct {
	EmployeeID int
	FullName   string
	Dept       Department // Department 構造体をフィールドとして持つ
	Manager    *Employee  // Employee へのポインタ
}

func main() {
	manager := Employee{
		EmployeeID: 101, FullName: "Alice Smith",
		Dept: Department{ID: 10, Name: "開発部"},
	}

	emp1 := Employee{
		EmployeeID: 205, FullName: "Bob Johnson",
		Dept: Department{ID: 10, Name: "開発部"},
		Manager: &manager, // manager のポインタを設定
	}

	fmt.Printf("従業員1: %+v\n", emp1)

	// ネストしたフィールドへのアクセス
	departmentName := emp1.Dept.Name
	fmt.Printf("部署名: %s\n", departmentName)

	if emp1.Manager != nil {
		managerName := emp1.Manager.FullName // ポインタでも . でアクセス
		fmt.Printf("マネージャー名: %s\n", managerName)
	}
}

```

## 解説
```text
構造体のフィールドの型には、別の構造体型
（またはそのポインタ）を指定でき、構造体を
入れ子（**ネスト**）にして複雑なデータを表現できます。

**定義と初期化:**
コード例では `Employee` 構造体が `Department` 構造体を
`Dept` フィールドとして持っています (値としてネスト)。
また、`Manager` フィールドは `*Employee` 型、つまり
`Employee` 構造体へのポインタです (自己参照も可能)。

構造体リテラルで初期化する際、ネストした構造体の
フィールドも `{}` を使って初期化できます
(例: `Dept: Department{ID: 10, Name: "開発部"}` )。
ポインタフィールドには、別の構造体変数のアドレス (`&manager`)
などを代入します。

**フィールドへのアクセス:**
ネストしたフィールドには、ドット演算子 `.` を連鎖させて
アクセスします (例: `emp1.Dept.Name`)。

フィールドがポインタ型の場合 (`emp1.Manager`) でも、
Goが自動的にデリファレンスするため、そのままドット演算子で
その先のフィールドにアクセスできます
(例: `emp1.Manager.FullName`)。
`(*emp1.Manager).FullName` と書く必要はありません。

**フィールドの変更:**
アクセスと同様にドットを連鎖させて代入します
(例: `emp1.Dept.ID = 11`)。
ポインタ経由で変更した場合 (`emp1.Manager.Dept.Name = ...`)、
参照先の元の構造体の値も変更されます。

構造体のネストにより、現実世界の複雑な関係性や
階層構造をデータとして表現できます。