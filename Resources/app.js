var Cloud = require('ti.cloud'),
	admin = false, cameraIndexField, loggedIn = false, picker,
	scanditsdk = require('com.mirasense.scanditsdk'),
	platforms = [], allPlatforms = [], photo = null,
	startupAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:1, duration:1000}),
	endAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:0, duration:1000}),
	updated = Ti.UI.createLabel({backgroundColor:'#303036', borderRadius:15, font:{fontSize:20}, color:'white', bottom:10, opacity:0});

// check for network
if(!Titanium.Network.networkType != Titanium.Network.NETWORK_NONE){
     var alertDialog = Titanium.UI.createAlertDialog({
		title: 'WARNING!',
		message: 'Your device is not online.\nThis app will not work if you aren\'t connected.',
		buttonNames: ['OK']
	});
	alertDialog.show();
}

function getPlatforms() {
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){	
		platforms = []; 
		Cloud.Objects.query({
			classname: 'Device',
			order:'platform',
			per_page:500,
			sel:'{"all":["platform"]}'
		}, function (e) {
			for (var i = 0; i < e.Device.length; i++) {
				var device = e.Device[i];
				if (e.success) allPlatforms.push(device.platform);
			}
			platformTypes = allPlatforms.filter(function(elem, pos) { return allPlatforms.indexOf(elem) == pos; });
			for (var i = 0; i < platformTypes.length; i++) {
				var platformType = platformTypes[i];
				if (e.success){
					platforms.push({title:platformType, name:platformType, color:'white', platform:true});
					deviceList.setData(platforms);
				}
			}
		});
	}
}
	
var login = Ti.UI.createButton({ title:'Log In', color:'white', backgroundImage: 'none' }),
	logout = Ti.UI.createButton({ title:'Log Out', color:'white', backgroundImage: 'none' });
login.addEventListener('click', function() { logIn(); });
logout.addEventListener('click', function() { logOut(); });

//-- START OF SCANNER MODULE SECTION --\\
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
    picker.addEventListener('doubletap', function() {
		uniqueDevices = scannedDevices.filter(function(elem, pos) { return scannedDevices.indexOf(elem) == pos; });
		if (loggedIn == true) checkoutDevice(); else logCheckDevice();
		scannedDevices = [];
		if (Ti.Platform.osname != 'android') cameraWin.setRightNavButton(blank);
	});
	cameraWin.add(picker);
	picker.startScanning();
}

