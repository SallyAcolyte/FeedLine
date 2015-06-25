# FeedLine 実行可能パッケージの作成手順

FeedLineを各環境で実行可能なパッケージにする手順です。

## Windows
1. /app の **中身** を ```app.nw``` としてzipで圧縮する
2. [NW.jsの実行環境](https://github.com/nwjs/nw.js#downloads)をダウンロードして展開する
3. 1.の ```app.nw``` を2.の ```nw.exe``` と同じディレクトリに配置する
4. コマンドプロンプトで3.のディレクトリを開き、```copy /b nw.exe+app.nw FeedLine.exe``` を実行する
5. ```FeedLine.exe```, ```icudtl.dat```, ```nw.pak``` が、実行に必要なファイル群です  
これらをzip等で圧縮して、配布してください

※ アイコンを変更する場合は、[Resource Hacker](http://www.angusj.com/resourcehacker/)を利用します。

## Mac
ポイント: 背景透過を利用するとウィンドウ処理に問題が発生するので、package.jsonで無効化する。

	* 作成中 *
