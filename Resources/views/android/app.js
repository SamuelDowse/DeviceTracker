/**
 * Set up the UI for an Android device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginAndroid(){
    var ADD = 1, REFRESH = 2, EDIT = 3, CLEAR = 4;
    var activity = cameraWin.activity;
    
    activity.onCreateOptionsMenu = function(e){
        var menu = e.menu;
        
        var addDevice = menu.add({title: "Add Device", itemId: ADD});
        addDevice.addEventListener("click", function(e) {
            devicePlatformValue.setValue(null);
            deviceOSValue.setValue(null);
            deviceModelValue.setValue(null);
            deviceNameValue.setValue(null);
            deviceIMEIValue.setValue(null);
            cameraWin.add(addWindow);
            addPage = true;
            scannerFile.closeScanner();
        });
        
        var refreshDevices = menu.add({title: "Refresh Devices", itemId: REFRESH});
        refreshDevices.addEventListener("click", function(e) {
            deviceFunctions.getPlatforms();
            deviceFunctions.getDevices();
        });
        
        var editDevice = menu.add({title: "Edit Device", itemId: EDIT});
        editDevice.addEventListener("click", function(e) {
            cameraWin.add(editWindow);
            editPage = true;
            scannerFile.closeScanner();
        });
        
        var clearScanned = menu.add({title: "Clear Scanned", itemId: CLEAR});
        clearScanned.addEventListener("click", function(e) {
            scannedDevices = [];
            scannedUsers = [];
            uniqueDevices = [];
            scanned = false;
            cameraWin.activity.invalidateOptionsMenu();
        });
        
    };
    
    activity.onPrepareOptionsMenu = function(e) {
        var menu = e.menu;
        menu.findItem(ADD).setVisible(admin && listPage);
        menu.findItem(REFRESH).setVisible(listPage || listPageTwo);
        menu.findItem(EDIT).setVisible(admin && devicePage);
        menu.findItem(CLEAR).setVisible(!devicePage && !listPage && !addPage && !editPage && scanned);
    };
    
    takePhoto.addEventListener('singletap', function (){
        deviceFunctions.addPicture();
    });
    
    upload.addEventListener('singletap', function() {
        deviceFunctions.uploadDevice();
        scannerFile.openScanner();
    });
    
    save.addEventListener('singletap', function() {
        deviceFunctions.saveDevice();
    });
    
    deleteDevice.addEventListener('singletap', function() {
        deviceFunctions.deleteDevice();
    });
    
    deviceList.addEventListener('singletap', function(e){
        deviceFunctions.selectDevice(e);
    });
    
    deviceList.addEventListener('longpress', function(e){
        deviceFunctions.deletePlatform(e);
    });
}

exports.beginAndroid = beginAndroid;
