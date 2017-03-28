'use strict';

var Options = (function() {
	var _storage = window.DataStorage,
		_table = null,
		_reloadButton = $("button#reload"),

		update = function() {
			restAPI.get(null, function(response) {
				if (response.status) {
					var data = response.data;
					_table.clear();
					for (var i = 0; i < data.length; i++) {
						var tmpRow = [];
						tmpRow.push("<a href='" + data[i].link + "' + target='_newTab'><img src='" + data[i].img_url + "' class='landing-img' /></a>");
						tmpRow.push(data[i].title || "");
						tmpRow.push(data[i].keywords || "");
						tmpRow.push(data[i].price || "");
						tmpRow.push(data[i].top_bsr || "");
						tmpRow.push(data[i].bottom_bsr || "");
						tmpRow.push("<button class='btn btn-danger form-control remove'>-</button>");
						_table.row.add(tmpRow).draw();
					}
				} else {
					console.log("Error found in getting data.");
				}
			});
		},

		// submit = function(callback) {
		// 	chrome.extension.sendMessage({
		// 		from: "options",
		// 		message: "status"
		// 	}, function(response) {
		// 		var data = response.results,
		// 			submitData = [];

		// 		window.restAPI.add(data, function(res) {
		// 			if (typeof callback === "function") {
		// 				callback(res);
		// 			} else {
		// 				console.log(res);
		// 			}
		// 		});
		// 	});
		// },

		getTable = function() {
			return _table;
		},

		init = function() {
			_table = $('#products-table').DataTable();
			_reloadButton.click(update);
			update();
		};

	return {
		init: init,
		update: update,
		table: getTable
	};
})();

(function (window, jQuery) {
	window.Options = Options;
	window.Options.init();
})(window, jQuery);