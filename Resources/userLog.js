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
					loggedIn = true;
					if (e.users[0].admin == 'true') admin = true;
					picker.remove(login);
					picker.add(logout);
					cameraWin.remove(loginWindow);
	    		} else {
	    			alert('Incorrect Username/Password');
	    		}
			});
		});
		
		cancelButton.addEventListener("click", function() {
			cameraWin.remove(loginWindow);
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
				picker.remove(logout);
				picker.add(login);
				loggedIn = false;
				admin = false;
			} else {
				alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});
	}
}
exports.logIn = logIn;
exports.logOut = logOut;