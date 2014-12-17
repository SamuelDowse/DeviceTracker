function beginAndroid(){
	// var backToPlatforms		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		// backToDevices		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		// backToDevice			= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		// closeAddWindow		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		// edit					= Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'}),
		// add					= Ti.UI.createButton({title:'Add', color:'white', backgroundImage:'none'}),
		// save					= Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'}),
		// upload				= Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'}),
		// takePhoto			= Ti.UI.createButton({title:'Take Photo of Device', top:15, font:{fontSize:18}}),
		// editWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
		// addWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
		// deleteDevice			= Ti.UI.createLabel({backgroundColor:'#B50D00', text:'DELETE', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, color:'white', top:'15%', width:'50%', height:'10%'}),
	// 
	deviceWindow.add(deviceImage);
	deviceWindow.add(deviceInfo);
	// takePhoto.addEventListener('click', function (evt){
		// deviceFunctions.addPicture(evt);
	// });
	// 
	// //-- EDIT DEVICE WINDOW--\\
	// editWindow.add(devicePlatformValue);
	// editWindow.add(deviceOSValue);
	// editWindow.add(deviceModelValue);
	// editWindow.add(deviceNameValue);
	// editWindow.add(deviceIMEIValue);
	// editWindow.add(takePhoto);
	// editWindow.add(deleteDevice);
	// //--EDIT DEVICE WINDOW--\\
	// //--ADD DEVICE WINDOW--\\
	// addWindow.add(devicePlatformValue);
	// addWindow.add(deviceOSValue);
	// addWindow.add(deviceModelValue);
	// addWindow.add(deviceNameValue);
	// addWindow.add(deviceIMEIValue);
	// addWindow.add(takePhoto);
	// //--ADD DEVICE WINDOW--\\
	
	// save.addEventListener('singletap', function() {
		// deviceFunctions.saveDevice();
	// });
	// backToPlatforms.addEventListener('singletap', function() {
		// deviceList.setData(platforms);
		// //deviceWin.setLeftNavButton(blank);
		// //if(admin == true) deviceWin.setRightNavButton(add); else deviceWin.setRightNavButton(blank);
	// });
	// backToDevices.addEventListener('singletap', function() {
		// deviceWin.remove(deviceWindow);
		// //deviceWin.setLeftNavButton(backToPlatforms);
		// //deviceWin.setRightNavButton(blank);
	// });
	// backToDevice.addEventListener('singletap', function() {
		// deviceWin.remove(editWindow);
		// //deviceWin.setLeftNavButton(backToDevices);
		// //deviceWin.setRightNavButton(edit);
	// });
	// closeAddWindow.addEventListener('singletap', function() {
		// deviceWin.remove(addWindow);
		// //deviceWin.setLeftNavButton(blank);
		// //deviceWin.setRightNavButton(add);
	// });
	// edit.addEventListener('singletap', function() {
		// deviceWin.add(editWindow);
		// //deviceWin.setLeftNavButton(backToDevice);
		// //deviceWin.setRightNavButton(save);
	// });
	// add.addEventListener('singletap', function() {
		// devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
		// deviceModelValue.setValue(null); deviceNameValue.setValue(null);
		// deviceIMEIValue.setValue(null); deviceWin.add(addWindow);
		// //deviceWin.setLeftNavButton(closeAddWindow);
		// //deviceWin.setRightNavButton(upload);
	// });
	// upload.addEventListener('singletap', function() {
		//deviceFunctions.uploadDevice();
	// });
	// deleteDevice.addEventListener('singletap', function() {
		//deviceFunctions.deleteDevice();
	// });
	deviceList.addEventListener('singletap', function(e){
		deviceFunctions.selectDevice(e);
	});
	deviceList.addEventListener('longpress', function(e){
		deviceFunctions.deletePlatform(e);
	});
}

exports.beginAndroid = beginAndroid;
