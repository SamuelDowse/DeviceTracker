function logIn(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		var loginWindow		= Ti.UI.createView({backgroundColor:"white", layout:"vertical"}),
			userName		= Ti.UI.createTextField({top:50, autocorrect:false, hintText:'Username', color:'black'}),
			userPassword	= Ti.UI.createTextField({top:40, autocorrect:false, passwordMask:true, hintText:'Password', color:'black'}),
			loginButton		= Ti.UI.createButton({title:"Log In", top:30, color:'black'}),
			cancelButton	= Ti.UI.createButton({title:"Cancel", top:30, color:'black'});
		loginButton.addEventListener("click", function() {
			Cloud.Users.login({
	    		login: userName.value,
				password: userPassword.value
			}, function (e) {
	    		if (e.success) {
	        		var user = e.users[0];
	        		var loginDialog = Ti.UI.createAlertDialog({
						message: 'Welcome '+user.first_name+' '+user.last_name,
						title: 'Logged In'
					});
					loginDialog.show();
					cameraWin.remove(loginWindow);
					scannerFile.openScanner();
					if (user.admin == 'true')
						admin = true;
	    		} else { alert('Incorrect Username/Password'); }
			});
		});
		loggedIn = true;
		cancelButton.addEventListener("click", function() {
			cameraWin.remove(loginWindow);
			scannerFile.openScanner();
		});
		loginWindow.add(userName);
		loginWindow.add(userPassword);
		loginWindow.add(loginButton);
		loginWindow.add(cancelButton);
		cameraWin.add(loginWindow);
	}
}
function logOut(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Users.logout(function (e) {
			if (e.success) {
				var logoutDialog = Ti.UI.createAlertDialog({
					message: 'You have been logged out',
					title: 'Logged Out'
				});
				logoutDialog.show();
				var user = null;
			} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
		});
		loggedIn = false;
		admin = false;
	}
}
exports.logIn = logIn;
exports.logOut = logOut;