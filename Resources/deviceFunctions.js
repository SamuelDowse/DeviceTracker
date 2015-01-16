function addPicture(evt){
	Ti.Media.showCamera({
		success:function(e){photo = e.media;},
		cancel:function(){},
		error:function(error){
			var a = Ti.UI.createAlertDialog({title:'Error Occurred'});
			((error.code = Ti.Media.NO_CAMERA) ? a.setMessage('Device Tracker is unable to connect to your camera, do you have one?') : a.setMessage('Unexpected error: ' + error.code));
			a.show();
		}
	});
}

function call(method, url, data, callback){
	var xhr = new XMLHttpRequest(),
	queryString = '&';
	
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4){
			try {
				var data = JSON.parse(xhr.responseText);
			} catch(error) {
				var err = new Error((xhr.responseText ? 'Invalid' : 'Empty') + ' response from server.');
				err.originalMessage = error.message;
				err.responseText = xhr.responseText;
				err.status = xhr.status;
				callback(err);
				return;
			}
			data.success = data.meta.success;
			callback(null, data);
		}
	};
	
	if(method == 'GET' || method == 'DELETE'){
		for(var field in data){
			queryString += encodeURIComponent(field) + '=';
			var value = typeof data[field] == 'object' ? JSON.stringify(data[field]) : data[field];
			queryString += encodeURIComponent(value) + '&';
		}
		data = null;
	} else {
		data = JSON.stringify(data);
	}
	
	xhr.open(method, "https://api.cloud.appcelerator.com/v1/"+url+".json?key=TIRHj6F5MQOuR1BYba7GdnJOAOq6IaP3"+queryString);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.send(data);
}

function checkoutDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		for (var a = 0; a < uniqueDevices.length; a++){
			for (b = 0; b < devices.length; b++){
				if (devices[b].imei == uniqueDevices[a]){
					currentDevice = devices[b];
					switch (currentDevice.taken_by){
						case currentUser.id:
							Cloud.Objects.update({
								classname: 'Device',
								id: currentDevice.id,
								fields: { taken_by: null }
							}, function (e) {
								if (e.success) {
									var unlinkDialog = Ti.UI.createAlertDialog({
										message: 'Unlinking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nfrom:\n'+currentUser.first_name+' '+currentUser.last_name
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
								id: currentDevice.id,
								fields: { taken_by: currentUser.id }
							}, function (e) {
								if (e.success) {
									var linkDialog = Ti.UI.createAlertDialog({
										message: 'Linking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nto:\n'+currentUser.first_name+' '+currentUser.last_name
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
		}
		uniqueDevices = []; getPlatforms(); getDevices();
	}
}

function deleteDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.remove({
			classname:'Device',
			id:deviceIDValue
		}, function (e) {
			if (e.success) {
				cameraWin.remove(editWindow);
				cameraWin.remove(deviceWindow);
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					cameraWin.setLeftNavButton(backToPlatforms);
					cameraWin.setRightNavButton(blank);
				}
			} else {
				alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});
	}
}

function deletePlatform(e){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		if (e.rowData != null){
			var platformToRemove = e.rowData.id;
			if (e.rowData.platform == true){
				if(admin == true){
					var dialog = Ti.UI.createAlertDialog({
						cancel:1,
						buttonNames:['Confirm', 'Cancel'],
						message:'Are you sure you want to delete this platform?',
						title:'Delete'
					});
					dialog.addEventListener('click', function(e){
						if (e.index != e.source.cancel){
							Cloud.Objects.remove({
								classname:'Platforms',
								id:platformToRemove
							}, function (e) {
								((e.success) ? platformToRemove = "" : alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))));
							});
						}
					});
					dialog.show();
				}
			}
		}
	}
}

function getPlatforms() {
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		platforms = [];
		uniquePlatforms = [];
		Cloud.Objects.query({
			classname:'Platforms',
			order:'platform'
		}, function (e) {
			for (var i = 0; i < e.Platforms.length; i++) {
				var devPlat = e.Platforms[i];
				if (e.success){
					platforms.push({title:devPlat.platform, name:devPlat.platform, color:'white', platform:true, id:devPlat.id});
				}
			}
			uniquePlatforms = platforms.filter(function(elem, pos) { return platforms.indexOf(elem) == pos; });
			deviceList.setData(uniquePlatforms);
		});
	}
}

function getDevices() {
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		devices = [];
		Cloud.Objects.query({
			classname:'Device',
			order:'osver, model'
		}, function (e) {
			for (var i = 0; i < e.Device.length; i++) {
				var device = e.Device[i];
				if (e.success){
					devices.push({
						title:device.model+' ('+device.osver+')',
						model:device.model,
						name:device.name,
						imei:device.imei,
						platform:device.platform,
						osver:device.osver,
						takenBy:device.taken_by,
						image:device.photo,
						id:device.id,
						color:'white'
					});
				}
			}
			
		});
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
						for (var a = 1; a < uniqueDevices.length; a++){
							for (b = 0; b < devices.length; b++){
								if (devices[b].imei == uniqueDevices[a]){
									currentDevice = devices[b];
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
							}
						}
					} else {
						for (var a = 0; a < uniqueDevices.length; a++){
							for (b = 0; b < devices.length; b++){
								if (devices[b].imei == uniqueDevices[a]){
									currentDevice = devices[b];
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
						}
					}
					Cloud.Users.logout(function (e) {
						loggedIn = false;
					});
				});
			} else {
				alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});
		uniqueDevices = []; getPlatforms(); getDevices();
	}
}

