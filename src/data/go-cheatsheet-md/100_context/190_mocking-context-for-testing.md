## タイトル
title: Context のテスト (モックは通常不要)

## タグ
tags: ["context", "concurrency", "testing", "mocking", "WithCancel", "WithTimeout"]

## コード
```go
// Context のテストでは通常モックは不要。
// 標準の context.WithCancel や context.WithTimeout を使う。

// 例 (タイムアウトテスト):
// ctx, cancel := context.WithTimeout(context.Background(), 50*time.Millisecond)
// defer cancel()
// err := functionUnderTest(ctx)
// if !errors.Is(err, context.DeadlineExceeded) { /* エラー処理 */ }

// 例 (キャンセルテスト):
// ctx, cancel := context.WithCancel(context.Background())
// defer cancel()
// go func() { time.Sleep(50*time.Millisecond); cancel() }()
// err := functionUnderTest(ctx)
// if !errors.Is(err, context.Canceled) { /* エラー処理 */ }

// 例 (値テスト):
// ctx := context.WithValue(context.Background(), myKey, testValue)
// functionUnderTest(ctx)
// // (必要なら functionUnderTest 内での値利用を検証)

```

## 解説
```text
`context.Context` を受け取る関数をテストする際、
Context 自体をモック（偽物）する必要は**通常ありません**し、
推奨もされません。

**なぜモック不要か？**
Goの `context` パッケージはテストで扱いやすく設計されています。
*   **タイムアウト/デッドライン:** `context.WithTimeout` や
    `context.WithDeadline` でテスト用の時間制限付き Context を
    簡単に生成できます。
*   **キャンセル:** `context.WithCancel` でキャンセル可能な Context と
    `cancel` 関数を生成し、テストコードから任意のタイミングで
    `cancel()` を呼び出せます。
*   **値:** `context.WithValue` でテストに必要な値を設定した
    Context を簡単に生成できます。

**テストの焦点:**
重要なのは Context 自体の実装ではなく、テスト対象関数が
*   Context からのシグナル (キャンセル、タイムアウト) に正しく応答するか？
*   Context を下位関数に適切に伝播させているか？
*   Context から期待される値を正しく取得・利用しているか？
といった点であり、これらは標準の Context 生成関数で十分テスト可能です。

**依存関係のモック:**
もしテスト対象関数が Context を使って外部サービス (DB, API等) と
通信する場合、Context をモックするのではなく、その**外部サービスへの
依存部分をインターフェース化**し、テスト時にはそのインターフェースの
**モック実装**を使うのが一般的です。このモック実装が Context の
キャンセルをチェックするように作れば、テスト対象関数が Context を
正しく扱っているか検証できます。

**結論:**
Context を受け取る関数のテストでは、**標準パッケージが提供する
`context.WithCancel`, `context.WithTimeout`, `context.WithValue` を
使ってテストシナリオに応じた Context を生成するのが、
最もシンプルで推奨される方法です。**