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
	
	// Add the deviceImage to the deviceWindow
	deviceWindow.add(deviceImage);
	// Add the deviceInfo to the deviceWindow
	deviceWindow.add(deviceInfo);
	
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
		// Set the leftNavButton to be blank
		deviceWin.setLeftNavButton(blank);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the add button
			deviceWin.setRightNavButton(add);
		else
			// Set the rightNavButton to be blank
			deviceWin.setRightNavButton(blank);
	});
	
	// If the user clicks the backToDevices button
	backToDevices.addEventListener('singletap', function() {
		// Remove the deviceWindow view
		deviceWin.remove(deviceWindow);
		// Set the leftNavButton to the backToPlatforms button
		deviceWin.setLeftNavButton(backToPlatforms);
		// Set the rightNavButton to be blank
		deviceWin.setRightNavButton(blank);
	});
	
	// If the user clicks the backToDevice button
	backToDevice.addEventListener('singletap', function() {
		// Remove the editWindow view
		deviceWin.remove(editWindow);
		// Set the leftNavButton to the backToDevices button
		deviceWin.setLeftNavButton(backToDevices);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the edit button
			deviceWin.setRightNavButton(edit);
		else
			// Set the rightNavButton to be blank
			deviceWin.setRightNavButton(blank);
	});
	
	// If the user clicks the closeAddWindow button
	closeAddWindow.addEventListener('singletap', function() {
		// Remove the adddWindow view
		deviceWin.remove(addWindow);
		// Set the leftNavButton to be blank
		deviceWin.setLeftNavButton(blank);
		// If the user is an admin
		if(admin == true)
			// Set the rightNavButton to the add button
			deviceWin.setRightNavButton(add);
		else
			// Set the rightNavButton to be blank
			deviceWin.setRightNavButton(blank);
	});
	
	// If the user clicks the edit button
	edit.addEventListener('singletap', function() {
		// Show the editWindow button
		deviceWin.add(editWindow);
		// Set the leftNavButton to the backToDevice button
		deviceWin.setLeftNavButton(backToDevice);
		// Set the rightNavButton to the save button
		deviceWin.setRightNavButton(save);
	});
	
	// If the user clicks the add button
	add.addEventListener('singletap', function() {
		// Set all the textfields to blank and display the addWindow
		devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
		deviceModelValue.setValue(null); deviceNameValue.setValue(null);
		deviceIMEIValue.setValue(null); deviceWin.add(addWindow);
		// Set the leftNavButton to the closeAddWindow button
		deviceWin.setLeftNavButton(closeAddWindow);
		// Set the rightNavButton to the upload button
		deviceWin.setRightNavButton(upload);
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
