var createTab = function(params, callback) {
	var func = (typeof callback === "function") ? callback : function() {};
	chrome.tabs.create(params, func);
};