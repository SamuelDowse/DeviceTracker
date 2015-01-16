/**
 * Set up the UI for an iOS device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginiOS(){
	// If the user clicks the takePhoto button
	takePhoto.addEventListener('click', function (evt){
		// Run the addPicture function
		deviceFunctions.addPicture(evt);
	});
	
	// If the user clicks the save button
	save.addEventListener('singletap', function() {
		// Run hte saveDevice function
		deviceFunctions.saveDevice();
	});
	
	// If the user clicks the backToPlatforms button
	backToPlatforms.addEventListener('singletap', function() {
		// Populate the deviceList with all platforms
		deviceList.setData(platforms);
		// Set the leftNavButton to the backToCamera
		cameraWin.setLeftNavButton(backToCamera);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the add button
			cameraWin.setRightNavButton(add);
		else
			// Set the rightNavButton to be blank
			cameraWin.setRightNavButton(blank);
	});
	
	// If the user clicks the backToPlatforms button
	backToCamera.addEventListener('singletap', function() {
		// Populate the deviceList with all platforms
		deviceList.setData(platforms);
		// Set the leftNavButton to be blank
		cameraWin.setLeftNavButton(blank);
		// Set the rightNavButton to be blank
		cameraWin.setRightNavButton(blank);
	});
	
	// If the user clicks the backToDevices button
	backToDevices.addEventListener('singletap', function() {
		// Remove the deviceWindow view
		cameraWin.remove(deviceWindow);
		// Set the leftNavButton to the backToPlatforms button
		cameraWin.setLeftNavButton(backToPlatforms);
		// Set the rightNavButton to be blank
		cameraWin.setRightNavButton(blank);
	});
	
	// If the user clicks the backToDevice button
	backToDevice.addEventListener('singletap', function() {
		// Remove the editWindow view
		cameraWin.remove(editWindow);
		// Set the leftNavButton to the backToDevices button
		cameraWin.setLeftNavButton(backToDevices);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the edit button
			cameraWin.setRightNavButton(edit);
		else
			// Set the rightNavButton to be blank
			cameraWin.setRightNavButton(blank);
	});
	
	// If the user clicks the closeAddWindow button
	closeAddWindow.addEventListener('singletap', function() {
		// Remove the adddWindow view
		cameraWin.remove(addWindow);
		// Set the leftNavButton to be blank
		cameraWin.setLeftNavButton(blank);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the add button
			cameraWin.setRightNavButton(add);
		else
			// Set the rightNavButton to be blank
			cameraWin.setRightNavButton(blank);
	});
	
	// If the user clicks the edit button
	edit.addEventListener('singletap', function() {
		// Show the editWindow button
		cameraWin.add(editWindow);
		// Set the leftNavButton to the backToDevice button
		cameraWin.setLeftNavButton(backToDevice);
		// Set the rightNavButton to the save button
		cameraWin.setRightNavButton(save);
	});
	
	// If the user clicks the add button
	add.addEventListener('singletap', function() {
		// Set all the textfields to blank and display the addWindow
		devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
		deviceModelValue.setValue(null); deviceNameValue.setValue(null);
		deviceIMEIValue.setValue(null); cameraWin.add(addWindow);
		// Set the leftNavButton to the closeAddWindow button
		cameraWin.setLeftNavButton(closeAddWindow);
		// Set the rightNavButton to the upload button
		cameraWin.setRightNavButton(upload);
	});
	
	// If the user clicks the upload button
	upload.addEventListener('singletap', function() {
		// Run the uploadDevice function
		deviceFunctions.uploadDevice();
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
exports.beginiOS = beginiOS;
