'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({ text: '\'Allo' });

var WordFox = (function() {
	var _storage = window.DataStorage,
		_amazonStartPoint = "https://www.amazon.com/s/ref=amb_link_483004722_1?ie=UTF8&field-keywords=&bbn=12035955011&field-enc-merchantbin=ATVPDKIKX0DER&hidden-keywords=ORCA&rh=i%3Afashion-novelty",
		_urls = [],
		_status = {
			_started: false,
			_initTabId: null,
			_initTabUrl: null,
			_detailTabIds: [],
			_urlsCount: 1340,
			_detailsCount: 240
		},
		startedHandler = function(tab) {
			//
			console.log("Start url created. The tab info is ", tab.id);
			_status._started = true;
			_status._initTabId = tab.id;
			chrome.browserAction.setBadgeText({ text: 'wait' });
		},
		start = function() {
			// Code to start scraping.
			createTab({url: _amazonStartPoint}, startedHandler);
		},
		stop = function() {
			chrome.tabs.remove(_status._initTabId, function(param) {
				console.log(param);
				_status._started = false;
				_status._initTabId = null;
				_status._initTabUrl = null;
				chrome.browserAction.setBadgeText({ text:'' });
			});
		},
		getSomething = function() {
			return [];
		};

	return {
		status: _status,
		start: start,
		stop: stop,
		get: getSomething()
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

			default:
				console.log("Message arrived from unknown place.");
				break;
		}
	})
})(window, $);