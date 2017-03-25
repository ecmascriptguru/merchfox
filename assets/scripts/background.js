'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

// chrome.browserAction.setBadgeText({ text: '\'Allo' });

var WordFox = (function() {
	var _storage = window.DataStorage,
		getSomething = function() {
			return [];
		};

	return {
		get: getSomething()
	};
})();

(function(window, jQuery) {
	window.WordFox = WordFox;
})(window, $);