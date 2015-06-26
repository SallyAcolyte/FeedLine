var gui = require('nw.gui');
var win = gui.Window.get();
// win.showDevTools();

$(function () {
	windowInit();
	loadConfig();
});

function windowInit () {
	// バグ対策
	win.resizeTo(600, 800);
	win.setPosition("center");
	win.show();

	// フォントサイズの指定
	$(":root").css("fontSize", localStorage.fontsize + "px"); 
	
	// テキストエリアを可能な限り大きくリサイズする
	function resizeTextarea () {
		$("textarea").height( $("#config").outerHeight() - $("textarea").offset().top );
	}
	var resizeTimer = null;
	win.on("resize", function () {
		clearTimeout( resizeTimer );
		resizeTimer = setTimeout(function() {
			resizeTextarea();
		}, 50 );
	});
	resizeTextarea();

	// ウィンドウ終了時の処理
	win.on("close", function () {
		win.close(true);
	});

	// ウィンドウコントロール
	$("#minimize_btn").click( function () {
		win.minimize();
	});
	$("#close_btn").click( function () {
		quit();
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

			// F12 開発者ツールを開く
			case 123:
				win.showDevTools();
				break;
		}
	});

	// バージョンの表示
	$("#header_version").html(gui.App.manifest.version);
}

function quit () {
	saveConfig();
	win.close(true);
}

function loadConfig() {
	// 設定を読み込んでフォームに反映する
	$("#FEED_INTERVAL").val     (localStorage.feed_interval);
	$("#MIN_ITEM_INTERVAL").val (localStorage.min_item_interval);
	$("#LIMIT_DAY").val         (localStorage.limit_day);

	$("#FONTSIZE").val          (localStorage.fontsize);

	try  {
		$("#FAVICON").prop ("checked", JSON.parse(localStorage.show_favicon));
	} catch ( e ) { }

	try  {
		$("#TASKTRAY").prop ("checked", JSON.parse(localStorage.window_tasktray));
	} catch ( e ) { }

	try  {
		$("#CLOCK_TOP").prop("checked", JSON.parse(localStorage.clock_always_on_top));
	} catch ( e ) { }

	$("#FEED_LIST").val         (JSON.parse(localStorage.feedlist).join("\n"));
}

function saveConfig () {
	if (checkNumber( $("#FEED_INTERVAL").val(), 30, 365)) {
		localStorage.feed_interval     = $("#FEED_INTERVAL").val();
	}

	if (checkNumber( $("#MIN_ITEM_INTERVAL").val(), 1, 365)) {
		localStorage.min_item_interval = $("#MIN_ITEM_INTERVAL").val();
	}

	if (checkNumber( $("#LIMIT_DAY").val(), 1, 365)) {
		localStorage.limit_day         = $("#LIMIT_DAY").val();
	}

	if (checkNumber( $("#FONTSIZE").val(), 8, 32)) {
		localStorage.fontsize          = $("#FONTSIZE").val();
	}

	localStorage.show_favicon        = $("#FAVICON").prop("checked");
	localStorage.window_tasktray     = $("#TASKTRAY").prop("checked");
	localStorage.clock_always_on_top = $("#CLOCK_TOP").prop("checked");

	var url_ary = getUrlAry();
	if (url_ary.length > 0) {
		localStorage.feedlist = JSON.stringify(url_ary);
	}
}

function checkNumber (val, min, max) {
	// valが値で、かつmin以上max以下であることを確認する
	if (!isNaN(val) && val >= min && val <= max) {
		return true;
	} else {
		return false;
	}
}

function getUrlAry () {
	// テキストエリアに入力されたうち、URLだけを配列として返す
	ary = $("#FEED_LIST").val().split("\n");
	return ary.map( function ( url ) {
		if (url.trim().match(/^(https?):\/\/.+$/)) {
			return url;
		}
	});
}

