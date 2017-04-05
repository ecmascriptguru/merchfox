'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({ text: '\'Allo' });

var WordFox = (function() {
	var _storage = window.DataStorage,
		_amazonStartPoint = "https://www.amazon.com/s/ref=amb_link_483004722_1?ie=UTF8&bbn=12035955011&field-enc-merchantbin=ATVPDKIKX0DER&hidden-keywords=ORCA&rh=i%3Afashion-novelty&field-keywords=",
		_urls = [],
		_results = [],
		_status = {
			_started: false,
			_detailPageStarted: false,
			_initTabId: null,
			_initTabUrl: null,
			_detailTabIds: [],
			_detailTabUrls: {},
			_urlsCount: 0,
			_detailsCount: 0
		},

		addUrls = function(params) {
			_urls = _urls.concat(params.urls);
			if (params.next_page_url) {
				_status._initTabUrl = params.next_page_url;
				_status._urlsCount++;
				if (!_status._detailPageStarted) {
					startProductPages();
				}
			} else {
				chrome.tabs.remove(_status._initTabId, function(res) {
					console.log(res);
					_status._initTabId = null;
					_status._initTabUrl = null;
				});
			}
		},

		addData = function(data, sender, callback) {
			_results.push(data);
			_status._detailsCount++;

			var userData = JSON.parse(sessionStorage.login);
			if (!userData) {
				chrome.tabs.remove(sender.tab.id);
				chrome.tabs.create({url: chrome.extension.getURL("assets/html/login.html")});
				return false;
			}

			var buffer = [];

			if (_results.length > 100) {
				buffer.concat(_results);
				window.restAPI.add(_results, userData.id, function(res) {
					chrome.browserAction.setBadgeText({text: ""})
				});
				_results = [];
			}

			var nextPageUrl = _urls.pop();
			if (nextPageUrl && _status._started) {
				if (typeof callback == "function") {
					callback({status: "done"});

					chrome.tabs.update(sender.tab.id, {url: nextPageUrl}, function(tab) {
						_status._detailTabUrls[tab.id] = tab.url;
					});
				}
			} else {
				delete _status._detailTabUrls[sender.tab.id];
				var ind = _status._detailTabIds.indexOf(sender.tab.id);
				_status._detailTabIds = _status._detailTabIds.slice(0, ind).concat(_status._detailTabIds.slice(ind + 1));

				if (typeof callback == "function") {
					callback({continue: false});
				}

				if (sender.tab.id) {
					chrome.tabs.remove(sender.tab.id, function() {
						if (_status._detailTabIds.length == 0) {
							_status._detailTabUrls = {};
						}
					});
				}
			}
		},

		getResults = function() {
			return _results;
		},

		initStatus = function() {
			_status = {
				_started: false,
				_detailPageStarted: false,
				_initTabId: null,
				_initTabUrl: null,
				_detailTabIds: [],
				_detailTabUrls: {},
				_urlsCount: 0,
				_detailsCount: 0
			};
			_urls = [];
			_results = [];
		},

		startProductPages = function() {
			_status._detailPageStarted = true;
			for (var i = 0; i < Math.min(5, _urls.length); i++) {
				var curDetailPageUrl = _urls.pop();
				createTab({url: curDetailPageUrl, active: false}, function(tab) {
					_status._detailTabIds.push(tab.id);
					_status._detailTabUrls[tab.id] = curDetailPageUrl;
				});
			}
		},

		startedHandler = function(tab) {
			console.log("Start url created. The tab info is ", tab.id);
			_status._started = true;
			_status._initTabId = tab.id;
			_status._initTabUrl = tab.url;
			chrome.browserAction.setBadgeText({ text: 'wait' });
		},
		start = function(keyword) {
			if (keyword) {
				chrome.tabs.create({url: _amazonStartPoint + keyword, active: false}, startedHandler);
			} else {
				chrome.tabs.create({url: _amazonStartPoint, active: false}, startedHandler);
			}
		},

		stop = function(callback) {
			// _storage.saveProducts(_results);
			if (_status._initTabId) {
				chrome.tabs.remove(_status._initTabId, function(param) {
					console.log(param);
					_status._started = false;
					_status._initTabId = null;
					_status._initTabUrl = null;
					_status._detailPageStarted = false;
					chrome.browserAction.setBadgeText({ text:'' });
				});
			} else {
				_status._started = false;
				_status._initTabId = null;
				_status._initTabUrl = null;
				_status._detailPageStarted = false;
				chrome.browserAction.setBadgeText({ text:'' });
			}

			for (var i = 0; i < _status._detailTabIds.length; i++) {
				if (_status._detailTabIds[i] != undefined && _status._detailTabIds[i] != null) {
					try {
						chrome.tabs.remove(_status._detailTabIds.pop());
					} catch(e) {
						console.log("Unknow Tab ID detected.");
					}
				}
			}

			window.restAPI.add(_results, JSON.parse(sessionStorage.login).id, function(res) {
				chrome.browserAction.setBadgeText({text: ""});
				if (typeof callback == "function") {
					callback();
				}
			});
		},

		getStatus = function() {
			return _status;
		},

		getUrls = function() {
			return _urls;
		};

	return {
		status: getStatus,
		start: start,
		stop: stop,
		addUrls: addUrls,
		addData: addData,
		urls: getUrls,
		results: getResults
	};
})();

(function(window, jQuery) {
	var wordFox = window.WordFox = WordFox;

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		var status = wordFox.status();
		switch (request.from) {
			case "login-page":
			case "popup":
				if (request.message == "start") {
					//	Code to start scraping
					wordFox.start(request.keyword);
					sendResponse({status: status, message: "Scraping just started."});
				} else if (request.message == "stop") {
					wordFox.stop();
					sendResponse({status: status, message: "Scraping just stopped."});
				} else if (request.message == "status") {
					sendResponse({status: status, login: JSON.parse(sessionStorage.login || "null")});
				} else if (request.message == "login") {
					sessionStorage.login = JSON.stringify(request.data);
					sendResponse({status: true});
					if (request.from == "login-page") {
						chrome.tabs.remove(sender.tab.id, function(tab) {
							console.log("Login page removed.");
						})
					}
				} else if (request.message == "logout") {
					wordFox.stop(function() {
						sessionStorage.login = JSON.stringify(null);
					});
					sendResponse({staus: wordFox.status()});
				}
				break;

			case "options":
				if (request.message == "status") {
					sendResponse({status: status, data: wordFox.results(), login: JSON.parse(sessionStorage.login || "null")});
				}
				break;

			case "contentscript":
				if (request.message == "status") {
					if (status._initTabId == sender.tab.id &&
						status._initTabUrl == sender.tab.url) {
						sendResponse({valid: true, message: "search-page"});
					} else if (status._detailTabIds.indexOf(sender.tab.id) > -1) {
						sendResponse({valid: true, message: "product-page"});
					} else {
						sendResponse({valid: false});
					}
				} else if (request.message == "product-urls") {
					wordFox.addUrls(request);
					if (request.next_page_url) {
						sendResponse({continue: true});
					} else {
						sendResponse({continue: false});
					}
				} else if (request.message == "product-detail") {
					wordFox.addData(request.data, sender, sendResponse);
				}
				break;

			default:
				console.log("Message arrived from unknown place.");
				break;
		}
	})
})(window, $);