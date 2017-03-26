'use strict';

var Options = (function() {
	var _storage = window.DataStorage,
		_table = null,
		_data = null,

		update = function(data) {
			_table.clear();
			_data = data;
			var tableData = [];
			for (var i = 0; i < data.length; i++) {
				var tmpRow = [];
				tmpRow.push("<a href='" + data[i].link + "' + target='_newTab'><img src='" + data[i].image + "' class='landing-img' /></a>");
				tmpRow.push(data[i].title || "");
				tmpRow.push(data[i].keywords || "");
				tmpRow.push(data[i].price || "");
				tmpRow.push(data[i].BSR || "");
				tmpRow.push(data[i].bsr || "");
				tmpRow.push("<button class='btn btn-danger form-control remove'>-</button>");
				_table.row.add(tmpRow).draw();
			}
		},

		getData = function() {
			return _data;
		},

		getTable = function() {
			return _table;
		},

		init = function() {
			_table = $('#products-table').DataTable();
			_data = _storage.getProducts();
			update(_data);
		};

	return {
		init: init,
		getData: getData,
		update: update,
		table: getTable
	};
})();

(function (window, jQuery) {
	window.Options = Options;
	window.Options.init();
})(window, jQuery);