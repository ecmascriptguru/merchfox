'use strict';

var env = "dev";
// var env = "product";

var createTab = function(params, callback) {
	var func = (typeof callback === "function") ? callback : function() {};
	chrome.tabs.create(params, func);
};

var amazonSearchStartPoint = "https://www.amazon.com/s/ref=amb_link_483004722_1?ie=UTF8&bbn=12035955011&field-enc-merchantbin=ATVPDKIKX0DER&hidden-keywords=ORCA&rh=i%3Afashion-novelty&field-keywords=";

var restAPI = (function(window, jQuery) {
	var _mainHost = null,
		_v1ApiBaseUrl = null;

	if (env == "dev") {
		_mainHost = "http://localhost:8000/";
	} else {
		_mainHost = "http://184.73.108.215/";
	}
	_v1ApiBaseUrl = _mainHost + "api/v1/";

	var getProducts = function(url, user_id, callback) {
			var url = (url) ? url : _v1ApiBaseUrl + "products/get";
			$.ajax({
				url: url,
				method: "POST",
				data: JSON.stringify({user_id: user_id}),
				contentType: 'application/json',
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

		getSavedProducts = function(url, user_id, callback) {
			var url = (url) ? url : _v1ApiBaseUrl + "items/get";
			$.ajax({
				url: url,
				method: "POST",
				data: JSON.stringify({user_id: user_id}),
				contentType: 'application/json',
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

		deleteSavedProduct = function(params, callback) {
			$.ajax({
				url: _v1ApiBaseUrl + "items/del",
				method: "post",
				contentType: "application/json",
				data: JSON.stringify(params),
				success: function(res) {
					if (typeof callback == "function") {
						callback(res);
					} else {
						console.log(res);
					}
				},
				failure: function(e, xhr) {
					if (typeof callback == "function") {
						callback(e);
					} else {
						console.log(e);
					}
				}
			});
		},

		insertProducts = function(params, user_id, startFlag = false, callback) {
			$.ajax({
				url: _v1ApiBaseUrl + "products/set",
				method: "POST",
				contentType: 'application/json',
				data: JSON.stringify({user_id: user_id, data: params, start_flag: startFlag}),
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
		},

		login = function(email, password, callback) {
			$.ajax({
				url: _v1ApiBaseUrl + "login",
				data: JSON.stringify({
					email: email,
					password: password
				}),
				method: "post",
				contentType: "application/json",
				success: function(res) {
					res = JSON.parse(res);
					if (typeof callback == "function") {
						callback(res);
					} else {
						console.log(res);
					}
				}
			});
		},

		saveProduct = function(params, callback) {
			$.ajax({
				url: _v1ApiBaseUrl + "items/save",
				method: "post",
				contentType: "application/json",
				data: JSON.stringify(params),
				success: function(res) {
					if (typeof callback == "function") {
						callback(res);
					} else {
						console.log(res);
					}
				},
				failure: function(e, xhr) {
					if (typeof callback == "function") {
						callback(e);
					} else {
						console.log(e);
					}
				}
			});
		},

		unsaveProduct = function(params, callback) {
			$.ajax({
				url: _v1ApiBaseUrl + "items/unsave",
				method: "post",
				contentType: "application/json",
				data: JSON.stringify(params),
				success: function(res) {
					if (typeof callback == "function") {
						callback(res);
					} else {
						console.log(res);
					}
				},
				failure: function(e, xhr) {
					if (typeof callback == "function") {
						callback(e);
					} else {
						console.log(e);
					}
				}
			});
		};

	return {
		base: _mainHost,
		apiBaseUrl: _v1ApiBaseUrl,
		login: login,
		save: saveProduct,
		unsave: unsaveProduct,
		get: getProducts,
		add: insertProducts,
		getItems: getSavedProducts,
		deleteItem: deleteSavedProduct
	};
	
})(window, $)