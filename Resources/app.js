Titanium.UI.setBackgroundColor('#484850');
var Cloud = require('ti.cloud'), scannerFile = require('scannerFile'),
	scanditsdk = require('com.mirasense.scanditsdk'), cameraIndexField,
	startupAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:1, duration:1000}),
	endAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:0, duration:1000}),
	updated = Ti.UI.createLabel({backgroundColor:'#303036', borderRadius:15, font:{fontSize:20}, color:'white', bottom:10, opacity:0}),
	blank = Ti.UI.createButton({color:'white', backgroundImage:'none'}),
	admin = false, loggedIn = false, photo = null, allPlatforms = [], currentPlatforms = [];

// check for network
if(!Titanium.Network.networkType != Titanium.Network.NETWORK_NONE){
     var alertDialog = Titanium.UI.createAlertDialog({
		title: 'WARNING!',
		message: 'Your device is not online.\nThis app will not work if you aren\'t connected.',
	});
	alertDialog.show();
}

function getPlatforms() {
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){	
		platforms = []; 
		Cloud.Objects.query({
			classname: 'Platforms',
			order:'platform'
		}, function (e) {
			for (var i = 0; i < e.Platforms.length; i++) {
				var devPlat = e.Platforms[i];
				if (e.success){
					platforms.push({title:devPlat.platform, name:devPlat.platform, color:'white', platform:true, id:devPlat.id});
					currentPlatforms.push(devPlat.platform);
					deviceList.setData(platforms);
				}
			}
		});
	}
}
getPlatforms();
	
var login = Ti.UI.createButton({ title:'Log In', color:'white', backgroundImage: 'none' }),
	logout = Ti.UI.createButton({ title:'Log Out', color:'white', backgroundImage: 'none' });
login.addEventListener('click', function() { logIn(); });
logout.addEventListener('click', function() { logOut(); });


