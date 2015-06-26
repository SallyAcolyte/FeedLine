var gui = require('nw.gui');
var win = gui.Window.get();
// win.showDevTools();

$(function () {
	windowInit();
	clock();
});

function windowInit () {
	// 設定のロード
	if (isNaN(localStorage.clock_x        )) {localStorage.clock_x = 100};
	if (isNaN(localStorage.clock_y        )) {localStorage.clock_y = 100};
	win.moveTo(localStorage.clock_x, localStorage.clock_y);

	// 常に手前に表示
	if (localStorage.clock_always_on_top == "true") {
		win.setAlwaysOnTop(true);
	}

	// ウィンドウ移動時・クローズ時に設定を記録する
	win.on("move", function () {
		localStorage.clock_x = win.x;
		localStorage.clock_y = win.y;
	});
	win.on("close", function () {
		localStorage.clock_x = win.x;
		localStorage.clock_y = win.y;
		win.close(true);
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
	
	win.show();
}

function clock () {
	// 現在日時を取得
	var d = new Date();

	// アナログ時計を更新
	analog(d);

	// デジタル時計を更新
	digital(d);

	// 次の「0ミリ秒」に実行されるよう予約
	var delay = 1000 - new Date().getMilliseconds();
	setTimeout(clock, delay);
}

function analog (d) {
	// 秒針
	var ss_deg = d.getSeconds() * 6;
	if ( ss_deg == 0 ) {
		// 秒針が0degになる時、一度360degにアニメーションさせてから0degに置き換える
		$("#pin_ss").rotate({
			animateTo: 360,
			duration: 200,
			callback: function (){ $("#pin_ss").rotate({angle: 0}) }
		})
	} else {
		$("#pin_ss").rotate({animateTo: ss_deg, duration: 200, callback: function () {} });
	}

	// 分針
	var mm_deg = d.getMinutes() * 6 + d.getSeconds() / 10;
	$("#pin_mm").rotate(mm_deg);

	// 時針
	var hh_deg = d.getHours() * 30 + d.getMinutes() / 2;
	$("#pin_hh").rotate(hh_deg);
}

function digital (d) {
	var AA_str = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
	var YY = d.getFullYear().toString().slice(-2);
	var MM = d.getMonth() + 1;
	var DD = d.getDate();
	var AA = d.getDay();
	var hh = d.getHours();
	var mm = d.getMinutes();
	var ss = d.getSeconds();

	// 桁あわせ
	if(MM < 10) { MM = "0" + MM; }
	if(DD < 10) { DD = "0" + DD; }
	if(hh < 10) { hh = "0" + hh; }
	if(mm < 10) { mm = "0" + mm; }
	if(ss < 10) { ss = "0" + ss; }

	$("#digital").html(YY + '/' + MM + '/' + DD + ' (' + AA_str[AA] + ')<br>' + hh + ':' + mm + ':' + ss);
}
