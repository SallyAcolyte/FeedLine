var FeedParser = require("feedparser");
var request = require("request");
var gui = require("nw.gui");
var win = gui.Window.get();
var sanitize = require("google-caja").sanitize;

$(function () {
	// メインメソッド（DOMロード後に実行）

	// 設定の読み込み
	configInit();

	// ウィンドウの初期化
	windowInit();

	// ウェルカムメッセージの表示
	writeMessage("Welcome to FeedLine.<br><small>version: " + gui.App.manifest.version + "</small>");

	// 最初フィードを取得する
	main_timer = setTimeout(nextFeed, 1000);
})

function configInit () {
	// 購読するフィード
	try {
		FEED_LIST = JSON.parse(localStorage.feedlist);
	} catch ( e ) {
		FEED_LIST = [
				"http://b.hatena.ne.jp/articles.rss", 
				"http://b.hatena.ne.jp/entrylist/news.rss", 
				"http://b.hatena.ne.jp/entrylist?sort=hot&threshold=&mode=rss", 
				"http://b.hatena.ne.jp/hotentry/news.rss", 
				"http://business.nikkeibp.co.jp/rss/all_nbo.rdf", 
				"http://feed.nikkeibp.co.jp/rss/pc/pc_top.rdf", 
				"http://feed.nikkeibp.co.jp/rss/trendynet/trendy.rdf", 
				"http://feeds.cnn.co.jp/rss/cnn/cnn.rdf", 
				"http://feeds.feedburner.com/hatena/b/hotentry", 
				"http://itpro.nikkeibp.co.jp/rss/ITpro.rdf", 
				"http://rss.rssad.jp/rss/codezine/new/20/index.xml", 
				"http://rss.rssad.jp/rss/forest/rss.xml", 
				"http://rss.rssad.jp/rss/headline/headline.rdf", 
				"http://rss.rssad.jp/rss/itmtop/1.0/topstory.xml", 
				"http://rss.rssad.jp/rss/mainichi/flash.rss"
		]
		localStorage.feedlist = JSON.stringify(FEED_LIST);
	}

	// 同じフィードを読み込むインターバル（分）
	if (isNaN(localStorage.feed_interval    )) {localStorage.feed_interval     = 60};
	FEED_INTERVAL_MS = localStorage.feed_interval * 60 * 1000 / FEED_LIST.length;

	// 次のアイテムを表示するまでの最低時間（秒）
	if (isNaN(localStorage.min_item_interval)) {localStorage.min_item_interval = 15};
	MIN_ITEM_INTERVAL_MS = localStorage.min_item_interval * 1000;

	// n日前までのアイテムを表示する
	if (isNaN(localStorage.limit_day        )) {localStorage.limit_day         = 1};
	LIMIT_DAYS = localStorage.limit_day;

	// フォントサイズ
	if (isNaN(localStorage.fontsize         )) {localStorage.fontsize          = 16};
	FONTSIZE = localStorage.fontsize;

	// 前回時計が表示されていれば、表示する
	if (localStorage.clock_show) {
		toggleClockWindow();
	}

	// アイテム表示履歴
	try {
		link_history = JSON.parse(localStorage.linkhistory);
	} catch ( e ) {
		link_history = [];
		localStorage.linkhistory = JSON.stringify(link_history);
	}

	feed_cur = Math.floor(Math.random() * FEED_LIST.length);

	// メインの処理に関わるタイマー
	var main_timer = null;
}

