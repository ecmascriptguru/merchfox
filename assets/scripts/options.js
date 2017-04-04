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
					var bulletPoints = products[i].bullet_points.split("\n"),
						tags = "<ul>";

					bulletPoints.forEach(function(point) {
						tags += "<li>" + point + "</li>";
					});
					tmpRow.push(tags + "</ul>");
					tmpRow.push(products[i].price || "");
					tmpRow.push(parseInt((products[i].top_bsr || "#0").substr(1)));
					tmpRow.push(parseInt((products[i].bottom_bsr || "#0").substr(1)));
					if (products[i].saved_id == null) {
						tmpRow.push("<button data-id='" + products[i].id + "' class='btn btn-success form-control action save'>Save</button>");
					} else {
						tmpRow.push("<button data-id='" + products[i].id + "' data-saved-id='" + products[i].saved_id + "' class='btn btn-danger form-control action unsave'>Unsave</button>");
					}
					_table.row.add(tmpRow).draw();
				}

				_mask.hide();

				if (data.next_page_url) {
					window.setTimeout(
						function() {
							chrome.extension.sendMessage({
								from: "options",
								message: "status"
							}, function(res) {
								var user = res.login;
								if (!user) {
									chrome.tabs.create({url: chrome.extension.getURL("assets/html/login.html")});
									return false;
								}

								_mask.show();
								restAPI.get(data.next_page_url, user.id, appendTable);
							});
						},
						500);
				}
			} else {
				console.log("Error found in getting data.");
			}
		},

		update = function() {
			chrome.extension.sendMessage({
				from: "options",
				message: "status"
			}, function(response) {
				var user = response.login;
				if (!user) {
					chrome.tabs.create({url: chrome.extension.getURL("assets/html/login.html")});
					return false;
				}
				_table.clear();
				_mask.show();
				restAPI.get(null, user.id, appendTable);
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
			$("#products-table tbody").on("click", "tr button.action", function(event) {
				event.preventDefault();
				var $curRow = $(this).parents("tr"),
					$curBtn = $(this),
					data = {};

				chrome.extension.sendMessage({
					from: "options",
					message: "status"
				}, function(res) {
					var user = res.login;
					if (!user) {
						chrome.tabs.create({url: chrome.extension.getURL("assets/html/login.html")});
						return false;
					}

					if ($curBtn.hasClass("save")) {
						data.product_id = parseInt($curBtn.attr("data-id"));
						data.user_id = parseInt(user.id);
						restAPI.save(data, function(response) {
							if (response.status) {
								$curBtn.attr('data-saved-id', response.saved_id)
									.removeClass("save")
									.removeClass("btn-success")
									.addClass("unsave")
									.addClass("btn-danger")
									.text("Unsave");
							} else {
								console.log("Something went wrong.");
								console.log(response);
							}
						});
					} else if ($curBtn.hasClass("unsave")) {
						data.product_id = $curBtn.attr('data-id');
						data.saved_id = $curBtn.attr('data-saved-id');
						restAPI.unsave(data, function(response) {
							if (response.status) {
								$curBtn.removeAttr("data-saved-id")
									.removeClass("unsave")
									.removeClass("btn-danger")
									.addClass("save")
									.removeClass("btn-success")
									.text("Save");
							} else {
								console.log("Something went wrong.");
								console.log(response);
							}
						})
					}
				});
			})
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