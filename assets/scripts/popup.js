'use strict';

var Popup = (function() {
	var _storage = window.DataStorage,
		_informTag = $("#no-data-inform"),
		_startButton = $("#btn-start"),
		_stopButton = $("#btn-stop"),
		_loginButton = $("#login-button"),
		_logoutButton = $("button#btn-signout"),
		_registerButton = $("#register-button"),
		_loginPage = $("#login-page"),
		_startPage = $("#start-page"),
		_statusPage = $("#status-page"),
		_status = null,
		_keyword = $("#keyword"),

		_getData = function() {
			return [];
		},

		signOut = function() {
			chrome.extension.sendMessage({
				from: "popup",
				message: "logout"
			}, function(response) {
				showLoginPage();
			});
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
			_logoutButton.show();
			_loginPage.hide();
			_startPage.hide();
			_statusPage.show();
		},

		showLoginPage = function() {
			_loginPage.show();
			_logoutButton.hide();
			_startPage.hide();
			_statusPage.hide();
		},

		showStartPage = function(status) {
			_startButton.prop('disabled', false);
			_stopButton.prop('disabled', true);
			_logoutButton.show();
			_loginPage.hide();
			_startPage.show();
			_statusPage.hide();

			if (status._detailsCount && status._detailsCount > 0) {
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
				var login = response.login;
				if (!login) {
					showLoginPage();
				} else {
					_status = response.status;
					initPopup(_status);
				}
			});
		};

	_loginButton.click(function(event) {
		event.preventDefault();
		var email = $("#email").val(),
			password = $("#password").val();
		restAPI.login(email, password, function(res) {
			if (res.status) {
				chrome.extension.sendMessage({
					from: "popup",
					message: "login",
					data: res.user
				}, function(response) {
					if (response.status) {
						showStartPage(response.status);
					}
				})
			} else {
				alert("Please try again.");
			}
		})
	});

	_logoutButton.click(signOut);

	_startButton.click(function(event) {
		event.preventDefault();
		chrome.extension.sendMessage({
			from: "popup",
			message: "start",
			keyword: _keyword.val()
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

	_registerButton[0].href = restAPI.base + "register";

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