function windowInit () {
	// windowInit ウィンドウに関する設定と表示を行う

	// 設定のロード
	if (isNaN(localStorage.window_width    )) {localStorage.window_width  = 380};
	if (isNaN(localStorage.window_height   )) {localStorage.window_height = 880};
	if (isNaN(localStorage.window_x        )) {localStorage.window_x = 100};
	if (isNaN(localStorage.window_y        )) {localStorage.window_y = 100};

	// （設定有効時） タスクトレイに追加
	if (localStorage.window_tasktray == "true") {
		win.setShowInTaskbar(false);
		var tray = new gui.Tray({ title: gui.App.manifest.name, icon: "./img/icon_16.png" });
		var menu = new gui.Menu();
		menu.append(new gui.MenuItem({
			label: "表示",
			click: function () {
				win.setPosition("center");
				win.show();
				win.focus();
			}
		}));
		menu.append(new gui.MenuItem({
			label: "終了",
			click: quit
		}));
		tray.menu = menu;

		tray.on("click", function () {
			win.focus();
		});
	}

	// フォントサイズの指定
	$(":root").css("fontSize", FONTSIZE + "px"); 

	// ウィンドウリサイズ・移動
	win.resizeTo(localStorage.window_width, localStorage.window_height);
	win.moveTo(localStorage.window_x, localStorage.window_y);

	// ウィンドウリサイズ・移動・クローズ時に設定を記録する
	win.on("move", function () {
		localStorage.window_x = win.x;
		localStorage.window_y = win.y;
	});

	win.on("resize", function (w, h) {
		localStorage.window_width = w;
		localStorage.window_height = h;
	});
	win.on("close", function () {
		quit();
	});
	win.on("maximize", function () {
		this.unmaximize();
	});

	// コントロールボタンの設定
	$("#config_btn").click( function () {
		openConfigWindow();
	});
	$("#minimize_btn").click( function () {
		win.minimize();
	});
	$("#close_btn").click( function () {
		quit();
	});
	
	$("#clock_btn").click( function () {
		toggleClockWindow();
	});
	$("#forward_btn").click( function () {
		if (main_timer != null) {
			clearTimeout(main_timer);
		}
		nextFeed();
	});
	$("#refresh_btn").click( function () {
		link_history = [];
	});


	// キーコンフィグ
	$(window).keydown(function( e ){
		switch ( e.keyCode ) {
			// F1 ウィンドウを画面中央に移動する
			case 112:
				win.setPosition("center");
				win.show();
				win.focus();
				break;

			// F5 速やかに次のフィード処理へ
			case 116:
				if (main_timer != null) {
					clearTimeout(main_timer);
				}
				nextFeed();
				break;

			// F12 開発者ツールを開く
			case 123:
				win.showDevTools();
				break;
		}
	});

	// ウィンドウを表示
	win.show();
}

function nextFeed () {
	// nextFeed 次のフィード処理を開始する

	// 次のフィード処理を開始する
	main_timer = setTimeout(function () {
		enqueue(feed_cur++)
	}, 0);

	// 最後のフィードまで処理したら、カーソル（処理対象）を最初のフィードに戻す
	if ( feed_cur >= FEED_LIST.length ) {
		feed_cur = 0;
	}
}

function quit () {
	// quit 設定を保存して、アプリを終了する
	localStorage.window_x = win.x;
	localStorage.window_y = win.y;
	localStorage.window_width = win.width;
	localStorage.window_height = win.height;
	localStorage.linkhistory = JSON.stringify(link_history);
	gui.App.closeAllWindows();
	gui.App.quit();
}

function enqueue ( feed_id ) {
	var queue = [];

	// n日前（limit_date）までの記事を表示する
	var limit_date = new Date();
	limit_date = limit_date.setDate(limit_date.getDate() - LIMIT_DAYS);

	// 1024を超えた履歴を削除
	link_history.length = 1024;

	// RSSフィードをgetする
	var feedparser = new FeedParser();
	var req = request( FEED_LIST[feed_id] );
	stat("get " + req.host);
	req.on('error', function (error) {
		stat(error);
		main_timer = setTimeout(nextFeed, FEED_INTERVAL_MS);
	});

	req.on('response', function (res) {
		var stream = this;
		if (res.statusCode != 200) {
			return this.emit('error', new Error(res.statusCode + ' / ' + req.host));
		}
		// getしたRSSフィードを feedparser でパースする
		stream.pipe(feedparser);
	});
	
	// パース時のエラー
	feedparser.on('error', function(error) {
		stat(error.code + " / " + error.hostname);
		main_timer = setTimeout(nextFeed, FEED_INTERVAL_MS);
	});
	
	// 各アイテムに対する処理
	feedparser.on('readable', function() {
		var stream = this
			, meta = this.meta
			, item;
		while (item = stream.read()) {
			console.log(item);
			if (
				// アイテムが空でない
				item != null &&

				// URLが表示履歴に存在しない
				link_history.indexOf(item.link) == -1 &&
				
				// 日付が存在しないか、期限以内
				(item.date == null || item.date > limit_date) &&

				// 広告でない
				!isAd(item)

				) {
				// 表示用のキューにエンキュー
				queue.push(item);
			}
		}
	});

	// フィードのパースが完了した際の処理
	feedparser.on('end', function() {
		if (queue.length > 0) {
			// アイテムが存在する場合
			// ステータスをクリア
			stat();

			// フィード名とアイテム数を表示
			var items = "items";
			if (queue.length == 1) { items = "item"; }
			writeMessage(sanitize(this.meta.title) + '<br><small>' + queue.length + ' ' + items + '</small>');
			
			// 各アイテム毎の表示間隔を計算
			interval = FEED_INTERVAL_MS / queue.length;
			if ( interval < MIN_ITEM_INTERVAL_MS ) { interval = MIN_ITEM_INTERVAL_MS; }
			
			// 1秒後から表示を開始する
			main_timer = setTimeout(function () {
				dequeue(queue, interval);
			}, 1000);

		} else {

			// アイテムが存在しない場合
			stat("新着記事なし: " + this.meta.title);

			// FEED_INTERVAL_MS 後、次のフィード処理へ
			main_timer = setTimeout(nextFeed, FEED_INTERVAL_MS);
		}
	});
}

