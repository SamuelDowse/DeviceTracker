var closeDeviceWin = function() {
    if (listPage == true) cameraWin.remove(deviceWin);
    if (devicePage == true) cameraWin.remove(deviceWindow);
    if (addPage == true) cameraWin.remove(addWindow);
    if (editPage == true) cameraWin.remove(editWindow);
    if (loginPage == true) cameraWin.remove(loginWindow);
    addPage = false; devicePage = false; editPage = false; listPage = false; loginPage = false;
    deviceList.setData(platforms);
    cameraWin.removeEventListener('androidback', closeDeviceWin);
    cameraWin.activity.invalidateOptionsMenu();
    picker.startScanning();
};

function setActionListeners(){
    login.addEventListener('singletap', function() {
        cameraWin.addEventListener('androidback', closeDeviceWin);
        userLog.logIn();
        picker.stopScanning();
    });
    
    logout.addEventListener('singletap', function() {
        userLog.logOut();
    });
    
    checkout.addEventListener('singletap', function() {
        uniqueDevices = scannedDevices.filter(function(elem, pos) { return scannedDevices.indexOf(elem) == pos; });
        scannedDevices = []; scanned = false;
        if (Ti.Platform.osname == 'android') cameraWin.activity.invalidateOptionsMenu();
        ((loggedIn) ? deviceFunctions.checkoutDeviceLoggedIn() : deviceFunctions.checkoutDeviceNotLoggedIn());
    });
    
    clear.addEventListener('singletap', function(){
        if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad')
            cameraWin.setRightNavButton(blank);
        scannedDevices = []; uniqueDevices = [];
    });
    
    listDevice.addEventListener('singletap', function() {
        deviceList.setData(platforms);
        deviceWin.add(deviceList);
        cameraWin.add(deviceWin);
        if (Ti.Platform.osname == 'android') {
            cameraWin.addEventListener('androidback', closeDeviceWin);
            cameraWin.activity.invalidateOptionsMenu();
        } else {
            cameraWin.setLeftNavButton(backToCamera);
        }
        listPage = true;
        picker.stopScanning();
    });
    
    cameraWin.addEventListener('focus', function(){
        devices = []; platforms = []; uniquePlatforms = [];
        // Obtain all platforms
        deviceFunctions.getPlatforms();
        // Obtain all devices
        deviceFunctions.getDevices();
    });
}
    
function openScanner(){
    picker = scanditsdk.createView({width:'100%', height:'100%'});
    picker.init('9VYuOmbDEeOdM21j18UUIGKVF9o+PtHC5XrXuXYCmjQ', 0);
    picker.showSearchBar(false);
    
    picker.setSuccessCallback(function(e) {
        ((JSON.parse(e.barcode).object == 'device') ? scannedDevices.push(JSON.parse(e.barcode).id) : scannedUsers.push(JSON.parse(e.barcode).id));
        ((Ti.Platform.osname == 'android') ? cameraWin.activity.invalidateOptionsMenu() : cameraWin.setRightNavButton(clear));
        scanned = true; Ti.Media.vibrate();
    });
    picker.setCancelCallback(function(e) { closeScanner(); });
    
    ((!loggedIn) ? picker.add(login) : picker.add(logout));
    picker.add(checkout); picker.add(listDevice); cameraWin.add(picker);
    picker.startScanning();
}

function closeScanner(){
    if (picker != null) picker.stopScanning();
    ((!loggedIn) ? picker.remove(login) : picker.remove(logout));
    picker.remove(checkout); picker.remove(listDevice); cameraWin.remove(picker);
}

// Export the following functions so they can be used outside of this file
exports.setActionListeners = setActionListeners;
exports.openScanner = openScanner;
exports.closeScanner = closeScanner;
