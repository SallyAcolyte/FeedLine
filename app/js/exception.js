var gui    = require("nw.gui");
var w      = gui.Window.get();

process.on("uncaughtException", function ( e ) {
	w.show();
	w.showDevTools();
	console.log("uncaughtException:" + e.stack);
	if (window.confirm("ERROR: " + e + "\n終了しますか？") ) {
		gui.App.quit();
	}
});

// ファイルドロップの無効化
$(document).on("dragenter", function (e) {
	e.stopPropagation();
	e.preventDefault();
});
$(document).on("dragover", function (e) {
	e.stopPropagation();
	e.preventDefault();
});
$(document).on("drop", function (e) {
	e.stopPropagation();
	e.preventDefault();
});
