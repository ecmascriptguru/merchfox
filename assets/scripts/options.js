'use strict';

var Options = (function() {
	var _storage = window.DataStorage,
		getSomething = function() {
			return [];
		};

	return {
		get: getSomething()
	};
})();
(function (window, jQuery) {
	window.Options = Options;
})(window, jQuery);