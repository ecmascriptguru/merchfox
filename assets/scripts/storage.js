'use strict';

var DataStorage = (function() {
	var saveProducts = function(products) {
			localStorage.setItem("_products", JSON.stringify(products));
		},

		getProducts = function() {
			return JSON.parse(localStorage.getItem("_products")) || [];
		};

	return {
		saveProducts: saveProducts,
		getProducts: getProducts
	};
})();

(function(window, jQuery) {
	window.DataStorage = DataStorage;
})(window, $);