'use strict';

var env = "dev";
// var env = "product";

var createTab = function(params, callback) {
	var func = (typeof callback === "function") ? callback : function() {};
	chrome.tabs.create(params, func);
};

var restAPI = (function(window, jQuery) {
	var _baseURL = null;

	if (env == "dev") {
		_baseURL = "http://localhost:8000/api/product";
		// _baseURL = "http://localhost:8000/api/product?page=9";
	}

	var getProducts = function(url, callback) {
			var url = (url) ? url : _baseURL;
			$.ajax({
				url: url,
				method: "get",
				data: null,
				dataType: 'json',
				success: function(res) {
					if (typeof callback === "function") {
						callback(res);
					} else {
						console.log(res);
					}
				},
				failure: function(e, xhr) {
					if (typeof callback === "function") {
						callback(e);
					} else {
						console.log(e);
					}
				}
			});
		},

		insertProducts = function(params, callback) {
			$.ajax({
				url: _baseURL,
				method: "POST",
				contentType: 'application/json',
				data: JSON.stringify(params),
				// data: params,
				success: function(res) {
					if (typeof callback === "function") {
						callback(res);
					} else {
						console.log(res);
					}
				},
				failure: function(e, xhr) {
					if (typeof callback === "function") {
						callback(e);
					} else {
						console.log(e);
					}
				}
			});
		};

	return {
		get: getProducts,
		add: insertProducts
	};
	
})(window, $)