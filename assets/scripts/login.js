(function(window, jQuery) {
	$("button#register").click(function(event) {
		event.preventDefault();
		window.location.href = restAPI.base + "register";
	});

	$("button#login").click(function(event) {
		var email = $("#email").val(),
			password = $("#password").val();

		if (!email || !password) {
			alert("Please fill in email and password.");
			return false;
		} else {
			restAPI.login(email, password, function(response) {
				if (!response.status) {
					alert("Something went wrong. Please try again later.");
					return false;
				}
				chrome.extension.sendMessage({
					from: "login-page",
					message: "login",
					data: response.user
				}, function(res) {
					console.log(res);
				})
			})
		}
	});
	$("#forgot-password-link")[0].href = restAPI.base + "password/reset";
})(window, $);