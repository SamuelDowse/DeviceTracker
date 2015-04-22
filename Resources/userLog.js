/**
 * Open a window to allow the user to input their log in details.
 * If the log in details are correct, close the log in window.
 * If the log in details are incorrect, display an error message.
 */
function logIn(){
    loginPage = true;
    userName.setValue(null);
    userPassword.setValue(null);
    scannerFile.closeScanner();
    cameraWin.add(loginWindow);
    
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
                login.setBackgroundImage('assets/logout.png');
                scannerFile.openScanner();
                loginPage = false;
                cameraWin.remove(loginWindow);
            } else {
                alert('Incorrect Username/Password');
            }
        });
    });
    
    cancelButton.addEventListener("click", function() {
        scannerFile.openScanner();
        loginPage = false;
        cameraWin.remove(loginWindow);
    });
}

/**
 * If a user is logged in and this method is called, log them out.
 * If a user is not logged in and this method is called, do nothing.
 */
function logOut(){
    if (loggedIn == true){
        Cloud.Users.logout(function (e) {
            if (e.success) {
                login.setBackgroundImage('assets/login.png');
                loggedIn = false;
                admin = false;
                currentUser = null;
                if (Ti.Platform.osname == 'android'){
                    cameraWin.activity.invalidateOptionsMenu();
                }
            } else {
                alert('Failed to log out user!');
            }
        });
    }
}

exports.logIn = logIn;
exports.logOut = logOut;