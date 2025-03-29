## タイトル
title: "Context パッケージ: 基本的な Context の生成"

## タグ
tags: ["context", "concurrency", "Background", "TODO"]

## コード
```go
import "context"

// main 関数や初期化処理でルート Context を生成
ctx := context.Background()

// この ctx を基にして、WithCancel, WithTimeout などで子 Context を作成していく
```

## 解説
```text
すべての `context.Context` は、2つの基本的な Context のいずれかから派生します。これらの基本的な Context は `context` パッケージによって提供されます。

これらの基本的な Context と、そこから派生 Context を生成する方法については、**「並行処理」**セクションの**「Context の生成 (`context` パッケージ)」** (`090_concurrency/190_creating-contexts.md`) で既に説明しました。

ここでは、その要点を再確認します。

## `context.Background()`

*   **役割:** 通常、Context ツリーの**ルート**として使用されます。`main` 関数や、リクエスト処理の起点となる場所で最初に生成します。
*   **特性:**
    *   キャンセルされることはありません (`Done()` は `nil` チャネルを返します)。
    *   値を持っていません (`Value()` は常に `nil` を返します)。
    *   デッドラインを持っていません (`Deadline()` は `ok == false` を返します)。

## `context.TODO()`

*   **役割:** `Background()` と機能的には同じですが、どの Context を使うべきか**まだ明確でない**場合や、既存のコードが Context を受け取るように**まだ更新されていない**場合に、**一時的なプレースホルダー**として使用します。
*   **意図:** 静的解析ツールなどで `context.TODO()` の使用箇所を検出し、将来的に適切な Context を渡すようにリファクタリングを促すことを意図しています。
*   **特性:** `Background()` と同じく、キャンセルされず、値もデッドラインも持ちません。

**原則として、Context ツリーの起点には `context.Background()` を使い、`context.TODO()` は一時的な代替としてのみ使用し、最終的には適切な Context に置き換えるべきです。**

**参考コード (context.TODO):**
```go
import "context"

// 既存の関数がまだ Context を受け取らない場合など
func someLegacyFunctionWrapper() {
    // TODO: 本来は呼び出し元から渡された Context を使うべき
    ctx := context.TODO()
    // この ctx を使って、Context が必要な関数を呼び出す
    callFunctionThatNeedsContext(ctx)
}

func callFunctionThatNeedsContext(ctx context.Context) {
    // ...
}
```