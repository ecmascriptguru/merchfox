'use strict';

var Options = (function() {
	var _storage = window.DataStorage,

		init = function() {
			$('#products-table').DataTable();
		};

	return {
		init: init
	};
})();

(function (window, jQuery) {
	window.Options = Options;
	window.Options.init();
})(window, jQuery);