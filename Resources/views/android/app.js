function beginAndroid(){
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
	closeAddWindow.addEventListener('singletap', function() {
		deviceWin.remove(addWindow);
		//deviceWin.setLeftNavButton(blank);
		//deviceWin.setRightNavButton(add);
	});
	edit.addEventListener('singletap', function() {
		deviceWin.add(editWindow);
		//deviceWin.setLeftNavButton(backToDevice);
		//deviceWin.setRightNavButton(save);
	});
	add.addEventListener('singletap', function() {
		devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
		deviceModelValue.setValue(null); deviceNameValue.setValue(null);
		deviceIMEIValue.setValue(null); deviceWin.add(addWindow);
		//deviceWin.setLeftNavButton(closeAddWindow);
		//deviceWin.setRightNavButton(upload);
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

exports.beginAndroid = beginAndroid;
