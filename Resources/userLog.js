/**
 * Open a window to allow the user to input their log in details.
 * If the log in details are correct, close the log in window.
 * If the log in details are incorrect, display an error message.
 */
function logIn(){
    // Check the internet connection
    if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
        // Set the loginPage variable to true
        loginPage = true;
        // If the log in button is clicked
        loginButton.addEventListener("click", function() {
            // Run the ACS log in method
            Cloud.Users.login({
                // Send the username from the username textfield
                login: userName.value,
                // Send the password from the password textfield
                password: userPassword.value
            }, function (e) {
                // If the log in details are correct
                if (e.success) {
                    currentUser = e.users[0];
                    // Set the loggedIn variable to true
                    loggedIn = true;
                    // Set the admin variable to true, if the user is an admin
                    if (e.users[0].admin == 'true'){
                        admin = true;
                        if (Ti.Platform.osname == 'android')
                            cameraWin.activity.invalidateOptionsMenu();
                    }
                    // Remove the login button from the picker overlay
                    picker.remove(login);
                    // Add the logout button to the picker overlay
                    picker.add(logout);
                    // Remove the loginWindow from the cameraWin
                    cameraWin.remove(loginWindow);
                    // Start the scanner again
                    picker.startScanning();
                } else {
                    // Alert the user of incorrect log in details
                    alert('Incorrect Username/Password');
                }
            });
        });
        
        // If the cancel button is clicked
        cancelButton.addEventListener("click", function() {
            // Remove the loginWindow from the cameraWin
            cameraWin.remove(loginWindow);
            // Start the scanner again
            picker.startScanning();
        });
        
        // Empty the fields of any data
        userName.setValue(null); userPassword.setValue(null);
        // Add the userName textfield to the loginWindow
        loginWindow.add(userName);
        // Add the userPassword textfield to the loginWindow
        loginWindow.add(userPassword);
        // Add the loginButton button to the loginWindow
        loginWindow.add(loginButton);
        // Add the cancelButton button to the loginWindow
        loginWindow.add(cancelButton);
        // Open the loginWindow
        cameraWin.add(loginWindow);
    }
}

/**
 * If a user is logged in and this method is called, log them out.
 * If a user is not logged in and this method is called, do nothing.
 */
function logOut(){
    // Check the internet connection
    if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
        // If a user is logged in
        if (loggedIn == true){
            // Run the ACS logout method
            Cloud.Users.logout(function (e) {
                // If the user is successfully logged out
                if (e.success) {
                    // Remove the logout button from the picker overlay
                    picker.remove(logout);
                    // Add the login button to the picker overlay
                    picker.add(login);
                    // Set the loggedIn variable to false
                    loggedIn = false;
                    // Set the admin variable to false
                    admin = false;
                    // Set the currentUser variable to null
                    currentUser = null;
                    // Refresh the android menu
                    if (Ti.Platform.osname == 'android')
                        cameraWin.activity.invalidateOptionsMenu();
                } else {
                    // Alert the user of any errors
                    alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
                }
            });
        }
    }
}

// Export the following functions so they can be used outside of this file
exports.logIn = logIn;
exports.logOut = logOut;