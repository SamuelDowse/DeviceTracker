var closeDeviceWin = function() {
    if (listPage == true) cameraWin.remove(deviceWin);
    if (devicePage == true) cameraWin.remove(deviceWindow);
    if (addPage == true) cameraWin.remove(addWindow);
    if (editPage == true) cameraWin.remove(editWindow);
    addPage = false; devicePage = false; editPage = false; listPage = false;
    deviceList.setData(platforms);
    picker.startScanning();
    cameraWin.removeEventListener('androidback', closeDeviceWin);
    cameraWin.activity.invalidateOptionsMenu();
    return false;
};

function setActionListeners(){
    login.addEventListener('click', function() {
        userLog.logIn();
        picker.stopScanning();
    });
    
    logout.addEventListener('click', function() {
        userLog.logOut();
    });
    
    checkout.addEventListener('click', function() {
        uniqueDevices = scannedDevices.filter(function(elem, pos) { return scannedDevices.indexOf(elem) == pos; });
        scannedDevices = []; scanned = false;
        if (Ti.Platform.osname == 'android') cameraWin.activity.invalidateOptionsMenu();
        ((loggedIn) ? deviceFunctions.checkoutDevice() : deviceFunctions.logCheckDevice());
    });
    
    clear.addEventListener('click', function(){
        if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad')
            cameraWin.setRightNavButton(blank);
        scannedDevices = []; uniqueDevices = [];
    });
    
    listDevice.addEventListener('click', function() {
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
    picker.showSearchBar(true);
    
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
