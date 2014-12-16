var scannedDevices = []; 
function openScanner(){
    picker = scanditsdk.createView({ width:'100%', height:'100%' });
    picker.init('9VYuOmbDEeOdM21j18UUIGKVF9o+PtHC5XrXuXYCmjQ', 0);
    picker.showSearchBar(true);
    picker.setSuccessCallback(function(e) {
    	scannedDevices.push(e.barcode);
    	Ti.Media.vibrate();
    	if (Ti.Platform.osname != 'android') cameraWin.setRightNavButton(clear);
    });
    picker.setCancelCallback(function(e) { closeScanner(); });
	var login = Ti.UI.createButton({backgroundImage:'assets/user.png', bottom:'5%', left:'5%', width:50, height:50}),
		logout = Ti.UI.createButton({backgroundImage:'assets/user.png', bottom:'5%', left:'5%', width:50, height:50}),
		checkout = Ti.UI.createButton({backgroundImage:'assets/capture.png', bottom:'6%', width:60, height:60}),
		listDevice = Ti.UI.createButton({backgroundImage:'assets/list.png', bottom:'5%', right:'5%', width:50, height:50});
	login.addEventListener('click', function() { userLog.logIn(); });
	logout.addEventListener('click', function() { userLog.logOut(); });
	checkout.addEventListener('click', function() {
		uniqueDevices = scannedDevices.filter(function(elem, pos) { return scannedDevices.indexOf(elem) == pos; });
		if (loggedIn == true) checkoutDevice(); else logCheckDevice();
		scannedDevices = [];
	});
	picker.add(login);
	picker.add(checkout);
	picker.add(listDevice);
	cameraWin.add(picker);
	picker.startScanning();
}
function checkoutDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Users.showMe(function (e) {
			if (e.success) {
				var user = e.users[0];
				for (var a = 0; a < uniqueDevices.length; a++) {
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
											fields: { taken_by: null }
										}, function (e) {
											if (e.success) {
												var unlinkDialog = Ti.UI.createAlertDialog({message: 'Unlinking Device:\n'+device.model+' ('+device.platform+')\nfrom:\n'+user.first_name+' '+user.last_name });
												unlinkDialog.show();
											} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
										});
										break;
									default:
										Cloud.Objects.update({
											classname: 'Device',
											id: device.id,
											fields: { taken_by: user.id }
										}, function (e) {
											if (e.success) {
												var linkDialog = Ti.UI.createAlertDialog({message: 'Linking Device:\n'+device.model+' ('+device.platform+')\nto:\n'+user.first_name+' '+user.last_name });
												linkDialog.show();
											} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
										});
										break;
								}
			        		}
			    		}
					});
				}
			}
		});
	}
}
function logCheckDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Users.login({login:'assigner',password:'tester'}, function (e) { 
			if (e.success) {
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
														var unlinkDialog = Ti.UI.createAlertDialog({message: 'Unlinking Device:\n'+device.model+' ('+device.platform+')\nfrom:\n'+user.first_name+' '+user.last_name });
														unlinkDialog.show();
													} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
												});
												break;
											default:
												Cloud.Objects.update({
													classname: 'Device',
													id: device.id,
													fields: { taken_by:uniqueDevices[0]}
												}, function (e) {
													if (e.success) {
														var linkDialog = Ti.UI.createAlertDialog({message: 'Linking Device:\n'+device.model+' ('+device.platform+')\nto:\n'+user.first_name+' '+user.last_name });
														linkDialog.show();
													} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
												});
												break;
										}
					        		}
					        		Cloud.Users.logout(function (e) {});
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
												var unlinkDialog = Ti.UI.createAlertDialog({message: 'Unlinking Device From User' });
												unlinkDialog.show();
											} else { alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); }
										});
					        		}
					    		}
							});
						}
				    }
				});
			}
		});
	}
}
function closeScanner(){
	if (picker != null) picker.stopScanning();
	cameraWin.remove(picker);
}
exports.openScanner = openScanner;
exports.closeScanner = closeScanner;