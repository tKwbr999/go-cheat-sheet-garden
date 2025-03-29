## タイトル
title: パッケージのインポート `import`: 他のコードを利用する

## タグ
tags: ["basics", "パッケージ", "import", "エイリアス", "ドットインポート", "ブランクインポート"]

## コード
```go
package main

// import() ブロックで複数のパッケージをインポート
import (
	"fmt"
	"math/rand"
	"strings"
	"time"
	// "github.com/google/uuid" // サードパーティ例
	// "myproject/myutils"    // ローカルパッケージ例
)

func main() {
	// パッケージ名を使って関数や変数にアクセス
	upper := strings.ToUpper("hello")
	now := time.Now()
	num := rand.Intn(10)

	fmt.Println(upper, now.Format(time.Kitchen), num)
}

```

## 解説
```text
外部パッケージの機能を使うには `import` 文で取り込みます。
通常 `package` 宣言の直後に書きます。

**基本的なインポート:**
`import "パッケージパス"` (例: `import "fmt"`)

**複数パッケージのインポート:**
`import()` ブロック内に一行ずつ記述するのが一般的です。
標準ライブラリ、サードパーティ、ローカルパッケージを
空行で区切ると見やすくなります。

インポートしたパッケージの機能は `パッケージ名.識別子`
(例: `strings.ToUpper`, `time.Now`) で利用します。
パッケージ名は通常、インポートパスの最後の要素です。

**インポートの応用:**
*   **エイリアス:** `import f "fmt"` とすると `f.Println` で使える。
    名前衝突回避などに。
*   **ドットインポート:** `import . "strings"` とすると `ToUpper()` で
    直接呼べるが、可読性が下がるため**非推奨**。
*   **ブランクインポート:** `import _ "image/png"` のように `_` を使うと、
    パッケージの `init` 関数実行のみが目的の場合に使う
    (例: DBドライバ登録)。

**未使用インポートエラー:**
インポートしたのに使わないパッケージがあるとコンパイルエラーになります。