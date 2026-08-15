# NEO GRADIA

グラディウスIII 風の、ブラウザで動く横スクロールシューティングゲーム（練習用）。
外部ライブラリ・画像・音源に一切依存せず、**HTML5 Canvas + 素の JavaScript** だけで作られています。
グラフィックは**スーパーファミコン風のドット絵**（コード内で定義したスプライトをドット単位で描画）、
効果音は WebAudio で手続き的に生成しています。

## 遊び方

以下のいずれかで起動できます。

- **オンライン（GitHub Pages）**: 公開URLをブラウザで開くだけ（下記「公開する」参照）。
  → https://kensakutoyoda-arch.github.io/cloude-code-web/
- **かんたん（ローカル）**: `index.html` をブラウザで直接開く（ダブルクリックでOK）。
- **ローカルサーバ経由**（推奨・より安定）:
  ```bash
  python3 -m http.server
  # ブラウザで http://localhost:8000 を開く
  ```

## GitHub Pages で公開する

このゲームは静的サイト（サーバー不要）なので、GitHub Pages で無料公開できます。

1. **リポジトリを Public にする**
   Settings → General → 最下部の Danger Zone →「Change repository visibility」→ Public。
   （無料アカウントで Pages を使うには Public が必要です）
2. **Pages を有効化する**
   Settings → Pages → Build and deployment →
   Source =「Deploy from a branch」、Branch = `main` / フォルダ `/ (root)` → **Save**。
3. 数十秒〜数分後、次のURLで公開されます。
   → `https://kensakutoyoda-arch.github.io/cloude-code-web/`

`main` に push するたびに、Pages は自動で再デプロイされます。
（`.nojekyll` を置いているため、ファイルはそのまま配信されます）

## 操作方法

### キーボード（PC）

| 操作 | キー |
|------|------|
| 移動 | 方向キー / `W` `A` `S` `D` |
| ショット（連射） | `Z` / `Space` |
| パワーアップ適用 | `X` / `Enter` |
| ポーズ | `P` |
| スタート / リスタート | `Enter` |

### タッチ（スマホ / タブレット）

| 操作 | やり方 |
|------|--------|
| スタート / リスタート | 画面をタップ |
| 移動 | **画面左半分をドラッグ**（バーチャルスティック表示） |
| ショット | 自動連射（操作不要） |
| パワーアップ適用 | 右下の **POWER** ボタン |
| ポーズ | 右上の **II** ボタン |

横向き（ランドスケープ）でのプレイを推奨します。

## パワーアップ（グラディウス方式）

赤い敵を倒すと **パワーカプセル** を落とします。取得するたびに、画面下のバーの
カーソルが1つ進みます。強化キー（`X`）を押すと、そのとき光っているスロットの強化が
発動します。

`SPEED` → `MISSILE` → `DOUBLE` → `LASER` → `OPTION` → `SHIELD`

- **SPEED** … 移動速度アップ（最大5段）
- **MISSILE** … 斜め下に落ちて地を這うミサイルを追加
- **DOUBLE** … 前方＋斜め上の2方向ショット（`LASER` と排他）
- **LASER** … 敵を貫通する長いレーザー（`DOUBLE` と排他）
- **OPTION** … 自機を追従し同じ武器を撃つ分身（最大4個）
- **SHIELD** … 前方を数発ぶん防ぐバリア

被弾するとミス（その場で残機が減り、パワーアップは失われます）。残機が尽きるとゲームオーバー。

## ゲームの流れ

雑魚敵のウェーブを切り抜けると **WARNING** の警告が出て、ステージボス（大型戦艦）が出現します。
ボスは本体の装甲が弾を吸収するため、**開いているときのコア（弱点）** を狙って撃破しましょう。
コアを破壊すると **STAGE CLEAR** です。

ハイスコアはブラウザの `localStorage` に保存されます。

## ファイル構成

```
.
├── index.html      # キャンバスとスクリプト読み込み
├── style.css       # 画面レイアウト・CRT風装飾
└── js/
    ├── core.js       # 名前空間・定数・共通ユーティリティ・ドット文字
    ├── sprites.js    # SFC風ドット絵スプライト（文字列アート→canvas）
    ├── input.js      # キーボード入力
    ├── audio.js      # WebAudio 効果音
    ├── starfield.js  # パララックス星背景
    ├── particles.js  # 爆発パーティクル
    ├── weapons.js    # 自機/敵の弾
    ├── options.js    # オプション（マルチプル）
    ├── powerup.js    # パワーアップバー
    ├── player.js     # 自機
    ├── enemies.js    # 雑魚敵・カプセル
    ├── boss.js       # ボス
    ├── stage.js      # ウェーブ進行・ボス出現
    └── game.js       # メインループ・状態管理・当たり判定・HUD
```

## 技術メモ

- ビルド不要。`<script>` の古典的読み込みで、`file://` でもそのまま動作します。
- 全エンティティの当たり判定は AABB（軸並行矩形）で統一。
- 60fps 想定の `requestAnimationFrame` ループ。`dt`（前フレームからの経過秒）ベースで更新。