function logIn(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		scannerFile.closeScanner();
		var loginWindow = Ti.UI.createView({backgroundColor:"white", layout:"vertical"});
		var userName = Ti.UI.createTextField({top:50, autocorrect:false, hintText:'Username'});
		var userPassword = Ti.UI.createTextField({top:40, autocorrect:false, passwordMask:true, hintText:'Password'});
		var loginButton = Ti.UI.createButton({title:"Log In", top:30});
		var cancelButton = Ti.UI.createButton({title:"Cancel", top:30});
		cameraWin.setLeftNavButton(blank);
		loginButton.addEventListener("click", function() {
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
					cameraWin.remove(loginWindow);
					scannerFile.openScanner();
					if (user.admin == 'true')
						admin = true;
	    		} else {
	            	alert('Incorrect Username/Password');
	    		}
			});
		});
		loggedIn = true;
		cancelButton.addEventListener("click", function() {
			cameraWin.remove(loginWindow);
			scannerFile.openScanner();
			cameraWin.setLeftNavButton(login);
		});
		loginWindow.add(userName); loginWindow.add(userPassword);
		loginWindow.add(loginButton); loginWindow.add(cancelButton);
		cameraWin.add(loginWindow);
	}
}
function logOut(){
	if(!Titanium.Network.networkType == Titanium.Network.NETWORK_NONE){
		Cloud.Users.logout(function (e) {
			if (e.success) {
				var logoutDialog = Ti.UI.createAlertDialog({
					message: 'You have been logged out',
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

var tabGroup	= Ti.UI.createTabGroup({tabsBackgroundColor :'#B50D00', backgroundColor:'#484850' }),
	cameraWin	= Ti.UI.createWindow({ title:'Scan Devices', backgroundColor:'#484850', barColor:'#B50D00', tabBarHidden: true }),
	deviceWin	= Ti.UI.createWindow({ title:'List Of Devices', backgroundColor:'#484850', barColor:'#B50D00' }),
	cameraTab	= Ti.UI.createTab({ title:'Scanner', icon:'assets/camera.png', window:cameraWin, backgroundSelectedColor:'white' }),
	deviceTab	= Ti.UI.createTab({ title:'Devices', icon:'assets/device.png', window:deviceWin, backgroundSelectedColor:'white' }),
	login		= Ti.UI.createButton({ title:"Log In", color:"white", backgroundImage: 'none' }),
	clear		= Ti.UI.createButton({ title:"Clear", color:"white", backgroundImage: 'none' });

clear.addEventListener("click", function() { scannedDevices = []; if (Ti.Platform.osname != 'android') cameraWin.setRightNavButton(blank); });
cameraWin.addEventListener('focus', function() { scannerFile.openScanner(); });
cameraWin.addEventListener('blur', function() { scannerFile.closeScanner(); });
cameraWin.addEventListener('swipe', function(e) { if (e.direction == 'left') { tabGroup.setActiveTab(1); if(admin == true) deviceWin.setRightNavButton(add); }});
deviceWin.addEventListener('focus', function() { deviceList.setData(platforms); deviceWin.setLeftNavButton(blank); });
deviceWin.addEventListener('swipe', function(e) { if (e.direction == 'right') { tabGroup.setActiveTab(0); if(admin == true) deviceWin.setRightNavButton(blank); }});
login.addEventListener("click", function() { logIn(); });
cameraWin.setLeftNavButton(login);

//-- END OF SCANNER VIEW SECTION --\\
//-- START OF DEVICE TABLE SECTION --\\

var backToPlatforms		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	backToDevices		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	backToDevice		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	closeAddWindow		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
	edit				= Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'}),
	add					= Ti.UI.createButton({title:'Add', color:'white', backgroundImage:'none'}),
	save				= Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'}),
	upload				= Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'}),
	takePhoto			= Ti.UI.createButton({title:'Take Photo of Device', top:15, font:{fontSize:18}}),
	search				= Ti.UI.createSearchBar({barColor:'#B50D00', height:43, top:0}),
	control				= Ti.UI.createRefreshControl({tintColor:'#B50D00'}),
	deviceList			= Ti.UI.createTableView({data:platforms, search:search, backgroundColor:'#484850', color:'white', refreshControl:control}),
	editWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
	addWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
	deviceWindow		= Ti.UI.createView({backgroundColor:'white'}),
	deleteDevice		= Ti.UI.createLabel({backgroundColor:'#B50D00', text:'DELETE', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, color:'white', top:'15%', width:'50%', height:'10%'}),
	deviceInfo			= Ti.UI.createLabel({font:{fontSize:18}, textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, top:'50%', height:'50%'}),
	deviceImage			= Ti.UI.createImageView({top:20, bottom:20, height:'50%'}),
	devicePlatformValue	= Ti.UI.createTextField({font:{fontSize:18}, top:20, hintText:'Platform'}),
	deviceOSValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'OS Version'}),
	deviceModelValue	= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Model'}),
	deviceNameValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Name'}),
	deviceIMEIValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'IMEI'}),
	deviceIDValue;

deviceWindow.add(deviceImage);
deviceWindow.add(deviceInfo);
takePhoto.addEventListener('click', function (evt){
	Ti.Media.showCamera({
		success:function(e){
			photo = e.media;
		},
		cancel:function(){},
		error:function(error){
			var a = Ti.UI.createAlertDialog({title:'Error Occurred'});
			((error.code == Ti.Media.NO_CAMERA) ? a.setMessage('Device Tracker is unable to connect to your camera, do you have one?') : a.setMessage('Unexpected error: ' + error.code));
			a.show();
		}
	});
});

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
//ADD DEVICE WINDOW--\\

deviceWin.add(deviceList);
control.addEventListener('refreshstart',function(e){
	setTimeout(function(){
		getPlatforms();
		control.endRefreshing();
	}, 2000);
});
save.addEventListener('singletap', function() {
	Cloud.Objects.update({
		classname:'Device',
		id:deviceIDValue,
		photo: photo,
		fields:{
			platform:devicePlatformValue.value,
			osver:deviceOSValue.value,
			model:deviceModelValue.value,
			name:deviceNameValue.value,
			imei:deviceIMEIValue.value
		}
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
});
backToPlatforms.addEventListener('singletap', function() {
	deviceList.setData(platforms);
	deviceWin.setLeftNavButton(blank);
	if(admin == true)
		deviceWin.setRightNavButton(add);
	else
		deviceWin.setRightNavButton(blank);
});
backToDevices.addEventListener('singletap', function() {
	deviceWin.remove(deviceWindow);
	deviceWin.setLeftNavButton(backToPlatforms);
	deviceWin.setRightNavButton(blank);
});
backToDevice.addEventListener('singletap', function() {
	deviceWin.remove(editWindow);
	deviceWin.setLeftNavButton(backToDevices);
	deviceWin.setRightNavButton(edit);
});
closeAddWindow.addEventListener('singletap', function() {
	deviceWin.remove(addWindow);
	deviceWin.setLeftNavButton(blank);
	deviceWin.setRightNavButton(add);
});
edit.addEventListener('singletap', function() {
	deviceWin.add(editWindow);
	deviceWin.setLeftNavButton(backToDevice);
	deviceWin.setRightNavButton(save);
});
add.addEventListener('singletap', function() {
	devicePlatformValue.setValue(null); deviceOSValue.setValue(null);
	deviceModelValue.setValue(null); deviceNameValue.setValue(null);
	deviceIMEIValue.setValue(null); deviceWin.add(addWindow);
	deviceWin.setLeftNavButton(closeAddWindow);
	deviceWin.setRightNavButton(upload);
});
upload.addEventListener('singletap', function() {
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.create({
			classname:'Device',
			acl_name: 'Device',
			photo: photo,
			fields: {
		        name:deviceNameValue.value,
		        platform:devicePlatformValue.value,
		        model:deviceModelValue.value,
		        osver:deviceOSValue.value,
		        imei:deviceIMEIValue.value
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
		if ( currentPlatforms.indexOf(devicePlatformValue.value) > -1 ){
			Ti.API.info("OS already exists, ignoring creation of OS in ACS");
		} else {
			Cloud.Objects.create({
				classname:'Platforms',acl_name:'Device',fields:{platform:devicePlatformValue.value}
			}, function (e) { if (!e.success) alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e))); });
		}
	}
});
deleteDevice.addEventListener('singletap', function() {
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.remove({
		    classname: 'Device',
		    id: deviceIDValue
		}, function (e) {
		    if (e.success) {
		        deviceWin.remove(editWindow);
		        deviceWin.remove(deviceWindow);
				deviceWin.setLeftNavButton(backToPlatforms);
				deviceWin.setRightNavButton(blank);
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
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
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
				            devices.push({
				            	title: device.model+' ('+device.osver+')',
				            	model: device.model,
				            	name: device.name,
				            	imei: device.imei,
				            	platform: device.platform,
				            	osver: device.osver,
				            	takenBy: device.taken_by,
				            	image: device.photo,
				            	id: device.id,
				            	color: 'white'
				            });
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
			    			var takenByID = e.rowData.takenBy;
							deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nTaken By: '+takenBy.first_name+' '+takenBy.last_name);
						}
					});
				} else {
					var takenByID = null;
					deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nNot In Use');
				}
				Cloud.Users.query({
					where:{ id: takenByID }
				}, function (a) {
				    if (a.success){    
					    var deviceImageURL = ((e.rowData.image != null) ? (Ti.Platform.osname == 'ipad' ? e.rowData.image.urls['original'] : e.rowData.image.urls['small_240']) : "assets/nodevice.png");
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
deviceList.addEventListener('longpress', function(e){
	var platformToRemove = e.rowData.id;
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		if (e.rowData != null){
			if (e.rowData.platform == true){
				if(admin == true){
					var dialog = Ti.UI.createAlertDialog({
						cancel: 1,
						buttonNames: ['Confirm', 'Cancel'],
						message: 'Would you like to delete this OS?',
						title: 'Delete'
					});
					dialog.addEventListener('click', function(e){
						if (e.index != e.source.cancel){
							Cloud.Objects.remove({
								classname: 'Platforms',
								id: platformToRemove
							}, function (e) {
								if (e.success) {
									updated.setText('  OS Successfully Removed  ');
									deviceWin.add(updated); updated.animate(startupAnimation);
									setTimeout(function(){
									    updated.animate(endAnimation);
									    setTimeout(function(){ deviceWin.remove(updated); },2000);
									}, 2000);
								} else alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
							});
						}
					});
					dialog.show();
				}
			}
		}
	}
});

//-- END OF DEVICE TABLE SECTION --\\

tabGroup.addTab(cameraTab);
tabGroup.addTab(deviceTab);
tabGroup.open();
