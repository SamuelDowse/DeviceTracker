/**
 * Open a window to allow the user to input their log in details.
 * If the log in details are correct, close the log in window.
 * If the log in details are incorrect, display an error message.
 */
function logIn(){
    if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
        loginPage = true;
        loginButton.addEventListener("click", function() {
            Cloud.Users.login({
                login: userName.value,
                password: userPassword.value
            }, function (e) {
                if (e.success) {
                    currentUser = e.users[0];
                    loggedIn = true;
                    if (e.users[0].admin == 'true'){
                        admin = true;
                        if (Ti.Platform.osname == 'android'){
                            cameraWin.activity.invalidateOptionsMenu();
                        }
                    }
                    picker.remove(login);
                    picker.add(logout);
                    scannerFile.openScanner();
                    cameraWin.remove(loginWindow);
                    loginPage = false;
                } else {
                    alert('Incorrect Username/Password');
                }
            });
        });
        
        cancelButton.addEventListener("click", function() {
            cameraWin.remove(loginWindow);
            scannerFile.openScanner();
        });
    }
}

/**
 * If a user is logged in and this method is called, log them out.
 * If a user is not logged in and this method is called, do nothing.
 */
function logOut(){
    if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
        if (loggedIn == true){
            Cloud.Users.logout(function (e) {
                if (e.success) {
                    picker.remove(logout);
                    picker.add(login);
                    loggedIn = false;
                    admin = false;
                    currentUser = null;
                    if (Ti.Platform.osname == 'android'){
                        cameraWin.activity.invalidateOptionsMenu();
                    }
                } else {
                    alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });
        }
    }
}

exports.logIn = logIn;
exports.logOut = logOut;