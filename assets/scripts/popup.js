'use strict';

var Popup = (function() {
	var _temp = DataStorage.getProducts(),
		_startButton = $("#no-data-inform"),
		_getData = function() {
			return [];
		};

	_startButton.click(function(event) {
		event.preventDefault();
		chrome.extension.sendMessage({
			from: "popup",
			message: "start"
		}, function(response) {
			console.log(response);
		});
	});

	return {
		data: _getData
	};
})();
(function (window, jQuery) {
	console.log('\'Allo \'Allo! Popup');
	window.Popup = Popup;
})(window, $);