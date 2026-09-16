# Shuntaro's Post Office

Figma Sites を卒業して、素の HTML / CSS / JS だけで作った「デジタル郵便局」サイトです。
GitHub Pages にデプロイすれば **完全無料** で公開・運用できます。

## ファイル構成

```
index.html   ページ本体
styles.css   見た目
script.js    挙動（時計・棚・郵便ボックス・手紙・返信フォーム）
data.js      ★編集はここだけでOK（手紙の文面・棚のアイテム・返信フォームの設定）
images/      棚の写真（book.jpg, movie.jpg, khao-soi.jpg, yaksha.jpg,
             akha-ama-coffee.jpg, shikisanban.jpg, kagami-jishi.jpg, shiba.jpg）
```

## 中身を更新したいとき

コードを触る必要はありません。`data.js` を開いて：

- **手紙を追加・編集する** → `LETTERS` オブジェクトの該当ボックス番号のところに
  `recipient` / `date` / `body`（段落ごとに配列）を書く
- **棚の写真を追加する** → `images/` フォルダに指定のファイル名で画像を置くだけ
  （置かなければ絵文字のプレースホルダーが表示されます）
- **郵便ボックスの番号を変える** → `POST_BOX_NUMBERS` の配列を編集

## 返信フォーム（Formspree）の設定

1. https://formspree.io で無料アカウントを作成（無料枠：月50件まで）
2. フォームを1つ作成し、発行されたエンドポイントURL（`https://formspree.io/f/xxxxxxx` の形）をコピー
3. `data.js` の `FORMSPREE_ENDPOINT` にそのURLを貼り付け

これで手紙モーダルの「返信を書く」から送信した内容が、あなたのメールに届きます。

## GitHub Pages で公開する

1. GitHubリポジトリの **Settings → Pages** を開く
2. "Build and deployment" の Source を **Deploy from a branch** にする
3. Branch を公開したいブランチ（例: `main`）・フォルダを `/ (root)` にして Save
4. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます

以降、`data.js` を編集して push するだけで内容を更新できます（Figmaの月額課金は不要です）。
