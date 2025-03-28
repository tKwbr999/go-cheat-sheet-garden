---
title: "Propagating Context Through Call Stack" # タイトル内のダブルクォートをエスケープ
tags: ["context"]
---

警告: オプションパラメータを渡すために context 値を使用しない
主に API 境界を越えるリクエストスコープデータに使用する

```go
// コールスタックを通じて context を伝播させる
func HandleRequest(w http.ResponseWriter, r *http.Request) {
	// リクエスト context を抽出
	ctx := r.Context()

	// タイムアウトを追加
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()

	// リクエストを処理
	result, err := processRequest(ctx, r.URL.Query())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Write(result)
}

func processRequest(ctx context.Context, params url.Values) ([]byte, error) {
	// context がキャンセルされたか確認
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
		// 処理を続行
	}

	// データベースからデータを取得
	data, err := getFromDatabase(ctx, params.Get("id"))
	if err != nil {
		return nil, err
	}

	// データを処理
	return processData(ctx, data)
}
```