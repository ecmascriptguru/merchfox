'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({ text: '\'Allo' });

var WordFox = (function() {
	var _storage = window.DataStorage,
		_amazonStartPoint = "https://www.amazon.com/s/ref=amb_link_483004722_1?ie=UTF8&field-keywords=&bbn=12035955011&field-enc-merchantbin=ATVPDKIKX0DER&hidden-keywords=ORCA&rh=i%3Afashion-novelty",
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
			if (params.next_page_url && _urls.length < 10) {
				_status._initTabUrl = params.next_page_url;
				_status._urlsCount++;
			} else {
				if (!_status._detailPageStarted) {
					startProductPages();
				}
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

			var nextPageUrl = _urls.pop();
			if (nextPageUrl) {
				_status._detailTabUrls[sender.tab.id] = nextPageUrl;
				if (typeof callback == "function") {
					callback({continue: true, next_url: nextPageUrl});
				}
			} else {
				delete _status._detailTabUrls[sender.tab.id];
				ind = _status._detailTabIds.indexOf(sender.tab.id);
				_status._detailTabIds = _status._detailTabIds.slice(0, ind - 1).concat(_status._detailTabIds.slice(ind + 1));
				sendResponse({continue: false});
				chrome.tabs.remove(sender.tab.id);
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
			for (var i = 0; i < 1/*Math.min(5, _urls.length)*/; i++) {
				var curDetailPageUrl = _urls.pop();
				createTab({url: curDetailPageUrl}, function(tab) {
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
		start = function() {
			// initStatus();
			chrome.tabs.create({url: _amazonStartPoint}, startedHandler);
		},

		stop = function() {
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
		},
		getUrls = function() {
			return _urls;
		};

	return {
		status: _status,
		start: start,
		stop: stop,
		addUrls: addUrls,
		addData: addData,
		urls: getUrls,
		resuls: _results,
		get: getResults
	};
})();

(function(window, jQuery) {
	window.WordFox = WordFox;

	chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
		switch (request.from) {
			case "popup":
				if (request.message == "start") {
					//	Code to start scraping
					window.WordFox.start();
					sendResponse({status: true, message: "Scraping just started."});
				} else if (request.message == "stop") {
					window.WordFox.stop();
					sendResponse({status: true, message: "Scraping just stopped."});
				} else if (request.message == "status") {
					sendResponse({status: window.WordFox.status});
				}
				break;

			case "contentscript":
				if (request.message == "status") {
					if (window.WordFox.status._initTabId == sender.tab.id &&
						window.WordFox.status._initTabUrl == sender.tab.url) {
						sendResponse({valid: true, message: "search-page"});
					} else if (window.WordFox.status._detailTabIds.indexOf(sender.tab.id) > -1 &&
						window.WordFox.status._detailTabUrls[sender.tab.id] == sender.tab.url) {
						sendResponse({valid: true, message: "product-page"});
					} else {
						sendResponse({valid: false});
					}
				} else if (request.message == "product-urls") {
					window.WordFox.addUrls(request);
					if (request.next_page_url) {
						sendResponse({continue: true});
					} else {
						sendResponse({continue: false});
					}
				} else if (request.message == "product-detail") {
					window.WordFox.addData(request.data, sender, sendResponse);
				}
				break;

			default:
				console.log("Message arrived from unknown place.");
				break;
		}
	})
})(window, $);