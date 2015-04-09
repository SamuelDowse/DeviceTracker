function androidStartScanner(){
	cameraWin.removeEventListener('androidback', closeDeviceWin);
    cameraWin.activity.invalidateOptionsMenu();
    openScanner();
}

var closeDeviceWin = function() {
    if (listPage){
    	cameraWin.remove(deviceWin);
    	androidStartScanner();
    	listPage = false;
    }
    if (listPageTwo) {
    	deviceList.setData(platforms);
    	listPageTwo = false;
    	listPage = true;
    }
    if (devicePage){
    	var selectedPlatform = [];
        for (var a = 0; a < devices.length; a++){
            if (devices[a].platform == androidCurrentPlatform){
                selectedPlatform.push(devices[a]);
            }
        }
        deviceList.setData(selectedPlatform);
        cameraWin.remove(deviceWindow);
        devicePage = false;
        listPageTwo = true;
    }
    if (addPage){
    	openScanner();
    	cameraWin.remove(addWindow);
    	androidStartScanner();
    	addPage = false;
    }
    if (editPage){
    	openScanner();
    	cameraWin.remove(editWindow);
    	androidStartScanner();
    	editPage = false;
    }
    if (loginPage){
    	cameraWin.remove(loginWindow);
    	androidStartScanner();
    	loginPage = false;
    }
};

function setActionListeners(){
    login.addEventListener('singletap', function() {
        if (Ti.Platform.osname == 'android'){
            cameraWin.addEventListener('androidback', closeDeviceWin);
        }
        userLog.logIn();
        closeScanner();
    });
    
    logout.addEventListener('singletap', function() {
        userLog.logOut();
    });
    
    checkout.addEventListener('singletap', function() {
        uniqueDevices = scannedDevices.filter(function(elem, pos) {
        	return scannedDevices.indexOf(elem) == pos;
        });
        scannedDevices = [];
        scanned = false;
        if (Ti.Platform.osname == 'android'){
        	cameraWin.activity.invalidateOptionsMenu();
        }
        loggedIn ? deviceFunctions.checkoutDeviceLoggedIn() : deviceFunctions.checkoutDeviceNotLoggedIn();
    });
    
    clear.addEventListener('singletap', function(){
        if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
            cameraWin.setRightNavButton(blank);
        }
        scannedDevices = [];
        uniqueDevices = [];
        scannedUsers = [];
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
        closeScanner();
    });
    
    cameraWin.addEventListener('focus', function(){
        devices = [];
        platforms = [];
        uniquePlatforms = [];
        deviceFunctions.getPlatforms();
        deviceFunctions.getDevices();
    });
}
    
function openScanner(){
    picker = scanditsdk.createView({
    	width:'100%',
    	height:'100%'
    });
    picker.init('9VYuOmbDEeOdM21j18UUIGKVF9o+PtHC5XrXuXYCmjQ', 0);
    picker.showSearchBar(false);
    
    picker.setSuccessCallback(function(e) {
        JSON.parse(e.barcode).object == 'device' ? scannedDevices.push(JSON.parse(e.barcode).id) : scannedUsers.push(JSON.parse(e.barcode).id);
        Ti.Platform.osname == 'android' ? cameraWin.activity.invalidateOptionsMenu() : cameraWin.setRightNavButton(clear);
        scanned = true;
        Ti.Media.vibrate();
    });
    picker.setCancelCallback(function(e) {
    	closeScanner();
    });
    
    !loggedIn ? picker.add(login) : picker.add(logout);
    picker.add(checkout);
    picker.add(listDevice);
    cameraWin.add(picker);
    picker.startScanning();
}

function closeScanner(){
    if (picker != null){
    	picker.stopScanning();
    }
    !loggedIn ? picker.remove(login) : picker.remove(logout);
    picker.remove(checkout);
    picker.remove(listDevice);
    cameraWin.remove(picker);
}

exports.setActionListeners = setActionListeners;
exports.openScanner = openScanner;
exports.closeScanner = closeScanner;
