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
			devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
			deviceModelValue.setValue(null); deviceNameValue.setValue(null);
			deviceIMEIValue.setValue(null); cameraWin.add(addWindow);
			addPage = true;
			picker.stopScanning();
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
		});
		var clearScanned = menu.add({title: "Clear Scanned", itemId: CLEAR});
		clearScanned.addEventListener("click", function(e) {
			scannedDevices = []; uniqueDevices = []; scanned = false;
			cameraWin.activity.invalidateOptionsMenu();
		});
	};
	
	activity.onPrepareOptionsMenu = function(e) {
		var menu = e.menu;
		menu.findItem(ADD).setVisible(admin && listPage);
		menu.findItem(REFRESH).setVisible(listPage);
		menu.findItem(EDIT).setVisible(admin && devicePage);
		menu.findItem(CLEAR).setVisible(!devicePage && !listPage && !addPage && !editPage && scanned);
	};
	
	// If the user clicks the takePhoto button
	takePhoto.addEventListener('click', function (evt){
		scannerFile.closeScanner();
		// Run the addPicture function
		deviceFunctions.addPicture(evt);
	});
	
	// If the user clicks the save button
	upload.addEventListener('singletap', function() {
		scannerFile.openScanner();
		// Run hte saveDevice function
		deviceFunctions.uploadDevice();
	});
	
	// If the user clicks the save button
	save.addEventListener('singletap', function() {
		// Run hte saveDevice function
		deviceFunctions.saveDevice();
	});
	
	// If the user clicks the deleteDevice button
	deleteDevice.addEventListener('singletap', function() {
		// Run the deleteDevice function
		deviceFunctions.deleteDevice();
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
