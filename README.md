# FeedLine

新着記事を **“ゆっくりと”** 流すRSSリーダです。  
登録したフィードを **“Twitterのタイムラインのように”** 流し続けます。  

 *デスクトップの隅に置き、ふと目に入った記事を閲覧する。そんな使い方を想定しています。* 

![スクリーンショット](./docs/img/ss_main.png)

## ダウンロード
- **v0.0.1 (2015-06-25)**
	- Windows 64bit: [FeedLine_v0.0.1_Win64.zip](https://github.com/SallyAcolyte/FeedLine/releases/download/v0.0.1/FeedLine_v0.0.1_Win64.zip)
	- Mac OS 10.7～ 64bit: 準備中

その他のバージョン及びソースコードは、[リリースページ](https://github.com/SallyAcolyte/FeedLine/releases)からダウンロードできます。

## 動作環境
- Windows 64bit
	- 動作確認はWindows7で行っています
- Mac OS 10.7～ 64bit
	- 背景透過が利用できないため、透過しないパッケージを用意する予定です

## ドキュメント
- **ユーザ向け**
	- [使い方・画面説明](./docs/help.md)
- **開発者向け**
	- [技術構成と実装](./docs/docs.md)
	- [実行可能パッケージの作成手順](./docs/package.md)
	- [NW.jsに関するメモ](./docs/nwjs.md)

## ToDo
- 不具合修正
	- 時計のウィンドウサイズ上限の追加 / 最大化の阻止
- 機能追加
	- NGワード / NGドメインの設定
	- メインウィンドウを「常に手前に表示」する切り替えボタン
	- 記事を「あとで読む」機能
	- 記事のクリック履歴
	- 設定を初期化して終了する機能
- その他
	- Mac用パッケージのリリース
