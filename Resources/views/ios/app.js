/**
 * Set up the UI for an iOS device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginiOS(){
	//-- EDIT DEVICE WINDOW--\\
	editWindow.add(devicePlatformValue);
	editWindow.add(deviceOSValue);
	editWindow.add(deviceModelValue);
	editWindow.add(deviceNameValue);
	editWindow.add(deviceIMEIValue);
	editWindow.add(takePhoto);
	editWindow.add(deleteDevice);
	//--EDIT DEVICE WINDOW--\\
	//--ADD DEVICE WINDOW--\\
	addWindow.add(devicePlatformValue);
	addWindow.add(deviceOSValue);
	addWindow.add(deviceModelValue);
	addWindow.add(deviceNameValue);
	addWindow.add(deviceIMEIValue);
	addWindow.add(takePhoto);
	//--ADD DEVICE WINDOW--\\
	
	deviceWindow.add(deviceImage);
	deviceWindow.add(deviceInfo);
	
	takePhoto.addEventListener('click', function (evt){
		deviceFunctions.addPicture(evt);
	});
	save.addEventListener('singletap', function() {
		deviceFunctions.saveDevice();
	});
	backToPlatforms.addEventListener('singletap', function() {
		deviceList.setData(platforms);
		deviceWin.setLeftNavButton(blank);
		if(admin == true) deviceWin.setRightNavButton(add); else deviceWin.setRightNavButton(blank);
	});
	backToDevices.addEventListener('singletap', function() {
		deviceWin.remove(deviceWindow);
		deviceWin.setLeftNavButton(backToPlatforms);
		deviceWin.setRightNavButton(blank);
	});
	backToDevice.addEventListener('singletap', function() {
		deviceWin.remove(editWindow);
		deviceWin.setLeftNavButton(backToDevices);
		deviceWin.setRightNavButton(edit);
	});
	closeAddWindow.addEventListener('singletap', function() {
		deviceWin.remove(addWindow);
		deviceWin.setLeftNavButton(blank);
		deviceWin.setRightNavButton(add);
	});
	edit.addEventListener('singletap', function() {
		deviceWin.add(editWindow);
		deviceWin.setLeftNavButton(backToDevice);
		deviceWin.setRightNavButton(save);
	});
	add.addEventListener('singletap', function() {
		devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
		deviceModelValue.setValue(null); deviceNameValue.setValue(null);
		deviceIMEIValue.setValue(null); deviceWin.add(addWindow);
		deviceWin.setLeftNavButton(closeAddWindow);
		deviceWin.setRightNavButton(upload);
	});
	upload.addEventListener('singletap', function() {
		deviceFunctions.uploadDevice();
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

// Export the following functions so they can be used outside of this file
exports.beginiOS = beginiOS;
