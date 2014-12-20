var closeDeviceWin = function() {
	if (listPage == true){
		cameraWin.remove(deviceWin);
		listPage = false;
	}
	if (devicePage == true){
		cameraWin.remove(deviceWindow);
		devicePage = false;
	}
	if (addPage == true){
		cameraWin.remove(addWindow);
		addPage = false;
	}
	if (editPage == true){
		cameraWin.remove(editWindow);
		editPage = false;
	}
	deviceList.setData(platforms);
	picker.startScanning();
    cameraWin.removeEventListener('androidback', closeDeviceWin);
    cameraWin.activity.invalidateOptionsMenu();
    return false;
};

function setActionListeners(){
	login.addEventListener('click', function() {
		userLog.logIn();
		picker.stopScanning();
	});
	
	logout.addEventListener('click', function() {
		userLog.logOut();
	});
	
	checkout.addEventListener('click', function() {
		uniqueDevices = scannedDevices.filter(function(elem, pos) { return scannedDevices.indexOf(elem) == pos; });
		if (loggedIn == true)
			checkoutDevice();
		else
			logCheckDevice();
		scannedDevices = [];
	});
	
	clear.addEventListener('click', function(){
		if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
			cameraWin.setRightNavButton(blank);
		}
		scannedDevices = []; uniqueDevices = [];
	});
	
	listDevice.addEventListener('click', function() {
		deviceList.setData(platforms);
		deviceWin.add(deviceList);
		cameraWin.add(deviceWin);
		if (Ti.Platform.osname == 'android')
			cameraWin.addEventListener('androidback', closeDeviceWin);
		else {
			cameraWin.setLeftNavButton(backToCamera);
			cameraWin.activity.invalidateOptionsMenu();
		}
		listPage = true;
		picker.stopScanning();
	});
}
	
function openScanner(){
    picker = scanditsdk.createView({
    	width:'100%',
    	height:'100%'
    });
    picker.init('9VYuOmbDEeOdM21j18UUIGKVF9o+PtHC5XrXuXYCmjQ', 0);
    picker.showSearchBar(true);
    
    picker.setSuccessCallback(function(e) {
    	scannedDevices.push(e.barcode);
    	scanned = true;
    	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad')
    		cameraWin.setRightNavButton(clear);
    	else 
    		cameraWin.activity.invalidateOptionsMenu();
    	Ti.Media.vibrate();
    });
    
    picker.setCancelCallback(function(e) {
    	closeScanner();
    });
	
	if (!loggedIn)
		picker.add(login);
	else
		picker.add(logout);
	picker.add(checkout);
	picker.add(listDevice);
	cameraWin.add(picker);
	
	picker.startScanning();
}

function checkoutDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		for (var a = 0; a < uniqueDevices.length; a++) {
			Cloud.Objects.query({
				classname: 'Device',
				where: {imei: uniqueDevices[a]}
			}, function (e) {
				if (e.success) {
					for (var i = 0; i < e.Device.length; i++) {
						var device = e.Device[i];
						switch (device.taken_by){
							case currentUser.id:
								Cloud.Objects.update({
									classname: 'Device',
									id: device.id,
									fields: { taken_by: null }
								}, function (e) {
									if (e.success) {
										var unlinkDialog = Ti.UI.createAlertDialog({
											message: 'Unlinking Device:\n'+device.model+' ('+device.platform+')\nfrom:\n'+currentUser.first_name+' '+currentUser.last_name
											});
										unlinkDialog.show();
									} else {
										alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
									}
								});
								break;
							default:
								Cloud.Objects.update({
									classname: 'Device',
									id: device.id,
									fields: { taken_by: currentUser.id }
								}, function (e) {
									if (e.success) {
										var linkDialog = Ti.UI.createAlertDialog({
											message: 'Linking Device:\n'+device.model+' ('+device.platform+')\nto:\n'+currentUser.first_name+' '+currentUser.last_name
										});
										linkDialog.show();
									} else {
										alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
									}
								});
								break;
						}
	        		}
	    		}
			});
		}
		scannedDevices = null; uniqueDevices = null;
	}
}

function logCheckDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Users.login({login:'assigner', password:'tester'}, function (e) { 
			if (e.success) {
				loggedIn = true;
				Cloud.Users.query({
				    where:{id: uniqueDevices[0]}
				}, function (e) {
				    if (e.success) {
				    	var user = e.users[0];
				    	for (var a = 1; a < uniqueDevices.length; a++) {
							Cloud.Objects.query({
								classname: 'Device',
								where: {imei: uniqueDevices[a]}
							}, function (e) {
								if (e.success) {
									for (var i = 0; i < e.Device.length; i++) {
										var device = e.Device[i];
										switch (device.taken_by){
											case user.id:
												Cloud.Objects.update({
													classname: 'Device',
													id: device.id,
													fields: {taken_by:null}
												}, function (e) {
													if (e.success) {
														var unlinkDialog = Ti.UI.createAlertDialog({
															message: 'Unlinking Device:\n'+device.model+' ('+device.platform+')\nfrom:\n'+user.first_name+' '+user.last_name
														});
														unlinkDialog.show();
													} else {
														alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
													}
												});
												break;
											default:
												Cloud.Objects.update({
													classname: 'Device',
													id: device.id,
													fields: { taken_by:uniqueDevices[0]}
												}, function (e) {
													if (e.success) {
														var linkDialog = Ti.UI.createAlertDialog({
															message: 'Linking Device:\n'+device.model+' ('+device.platform+')\nto:\n'+user.first_name+' '+user.last_name
														});
														linkDialog.show();
													} else {
														alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
													}
												});
												break;
										}
					        		}
					        		Cloud.Users.logout(function (e) {
					        			loggedIn = false;
					        		});
					    		}
							});
						}
				    } else {
				    	for (var a = 0; a < uniqueDevices.length; a++) {
				    		Cloud.Objects.query({
								classname: 'Device',
								where: {imei: uniqueDevices[a]}
							}, function (e) {
								if (e.success) {
									for (var i = 0; i < e.Device.length; i++) {
										var device = e.Device[i];
										Cloud.Objects.update({
											classname: 'Device',
											id: device.id,
											fields: {taken_by:null}
										}, function (e) {
											if (e.success) {
												var unlinkDialog = Ti.UI.createAlertDialog({
													message: 'Unlinking Device From User'
												});
												unlinkDialog.show();
											} else {
												alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
											}
										});
					        		}
					    		}
							});
						}
				    }
				});
			}
		});
		scannedDevices = null; uniqueDevices = null;
	}
}

function closeScanner(){
	if (picker != null) 
		picker.stopScanning();
	if (!loggedIn)
		picker.remove(login);
	else
		picker.remove(logout);
	picker.remove(checkout);
	picker.remove(listDevice);
	cameraWin.remove(picker);
}

// Export the following functions so they can be used outside of this file
exports.setActionListeners = setActionListeners;
exports.openScanner = openScanner;
exports.closeScanner = closeScanner;
