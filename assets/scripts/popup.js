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
		showStartPage = function(status) {
			_startButton.prop('disabled', false);
			_stopButton.prop('disabled', true);
			_startPage.show();
			_statusPage.hide();

			if (status._detailsCount > 0) {
				$("#product-details-count").text(status._detailsCount);
				$("#data-info").show();
				$("#no-data-inform").hide();
			} else {
				$("#data-info").hide();
				$("#no-data-inform").show();
			}
		},
		initPopup = function(status) {
			if (_status && _status._started) {
				showStatusPage();
			} else {
				showStartPage(status);
			}
		},
		init = function() {
			chrome.extension.sendMessage({
				from: "popup",
				message: "status"
			}, function(response) {
				_status = response.status;
				initPopup(_status);
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
				showStartPage(response.status);
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