# FeedLine NW.jsに関するメモ
NW.jsで開発を行う上でのTipsなど

	* 作成中 *

## ウィンドウ関連処理

### フレームレスウィンドウ


### 透過ウィンドウ
<https://github.com/nwjs/nw.js/wiki/Frameless-window>

透過ウィンドウはリサイズに対応しておらず、処理が不安定になるケースがあります。  
可能な限り利用を避けた方が無難です。

#### 透過ウィンドウの作成

#### ウィンドウコントロールの作成


## デバッグ
### リモートデバッグ
<https://github.com/nwjs/nw.js/wiki/Debugging-with-devtools#remote-debugging>

--remote-debugging-port= オプションを利用することで、ブラウザ経由でデバッグが行えます。  
Developer Toolsが起動できず、console.logが確認できない場合に便利です。
