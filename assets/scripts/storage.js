'use strict';

var DataStorage = (function() {
	var _products = JSON.parse(localStorage.getItem("products") || "[]"),
		getProducts = function() {
			return _products;
		};

	return {
		getProducts: getProducts
	};
})();

(function(window, jQuery) {
	window.DataStorage = DataStorage;
})(window, $);