function checkoutDevice(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		Cloud.Users.showMe(function (e) {
			if (e.success) {
				var user = e.users[0];
				for (var a = 0; a < uniqueDevices.length; a++) {
					Cloud.Objects.query({
						classname: 'Device',
						where: { imei: uniqueDevices[a] }
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
											} else { 
												alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
											}
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
			}
		});
	}
}

function logCheckDevice(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		Cloud.Users.login({login:'assigner',password:'tester'}, function (e) { 
			if (e.success) {
				Cloud.Users.query({
				    where:{ id: uniqueDevices[0] }
				}, function (e) {
				    if (e.success) {
				    	var user = e.users[0];
				    	for (var a = 1; a < uniqueDevices.length; a++) {
							Cloud.Objects.query({
								classname: 'Device',
								where: { imei: uniqueDevices[a] }
							}, function (e) {
								if (e.success) {
									for (var i = 0; i < e.Device.length; i++) {
										var device = e.Device[i];
										switch (device.taken_by){
											case user.id:
												Cloud.Objects.update({
													classname: 'Device',
													id: device.id,
													fields: { taken_by:null }
												}, function (e) {
													if (e.success) {
														var unlinkDialog = Ti.UI.createAlertDialog({message: 'Unlinking Device:\n'+device.model+' ('+device.platform+')\nfrom:\n'+user.first_name+' '+user.last_name });
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
														var linkDialog = Ti.UI.createAlertDialog({message: 'Linking Device:\n'+device.model+' ('+device.platform+')\nto:\n'+user.first_name+' '+user.last_name });
														linkDialog.show();
													} else { 
														alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
													}
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
								where: { imei: uniqueDevices[a] }
							}, function (e) {
								if (e.success) {
									for (var i = 0; i < e.Device.length; i++) {
										var device = e.Device[i];
										Cloud.Objects.update({
											classname: 'Device',
											id: device.id,
											fields: { taken_by:null }
										}, function (e) {
											if (e.success) {
												var unlinkDialog = Ti.UI.createAlertDialog({message: 'Unlinking Device From User' });
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
	}
}

function closeScanner(){
	if (picker != null) picker.stopScanning();
	cameraWin.remove(picker);
}

//-- END OF SCANNER MODULE SECTION --\\

function logIn(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		closeScanner();
		var loginWindow = Ti.UI.createWindow({backgroundColor:"white", layout:"vertical"});
		var userName = Ti.UI.createTextField({top:50, autocorrect:false, hintText:'Username'});
		var userPassword = Ti.UI.createTextField({top:40, autocorrect:false, passwordMask:true, hintText:'Password'});
		var login = Ti.UI.createButton({title:"Log In", top:30});
		var cancel = Ti.UI.createButton({title:"Cancel", top:30});
		login.addEventListener("click", function() {
			Cloud.Users.login({
	    		login: userName.value,
				password: userPassword.value
			}, function (e) {
	    		if (e.success) {
	        		var user = e.users[0];
	        		var loginDialog = Ti.UI.createAlertDialog({
						message: 'Welcome '+user.first_name+' '+user.last_name,
						title: 'Logged In'
					});
					loginDialog.show();
					cameraWin.setLeftNavButton(logout);
					loginWindow.close();
					if (user.admin == 'true')
						admin = true;
	    		} else {
	            	alert('Incorrect Username/Password');
	    		}
			});
		});
		loggedIn = true;
		cancel.addEventListener("click", function() { loginWindow.close(); });
		loginWindow.add(userName); loginWindow.add(userPassword);
		loginWindow.add(login); loginWindow.add(cancel);
		loginWindow.open();
	}
}

function logOut(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		Cloud.Users.logout(function (e) {
			if (e.success) {
				var logoutDialog = Ti.UI.createAlertDialog({
					message: 'You have been successfully logged out',
					title: 'Logged Out'
				});
				logoutDialog.show();
				var user = null;
				cameraWin.setLeftNavButton(login);
			} else {
				alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			}
		});
		loggedIn = false; admin = false;
	}
}

//-- START OF SCANNER VIEW SECTION --\\

var tabGroup =	Ti.UI.createTabGroup({tabsBackgroundColor :'#B50D00' }),
	cameraWin =	Ti.UI.createWindow({ title:'Scan Devices', backgroundColor:'white', barColor:'#B50D00', tabBarHidden: true }),
	deviceWin =	Ti.UI.createWindow({ title:'List Of Devices', backgroundColor:'#484850', barColor:'#B50D00' }),
	cameraTab =	Ti.UI.createTab({ title:'Scanner', icon:'assets/camera.png', window:cameraWin, backgroundSelectedColor:'white' }),
	deviceTab =	Ti.UI.createTab({ title:'Devices', icon:'assets/device.png', window:deviceWin, backgroundSelectedColor:'white' }),
	login =		Ti.UI.createButton({ title:"Log In", color:"white", backgroundImage: 'none' }),
	clear =		Ti.UI.createButton({ title:"Clear", color:"white", backgroundImage: 'none' });

clear.addEventListener("click", function() { scannedDevices = []; if (Ti.Platform.osname != 'android') cameraWin.setRightNavButton(blank); });
cameraWin.addEventListener('focus', function() { openScanner(); });
cameraWin.addEventListener('swipe', function(e) { if (e.direction == 'left') { tabGroup.setActiveTab(1); if(admin == true) deviceWin.setRightNavButton(add); }});
cameraWin.addEventListener('blur', function() { closeScanner(); });
deviceWin.addEventListener('focus', function() { deviceList.setData(platforms); });
deviceWin.addEventListener('swipe', function(e) { if (e.direction == 'right') { tabGroup.setActiveTab(0); if(admin == true) deviceWin.setRightNavButton(blank); }});
login.addEventListener("click", function() { logIn(); });
cameraWin.setLeftNavButton(login);

//-- END OF SCANNER VIEW SECTION --\\
//-- START OF DEVICE TABLE SECTION --\\

var backToPlatforms = 	Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	backToDevices = 	Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	backToDevice = 		Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	closeAddWindow = 	Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	edit = 				Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'}),
	add = 				Ti.UI.createButton({title:'Add', color:'white', backgroundImage: 'none'}),
	save = 				Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'}),
	upload = 			Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'}),
	blank = 			Ti.UI.createButton({color:'white', backgroundImage:'none'}),
	takePhoto =			Ti.UI.createButton({ title:'Take Photo of Device', top:15, font:{fontSize:18} }),
	search = 			Ti.UI.createSearchBar({barColor:'#B50D00', height:43, top:0}),
	control =			Ti.UI.createRefreshControl({tintColor:'red'}),
	deviceList = 		Ti.UI.createTableView({data:platforms, search:search, backgroundColor:'#484850', color:'white', refreshControl:control}),
	editWindow = 		Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
	addWindow = 		Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
	deviceWindow = 		Ti.UI.createView({backgroundColor:'white'}),
	deleteDevice = 		Ti.UI.createLabel({backgroundColor:'#B50D00', text:'DELETE', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, color:'white', top:'15%', width:'50%', height:'10%'}),
	deviceInfo =	 	Ti.UI.createLabel({font:{fontSize:18}, top:'50%', height:'50%'}),
	deviceImage = 		Ti.UI.createImageView({top:20, bottom:20, height:'50%'}),
	devicePlatformValue=Ti.UI.createTextField({font:{fontSize:18}, top:20}),
	deviceOSValue =		Ti.UI.createTextField({font:{fontSize:18}, top:15}),
	deviceModelValue =	Ti.UI.createTextField({font:{fontSize:18}, top:15}),
	deviceNameValue =	Ti.UI.createTextField({font:{fontSize:18}, top:15}),
	deviceIMEIValue =	Ti.UI.createTextField({font:{fontSize:18}, top:15}),
	deviceIDValue;

getPlatforms();
deviceWindow.add(deviceImage);
deviceWindow.add(deviceInfo);

takePhoto.addEventListener('click', function (evt) { Ti.Media.showCamera({ success: function (e) { photo = e.media; } }); });
//-- EDIT DEVICE WINDOW--\\
editWindow.add(devicePlatformValue);
editWindow.add(deviceOSValue);
editWindow.add(deviceModelValue);
editWindow.add(deviceNameValue);
editWindow.add(deviceIMEIValue);
if (Ti.Media.showCamera) editWindow.add(takePhoto);
editWindow.add(deleteDevice);
//--EDIT DEVICE WINDOW--\\
//--ADD DEVICE WINDOW--\\
addWindow.add(devicePlatformValue);
addWindow.add(deviceOSValue);
addWindow.add(deviceModelValue);
addWindow.add(deviceNameValue);
addWindow.add(deviceIMEIValue);
if (Ti.Media.showCamera) addWindow.add(takePhoto);
//ADD DEVICE WINDOW--\\

deviceWin.add(deviceList);
control.addEventListener('refreshstart',function(e){
	setTimeout(function(){
		getPlatforms();
		control.endRefreshing();
	}, 2000);
});
save.addEventListener('singletap', function() {
	if(photo != null){
		Cloud.Objects.update({
			classname:'Device',
			id:deviceIDValue,
			photo: photo,
			fields:{platform:devicePlatformValue.value,osver:deviceOSValue.value,model:deviceModelValue.value,name:deviceNameValue.value,imei:deviceIMEIValue.value}
		}, function (e) {
			if (e.success){
				updated.setText('  Saved Device Information  ');
				deviceWin.add(updated); updated.animate(startupAnimation);
				setTimeout(function(){
				    updated.animate(endAnimation);
				    setTimeout(function(){ deviceWin.remove(updated); },2000);
				}, 2000);
				deviceWin.remove(editWindow);
				deviceWin.setLeftNavButton(backToDevices);
				deviceWin.setRightNavButton(edit);
			} else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		});
		photo = null;
	} else {
		 Cloud.Objects.update({
			classname:'Device',
			id:deviceIDValue,
			fields:{platform:devicePlatformValue.value,osver:deviceOSValue.value,model:deviceModelValue.value,name:deviceNameValue.value,imei:deviceIMEIValue.value}
		}, function (e) {
			if (e.success){
				updated.setText('  Saved Device Information  ');
				deviceWin.add(updated); updated.animate(startupAnimation);
				setTimeout(function(){
				    updated.animate(endAnimation);
				    setTimeout(function(){ deviceWin.remove(updated); },2000);
				}, 2000);
				deviceWin.remove(editWindow);
				deviceWin.setLeftNavButton(backToDevices);
				deviceWin.setRightNavButton(edit);
			} else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		});
	}
});

backToPlatforms.addEventListener('singletap', function() { deviceList.setData(platforms); deviceWin.setLeftNavButton(blank); if(admin == true) deviceWin.setRightNavButton(add); });
backToDevices.addEventListener('singletap', function() { deviceWin.remove(deviceWindow); deviceWin.setLeftNavButton(backToPlatforms); deviceWin.setRightNavButton(blank); });
backToDevice.addEventListener('singletap', function() { deviceWin.remove(editWindow); deviceWin.setLeftNavButton(backToDevices); deviceWin.setRightNavButton(edit); });
closeAddWindow.addEventListener('singletap', function() { deviceWin.remove(addWindow); deviceWin.setLeftNavButton(blank); deviceWin.setRightNavButton(add); });
edit.addEventListener('singletap', function() { deviceWin.add(editWindow); deviceWin.setLeftNavButton(backToDevice); deviceWin.setRightNavButton(save); });
add.addEventListener('singletap', function() {
	devicePlatformValue.setHintText("Platform");
	deviceOSValue.setHintText("OS Version");
	deviceModelValue.setHintText("Model");
	deviceNameValue.setHintText("Name");
	deviceIMEIValue.setHintText("IMEI");
	devicePlatformValue.setValue(null);
	deviceOSValue.setValue(null);
	deviceModelValue.setValue(null);
	deviceNameValue.setValue(null);
	deviceIMEIValue.setValue(null);
	deviceWin.add(addWindow);
	deviceWin.setLeftNavButton(closeAddWindow);
	deviceWin.setRightNavButton(upload);
});
upload.addEventListener('singletap', function() {
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		if (photo != null) {
			Cloud.Objects.create({
			    classname: 'Device',
			    acl_name: "Device",
			    photo: photo,
			    fields: {
			        name: deviceNameValue.value,
			        platform: devicePlatformValue.value,
			        model: deviceModelValue.value,
			        osver: deviceOSValue.value,
			        imei: deviceIMEIValue.value
			    }
			}, function (e) {
				if (e.success){
					updated.setText('  Device Added Successfully  ');
					deviceWin.add(updated); updated.animate(startupAnimation);
					setTimeout(function(){
					    updated.animate(endAnimation);
					    setTimeout(function(){ deviceWin.remove(updated); },2000);
					}, 2000);
					deviceWin.remove(addWindow);
					deviceWin.setLeftNavButton(blank);
					deviceWin.setRightNavButton(add);
				} else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			});
			photo = null;
		} else {
			Cloud.Objects.create({
			    classname: 'Device',
			    acl_name: "Device",
			    fields: {
			        name: deviceNameValue.value,
			        platform: devicePlatformValue.value,
			        model: deviceModelValue.value,
			        osver: deviceOSValue.value,
			        imei: deviceIMEIValue.value
			    }
			}, function (e) {
				if (e.success){
					updated.setText('  Device Added Successfully  ');
					deviceWin.add(updated); updated.animate(startupAnimation);
					setTimeout(function(){
					    updated.animate(endAnimation);
					    setTimeout(function(){ deviceWin.remove(updated); },2000);
					}, 2000);
					deviceWin.remove(addWindow);
					deviceWin.setLeftNavButton(blank);
					deviceWin.setRightNavButton(add);
				} else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			});
		}
	}
});
deleteDevice.addEventListener('singletap', function() {
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		Cloud.Objects.remove({
		    classname: 'Device',
		    id: deviceIDValue
		}, function (e) {
		    if (e.success) {
		    	getPlatforms();
		        deviceWin.remove(editWindow);
		        deviceWin.remove(deviceWindow);
				deviceWin.setLeftNavButton(blank);
				deviceWin.setRightNavButton(add);
				updated.setText('  Device Successfully Removed  ');
				deviceWin.add(updated); updated.animate(startupAnimation);
				setTimeout(function(){
				    updated.animate(endAnimation);
				    setTimeout(function(){ deviceWin.remove(updated); },2000);
				}, 2000);
		    } else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		});
	}
});

deviceList.addEventListener('singletap', function(e){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		if (e.rowData != null){
			if (e.rowData.platform == true){
				deviceWin.setLeftNavButton(blank);
				Cloud.Objects.query({
				    classname: 'Device',
				    order: "osver, model",
				    per_page:100,
				    where: { platform: e.rowData.name }
				}, function (e) {
				    if (e.success) {
				    	deviceWin.setLeftNavButton(backToPlatforms);
				    	deviceWin.setRightNavButton(blank);
				        var devices = [];
				        for (var i = 0; i < e.Device.length; i++){
				            var device = e.Device[i];
				            devices.push({title:device.model+' ('+device.osver+')', model:device.model, name:device.name, imei:device.imei, platform:device.platform, osver:device.osver, takenBy:device.taken_by, image:device.photo, id:device.id, color:'white'});
				        }
				        deviceList.setData(devices);
				    }
				});
			} else {
				deviceWin.setLeftNavButton(backToDevices);
				if(admin == true) deviceWin.setRightNavButton(edit);
				if (e.rowData.takenBy != undefined){
					Cloud.Users.query({
						where:{ id: e.rowData.takenBy }
					}, function (a) {
						var takenBy = a.users[0];
			    		if (a.success){
			    			var takenByTest = e.rowData.takenBy;
							deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\nModel: '+e.rowData.model+'\nName: '+e.rowData.name+'\nIMEI: '+e.rowData.imei+'\nTaken By: '+takenBy.first_name+' '+takenBy.last_name);
						}
					});
				} else {
					var takenByTest = null;
					deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\nModel: '+e.rowData.model+'\nName: '+e.rowData.name+'\nIMEI: '+e.rowData.imei+'\nNot In Use');
				}
				Cloud.Users.query({
					where:{ id: takenByTest }
				}, function (a) {
				    if (a.success){
				    	var deviceImageURL = ((e.rowData.image != null) ? e.rowData.image.urls['original'] : "assets/nodevice.png");
				   		deviceImage.setImage(deviceImageURL);
				   		devicePlatformValue.setValue(e.rowData.platform);
				   		deviceOSValue.setValue(e.rowData.osver);
				   		deviceModelValue.setValue(e.rowData.model);
				   		deviceNameValue.setValue(e.rowData.name);
				   		deviceIMEIValue.setValue(e.rowData.imei);
				   		deviceIDValue = e.rowData.id;
						deviceWin.add(deviceWindow);
					}
				});
			}
		}
	}
});

//-- END OF DEVICE TABLE SECTION --\\

tabGroup.addTab(cameraTab);
tabGroup.addTab(deviceTab);
tabGroup.open();