'use strict';

var ContentScript = (function() {
	var _hostname = window.location.hostname,
		_pathname = window.location.pathname,
		_url = window.location.href,

		scrapSearchPage = function() {
			var $searchItems = $("div#atfResults li.s-result-item div.s-position-relative a.a-link-normal"),
				$nextPageLink = $("div#bottomBar #pagnNextLink"),
				urls = [],
				nextUrl = null;;

			for (var i = 0; i < $searchItems.length; i++) {
				urls.push($searchItems[i].href);
			}
			if ($nextPageLink) {
				nextUrl = $nextPageLink[0].href;
			}

			chrome.extension.sendMessage({
				from: "contentscript",
				message: "product-urls",
				urls: urls,
				next_page_url: nextUrl
			}, function(response) {
				if (response.continue && $nextPageLink) {
					window.location.href = nextUrl;
				} else {
					console.log("The extension doesn't work for this page.");
				}
			});
		},

		scrapProductPage = function() {
			var $pageTitle = $("title"),
				$title = $("#productTitle"),
				$keyword = $("meta[name='keywords']"),
				$landingImage = $("#landingImage"),
				$brand = $("a#brand"),
				$price = $("span#priceblock_ourprice"),
				$BSL = $("li#SalesRank ul.zg_hrsr span.zg_hrsr_rank");

			var data = {
				pageTitle: ($pageTitle || {}).text,
				title: (($title || {}).text() || "").trim(),
				keywords: ($keyword[0] || []).content,
				image: ($landingImage[0] || {}).src,
				brand: ($brand.find("img")[0] || {}).src,
				price: ($price || {}).text(),
				BSL: ($BSL[0] || {}).textContent,
				bsl: ($BSL[1] || {}).textContent
			};

			chrome.extension.sendMessage({
				from: "contentscript",
				message: "product-detail",
				data: data
			}, function(response) {
				if (response.continue) {
					window.location.href = response.next_url;
				} else {
					console.log("An odd response found");
				}
			});
			console.log("This is product page.");
		},

		_process = {
			"search-page": scrapSearchPage,
			"product-page": scrapProductPage
		},

		init = function() {
			chrome.extension.sendMessage({
				from: "contentscript",
				message: "status"
			}, function(response) {
				if (response.valid) {
					process(response.message);
				} else {
					console.log("The extension doesn't work for this page.");
				}
			});
		},

		process = function(flag) {
			if (flag) {
				_process[flag]();
			}
		},

		getSomething = function() {
			return [];
		};

	return {
		init: init,
		get: getSomething,
		scrapProductPage: scrapProductPage
	};
})();

(function (window, jQuery) {
	console.log('\'Allo \'Allo! Content script');
	window.ContentScript = ContentScript;
	window.ContentScript.init();
	// window.ContentScript.scrapProductPage();
})(window, $);