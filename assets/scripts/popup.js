'use strict';

var Popup = (function() {
	var _storage = window.DataStorage,
		_informTag = $("#no-data-inform"),
		_startButton = $("#btn-start"),
		_stopButton = $("#btn-stop"),
		_startPage = $("#start-page"),
		_statusPage = $("#status-page"),
		_status = null,

		_getData = function() {
			return [];
		},
		showStatusPage = function() {
			$("#urls-count").text(_status._urlsCount);
			if (!_status._initTabId) {
				$("#urls").attr({class: "status alert-success"}).text("completed");
			} else {
				$("#urls").attr({class: "status alert-warning"}).text("pending");
			}
			$("#details-count").text(_status._detailsCount);
			if (_status._detailTabIds.length == 0) {
				$("#details").attr({class: "status alert-success"}).text("completed");
			} else {
				$("#details").attr({class: "status alert-warning"}).text("pending");
			}

			_startButton.prop('disabled', true);
			_stopButton.prop('disabled', false);
			_startPage.hide();
			_statusPage.show();
		},
		showStartPage = function() {
			_startButton.prop('disabled', false);
			_stopButton.prop('disabled', true);
			_startPage.show();
			_statusPage.hide();
		},
		initPopup = function() {
			if (_status && _status._started) {
				showStatusPage();
			} else {
				showStartPage();
			}
		},
		init = function() {
			chrome.extension.sendMessage({
				from: "popup",
				message: "status"
			}, function(response) {
				_status = response.status;
				initPopup();
			});
		};

	_startButton.click(function(event) {
		event.preventDefault();
		chrome.extension.sendMessage({
			from: "popup",
			message: "start"
		}, function(response) {
			if (response.status) {
				showStatusPage();
			} else {
				console.log(response);
			}
		});
	});

	_stopButton.click(function(event) {
		event.preventDefault();
		chrome.extension.sendMessage({
			from: "popup",
			message: "stop"
		}, function(response) {
			if (response.status) {
				showStartPage();
			} else {
				console.log(response);
			}
		});
	});

	return {
		init: init,
		data: _getData
	};
})();
(function (window, jQuery) {
	console.log('\'Allo \'Allo! Popup');
	window.Popup = Popup;
	window.Popup.init();
})(window, $);