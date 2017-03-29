'use strict';

var Options = (function() {
	var _storage = window.DataStorage,
		_table = null,
		_reloadButton = $("button#reload"),
		_mask = $("div#mask"),

		appendTable = function(response) {
			if (response.status) {
				var data = response.data,
					products = data.data;
				for (var i = 0; i < products.length; i++) {
					var tmpRow = [];
					tmpRow.push("<a href='" + products[i].link + "' + target='_newTab'><img src='" + products[i].img_url + "' class='landing-img' /></a>");
					tmpRow.push(products[i].title || "");
					tmpRow.push(products[i].keywords || "");
					tmpRow.push(products[i].price || "");
					tmpRow.push(products[i].top_bsr || "");
					tmpRow.push(products[i].bottom_bsr || "");
					tmpRow.push("<button class='btn btn-danger form-control remove'>-</button>");
					_table.row.add(tmpRow).draw();
				}

				_mask.hide();

				if (data.next_page_url) {
					window.setTimeout(
						function() {
							_mask.show();
							restAPI.get(data.next_page_url, appendTable);
						},
						500);
				}
			} else {
				console.log("Error found in getting data.");
			}
		},

		update = function() {
			_table.clear();
			_mask.show();
			restAPI.get(null, appendTable);
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