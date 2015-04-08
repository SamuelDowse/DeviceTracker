/**
 * Set up the UI for an iOS device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginiOS(){
    takePhoto.addEventListener('singletap', function (){
        deviceFunctions.addPicture();
    });
    
    save.addEventListener('singletap', function() {
        deviceFunctions.saveDevice();
    });
    
    backToPlatforms.addEventListener('singletap', function() {
        deviceList.setData(platforms);
        cameraWin.setLeftNavButton(backToCamera);
        if(admin){
            cameraWin.setRightNavButton(add);
        } else {
            cameraWin.setRightNavButton(blank);
        }
    });
    
    backToCamera.addEventListener('singletap', function() {
        deviceList.setData(platforms);
        cameraWin.setLeftNavButton(blank);
        cameraWin.setRightNavButton(blank);
    });
    
    backToDevices.addEventListener('singletap', function() {
        cameraWin.remove(deviceWindow);
        cameraWin.setLeftNavButton(backToPlatforms);
        cameraWin.setRightNavButton(blank);
    });
    
    backToDevice.addEventListener('singletap', function() {
        cameraWin.remove(editWindow);
        cameraWin.setLeftNavButton(backToDevices);
        if(admin){
            cameraWin.setRightNavButton(edit);
        } else {
            cameraWin.setRightNavButton(blank);
        }
    });
    
    closeAddWindow.addEventListener('singletap', function() {
        cameraWin.remove(addWindow);
        cameraWin.setLeftNavButton(blank);
        scannerFile.openScanner();
        if(admin){
            cameraWin.setRightNavButton(add);
        } else {
            cameraWin.setRightNavButton(blank);
        }
    });
    
    edit.addEventListener('singletap', function() {
        cameraWin.add(editWindow);
        cameraWin.setLeftNavButton(backToDevice);
        cameraWin.setRightNavButton(save);
    });
    
    add.addEventListener('singletap', function() {
        devicePlatformValue.setValue(null);
        deviceOSValue.setValue(null);
        deviceModelValue.setValue(null);
        deviceNameValue.setValue(null);
        deviceIMEIValue.setValue(null);
        cameraWin.add(addWindow);
        scannerFile.closeScanner();
        cameraWin.setLeftNavButton(closeAddWindow);
        cameraWin.setRightNavButton(upload);
    });
    
    upload.addEventListener('singletap', function() {
        deviceFunctions.uploadDevice();
        scannerFile.openScanner();
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

exports.beginiOS = beginiOS;