function saveDevice(){
	Cloud.Objects.update({
		classname:'Device',
		id:deviceIDValue,
		photo:photo,
		fields:{
			platform:devicePlatformValue.value,
			osver:deviceOSValue.value,
			model:deviceModelValue.value,
			name:deviceNameValue.value,
			imei:deviceIMEIValue.value
		}
	}, function (e) {
		if (e.success){
			cameraWin.remove(editWindow);
			if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
				cameraWin.setLeftNavButton(backToDevices);
				((admin == true) ? cameraWin.setRightNavButton(edit) : cameraWin.setRightNavButton(blank));
			}
		} else {
			alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		}
	});
	photo = null;
}

function selectDevice(e){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		if (e.rowData != null){
			if (e.rowData.platform == true){
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
				    cameraWin.setLeftNavButton(backToPlatforms);
				    cameraWin.setRightNavButton(blank);
				}
				var selectedPlatform = [];
				for (var a = 0; a < devices.length; a++){
					if (devices[a].platform == e.rowData.name){
						selectedPlatform.push(devices[a]);
					}
				}
				deviceList.setData(selectedPlatform);
			} else {
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					cameraWin.setLeftNavButton(backToDevices);
					((admin == true) ? cameraWin.setRightNavButton(edit) : cameraWin.setRightNavButton(blank));
				}
				if (e.rowData.takenBy != undefined){
					Cloud.Users.query({
						where:{ id:e.rowData.takenBy }
					}, function (a) {
						var takenBy = a.users[0];
			    		if (a.success){
			    			var takenByID = e.rowData.takenBy;
							deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nTaken By: '+takenBy.first_name+' '+takenBy.last_name);
						}
					});
				} else {
					var takenByID = null;
					deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nNot In Use');
				}
				Cloud.Users.query({
					where:{ id:takenByID }
				}, function (a) {
					if (a.success){
						devicePage = true;
						var deviceImageURL = ((e.rowData.image != null) ? (Ti.Platform.osname == 'ipad' ? e.rowData.image.urls['original'] : e.rowData.image.urls['small_240']) : "assets/nodevice.png");
						deviceImage.setImage(deviceImageURL);
						devicePlatformValue.setValue(e.rowData.platform);
						deviceOSValue.setValue(e.rowData.osver);
						deviceModelValue.setValue(e.rowData.model);
						deviceNameValue.setValue(e.rowData.name);
						deviceIMEIValue.setValue(e.rowData.imei);
						deviceIDValue = e.rowData.id;
						cameraWin.add(deviceWindow);
						cameraWin.remove(deviceWin);
						if (Ti.Platform.osname == 'android')
							cameraWin.activity.invalidateOptionsMenu();
					}
				});
			}
		}
	}
}

function uploadDevice(){
		if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.create({
			classname:'Device',
			acl_name:'AllAccess',
			photo:photo,
			fields:{
		        name:deviceNameValue.value,
		        platform:devicePlatformValue.value,
		        model:deviceModelValue.value,
		        osver:deviceOSValue.value,
		        imei:deviceIMEIValue.value
		    }
		}, function (e) {
			if (e.success){
				cameraWin.remove(addWindow);
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					cameraWin.setLeftNavButton(blank);
					if(admin == true)
						cameraWin.setRightNavButton(add);
					else
						cameraWin.setRightNavButton(blank);
				}
			} else {
				alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});
		photo = null;
		if ( currentPlatforms.indexOf(devicePlatformValue.value) > -1 ){
			Ti.API.info("OS already exists, ignoring creation of OS in ACS");
		} else {
			Cloud.Objects.create({
				classname:'Platforms',acl_name:'AllAccess',fields:{platform:devicePlatformValue.value}
			}, function (e) {
				if (!e.success)
					alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			});
		}
	}
}

// Export the following functions so they can be used outside of this file
exports.addPicture = addPicture;
exports.call = call;
exports.checkoutDevice = checkoutDevice;
exports.deleteDevice = deleteDevice;
exports.deletePlatform = deletePlatform;
exports.getPlatforms = getPlatforms;
exports.getDevices = getDevices;
exports.logCheckDevice = logCheckDevice;
exports.saveDevice = saveDevice;
exports.selectDevice = selectDevice;
exports.uploadDevice = uploadDevice;