function dequeue ( queue, interval ) {
	if (queue.length > 0) {
		// アイテムが存在する場合
		// アイテムをデキュー
		var item = queue.shift();

		// アイテムを表示
		writeItem(item);

		// interval後に次のアイテムをデキュー
		main_timer = setTimeout(function () {
			dequeue(queue, interval);
		}, interval);
	
	} else {

		// アイテムが存在しない場合
		// interval後に次のフィード処理へ
		main_timer = setTimeout(nextFeed, interval);
	}
}

function writeMessage ( message ) {
	// writeMessage アイテム以外のメッセージ（フィード名など）を表示する
	var item_elm = $("<div></div>", {
		"class": "item"
	});

	var item_body = $("<div></div>", {
		"class": "item-body message",
		html: message
	});
	item_elm.append(item_body);

	$("#timeline").prepend(item_elm);
}

function writeItem (item) {
	var title = sanitize(item.title);
	var link = sanitize(item.link);

	if (item.permalink != null) {
		var url = sanitize(item.permalink);
	} else {
		var url = link;
	}

	// writeItem アイテム（記事）を表示する
	var item_elm = $("<div></div>", {
		"class": "item"
	});

	var item_body = $("<div></div>", {
		"class": "item-body feeditem",
		"data-link": link,
		on: {
		  click: clickItem
		}
	});
	item_elm.append(item_body);

	var item_title = $("<div></div>", {
		"class": "item-title",
		html: title
	});
	item_body.append(item_title);

	// faviconの追加
	item_title.prepend($("<img />", {
		"class": "favicon",
		"src": "http://favicon.qfor.info/f/" + url
	}));

	$("#timeline").prepend(item_elm);

	// URLを履歴に追加
	link_history.unshift(item.link);

	// 1024を超えたアイテムを削除
	$(".item:gt(1024)").remove();
}

function clickItem ( e ) {
	// clickItem アイテムがクリックされた場合の処理
	switch ( e.which ) {
		// 左クリック
		case 1:
			// アイテムがクリックされたら、外部ブラウザでリンクを開く
			gui.Shell.openExternal( $(this).data("link") );

			// アイテムを表示済みにする
			$(this).addClass("visited");
			break;
	}
	return false;
}

var config_window = null;
function openConfigWindow () {
	// openConfigWindow コンフィグウィンドウを開く
	if (config_window == null) {
		config_window = gui.Window.open("./config.html", {
			"title": "FeedLine :: Config",
			"resizable": true,
			"toolbar": false,
			"frame": false,
			"transparent": win.isTransparent,
			"show": false,
			"min_width": 480,
			"min_height": 500,
			"max_width": 1920,
			"max_height": 1920,
			"width": 1920,
			"height": 1920,
			"icon": gui.App.manifest.window.icon
		});
	} else {
		// 既に開かれている場合、画面中央に移動してフォーカスする
		config_window.setPosition("center");
		config_window.focus();
	}
	config_window.on('closed', function() {
		config_window = null;
	});
}

var clock_window = null;
function toggleClockWindow () {
	// toggleClockWindow 時計ウィンドウを開く/閉じる
	if (clock_window == null) {
		localStorage.clock_show = true;
		clock_window = gui.Window.open("./clock.html", {
			"title": "FeedLine :: Clock",
			"resizable": false,
			"toolbar": false,
			"frame": false,
			"transparent": win.isTransparent,
			"show": false,
			"width": 250,
			"height": 70,
			"show_in_taskbar": false,
			"icon": gui.App.manifest.window.icon
		});
	} else {
		localStorage.clock_show = false;
		clock_window.close();
	}
	clock_window.on('closed', function() {
		clock_window = null;
	});
}

function isAd ( item ) {
	// isAd アイテムの広告チェック
	res = 
		item.title.match(/^[\[［【\s]*(ad|pr|info|広告)[\]］】:：\s]*/i) || 
		item.title.match(/[\[［【\s]*(ad|pr|info|広告)[\]］】:：\s]*$/i) || 
		item.link.match(/^http:\/\/rss\.rssad\.jp\/rss\/ad\//i);
	return res;
}

var stat_clear_delay = null;
function stat ( mesg ) {
	// ステータスの削除が予約されていた場合、解除する
	if (stat_clear_delay != null) {
		clearTimeout(stat_clear_delay);
	}

	if (mesg == null) {
		// ステータスの削除を予約する
		stat_clear_delay = setTimeout(function () {
			$("#status").html("");
		}, 3000);

	} else {

		// メッセージをコンソールログとステータスに表示する
		console.log(mesg);
		$("#status").html(sanitize(mesg));
	}
}
