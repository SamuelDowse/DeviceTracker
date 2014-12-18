/**
 * Set up the UI for an Android device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginAndroid(){
	var ADD = 1, REFRESH = 2;
	
	var activity = cameraWin.activity;
	activity.onCreateOptionsMenu = function(e){
		var menu = e.menu;
		var addDevice = menu.add({title: "Add Device", itemId: ADD});
		addDevice.addEventListener("click", function(e) {
			cameraWin.add(addWindow);
			picker.stopScanning();
		});
		var refreshDevices = menu.add({title: "Refresh Devices", itemId: REFRESH});
		refreshDevices.addEventListener("click", function(e) {
			deviceFunctions.getPlatforms();
		});
	};
	
	activity.onPrepareOptionsMenu = function(e) {
		var menu = e.menu;
		menu.findItem(ADD).setVisible(admin);
		menu.findItem(REFRESH).setVisible(true);
	};
	
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
	addWindow.add(save);
	//--ADD DEVICE WINDOW--\\
	
	// Add the deviceImage to the deviceWindow
	deviceWindow.add(deviceImage);
	// Add the deviceInfo to the deviceWindow
	deviceWindow.add(deviceInfo);
	
	// If the user clicks the takePhoto button
	takePhoto.addEventListener('click', function (evt){
		scannerFile.closeScanner();
		// Run the addPicture function
		deviceFunctions.addPicture(evt);
	});
	
	// If the user clicks the save button
	save.addEventListener('singletap', function() {
		scannerFile.openScanner();
		// Run hte saveDevice function
		deviceFunctions.uploadDevice();
	});
	
	// If the user clicks the edit button
	edit.addEventListener('singletap', function() {
		// Show the editWindow button
		cameraWin.add(editWindow);
	});
	
	// If the user taps on the deviceList
	deviceList.addEventListener('singletap', function(e){
		// Run the selectDevice function
		deviceFunctions.selectDevice(e);
	});
	
	// If the user holds an item on the deviceList
	deviceList.addEventListener('longpress', function(e){
		// Run the deletePlatform function
		deviceFunctions.deletePlatform(e);
	});
}

// Export the following functions so they can be used outside of this file
exports.beginAndroid = beginAndroid;
