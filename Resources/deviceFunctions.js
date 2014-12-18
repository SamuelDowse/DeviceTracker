function getPlatforms() {
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		platforms = [];
		Cloud.Objects.query({
			classname:'Platforms',
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

function addPicture(evt){
	Ti.Media.showCamera({
		success:function(e){
			photo = e.media;
		},
		cancel:function(){},
		error:function(error){
			var a = Ti.UI.createAlertDialog({title:'Error Occurred'});
			if (error.code == Ti.Media.NO_CAMERA)
				a.setMessage('Device Tracker is unable to connect to your camera, do you have one?');
			else
				a.setMessage('Unexpected error: ' + error.code);
			a.show();
		}
	});
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
			deviceWin.remove(editWindow);
			if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
				deviceWin.setLeftNavButton(backToDevices);
				if(admin == true)
					deviceWin.setRightNavButton(edit);
				else
					deviceWin.setRightNavButton(blank);
			}
		} else {
			alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
		}
	});
	photo = null;
}

function uploadDevice(){
		if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.create({
			classname:'Device',
			acl_name:'Platforms',
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
				deviceWin.remove(addWindow);
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					deviceWin.setLeftNavButton(blank);
					if(admin == true)
						deviceWin.setRightNavButton(add);
					else
						deviceWin.setRightNavButton(blank);
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
				classname:'Platforms',acl_name:'Platforms',fields:{platform:devicePlatformValue.value}
			}, function (e) {
				if (!e.success)
					alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
			});
		}
	}
}

function deleteDevice(){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		Cloud.Objects.remove({
			classname:'Device',
			id:deviceIDValue
		}, function (e) {
			if (e.success) {
				deviceWin.remove(editWindow);
				deviceWin.remove(deviceWindow);
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					deviceWin.setLeftNavButton(backToPlatforms);
					deviceWin.setRightNavButton(blank);
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
								if (e.success)
									var platformToRemove = "";
								else
									alert('Error:\n' + ((e.error && e.message) || JSON.stringify(e)));
							});
						}
					});
					dialog.show();
				}
			}
		}
	}
}

function selectDevice(e){
	if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
		if (e.rowData != null){
			if (e.rowData.platform == true){
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad")
					deviceWin.setLeftNavButton(blank);
				Cloud.Objects.query({
				    classname:'Device',
				    order:"-osver, model",
				    per_page:100,
				    where:{ platform:e.rowData.name }
				}, function (e) {
				    if (e.success) {
				    	if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
				    		deviceWin.setLeftNavButton(backToPlatforms);
				    		deviceWin.setRightNavButton(blank);
				    	}
				        var devices = [];
				        for (var i = 0; i < e.Device.length; i++){
				            var device = e.Device[i];
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
				        deviceList.setData(devices);
				    }
				});
			} else {
				if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == "ipad"){
					deviceWin.setLeftNavButton(backToDevices);
					if(admin == true)
						deviceWin.setRightNavButton(edit);
					else
						deviceWin.setRightNavButton(blank);
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
						var deviceImageURL = ((e.rowData.image != null) ? (Ti.Platform.osname == 'ipad' ? e.rowData.image.urls['original'] : e.rowData.image.urls['small_240']) : "assets/nodevice.png");
						deviceImage.setImage(deviceImageURL);
						devicePlatformValue.setValue(e.rowData.platform);
						deviceOSValue.setValue(e.rowData.osver);
						deviceModelValue.setValue(e.rowData.model);
						deviceNameValue.setValue(e.rowData.name);
						deviceIMEIValue.setValue(e.rowData.imei);
						deviceIDValue = e.rowData.id;
						cameraWin.add(deviceWindow);
					}
				});
			}
		}
	}
}

function setMenu(){
	cameraWin.activity.onCreateOptionsMenu = function(e) {
		var menu = e.menu;
		menu.clear();
		if (admin == true){
			var item1 = menu.add({
				title : 'Add Device',
				showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
			});
		}
		var item2 = menu.add({
			title : 'Clear Scanned Devices',
			showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
		});
	};
}

// Export the following functions so they can be used outside of this file
exports.getPlatforms = getPlatforms;
exports.addPicture = addPicture;
exports.saveDevice = saveDevice;
exports.uploadDevice = uploadDevice;
exports.deleteDevice = deleteDevice;
exports.deletePlatform = deletePlatform;
exports.selectDevice = selectDevice;
exports.setMenu = setMenu;