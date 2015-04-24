/**
 * Open the camera to let the user take a picture.
 */
function addPicture(){
    if (Ti.Platform.osname != 'mobileweb'){
        Ti.Media.showCamera({
            success:function(e){ photo = e.media; },
            cancel:function(){ return; },
            error:function(error){
                var a = Ti.UI.createAlertDialog({ title:'Error Occurred' });
                (error.code = Ti.Media.NO_CAMERA) ? a.setMessage('Unable to connect to your camera!') : a.setMessage('Unexpected error: '+error.code);
                a.show();
            }
        });
    }
}

function call(method, url, data, callback){
    var xhr = new XMLHttpRequest(),
        appKey = Ti.App.Properties.getString('acs-api-key-'+Ti.App.deployType),
        queryString = '&';
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
            try {
                var data = JSON.parse(xhr.responseText);
            } catch(error) {
                var err = new Error((xhr.responseText?'Invalid':'Empty')+' response from server.');
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
    } else { data = JSON.stringify(data); }
    xhr.open(method, 'https://api.cloud.appcelerator.com/v1/'+url+'.json?key='+appKey+queryString);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(data);
}

function checkoutDeviceLoggedIn(){
	scannedDevices = [];
    for (var a = 0; a < uniqueDevices.length; a++){
        for (b = 0; b < devices.length; b++){
            if (devices[b].imei == uniqueDevices[a]){
                currentDevice = devices[b];
                if (currentDevice.taken_by == currentUser.id){
                	var userIDString = null;
                	var stringMessage = 'Unlinking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nfrom:\n'+currentUser.first_name+' '+currentUser.last_name;
                } else {
                	var userIDString = currentUser.id;
                	var stringMessage = 'Linking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nto:\n'+currentUser.first_name+' '+currentUser.last_name;
                }
                var errorMessage = currentDevice.model+' ('+currentDevice.platform+') from '+currentUser.first_name+' '+currentUser.last_name; 
                Cloud.Objects.update({
                    classname:'Device',
                    id:currentDevice.id,
                    fields:{ taken_by:userIDString }
                }, function (e){
                    if (e.success) {
                        unlinkDialog.setMessage(stringMessage);
                        unlinkDialog.show();
                    } else {
                        Ti.API.error('Failed to unlink '+errorMessage);
                    }
                });
            }
        }
    }
    uniqueDevices = [];
    scannedUsers = [];
	getDevices();
}

function checkoutDeviceNotLoggedIn(){
    Cloud.Users.login({
        login:'assigner',
        password:'tester'
    }, function(a){
        if (a.success){
            if (scannedUsers.length != 0){
                Cloud.Users.query({
                    where:{ id:scannedUsers[0] }
                }, function(b){
                    if (b.success){
                        var foundUser = b.users[0];
                        for (var a = 0; a < uniqueDevices.length; a++){
                            for (b = 0; b < devices.length; b++){
                                if (devices[b].imei == uniqueDevices[a]){
                                    currentDevice = devices[b];
                                    if (currentDevice.taken_by == foundUser.id){
                                    	var userIDString = null;
                                    	var stringMessage = 'Unlinking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nfrom:\n'+foundUser.first_name+' '+foundUser.last_name;
                                    } else {
                                    	var userIDString = foundUser.id;
                                    	var stringMessage = 'Linking Device:\n'+currentDevice.model+' ('+currentDevice.platform+')\nto:\n'+foundUser.first_name+' '+foundUser.last_name;
                                    }
                                    var errorMessage = currentDevice.model+' ('+currentDevice.platform+') from '+foundUser.first_name+' '+foundUser.last_name;
                                    Cloud.Objects.update({
                                        classname:'Device',
                                        id:currentDevice.id,
                                        fields:{taken_by:userIDString}
                                    }, function (e){
                                        if (e.success) {
                                            unlinkDialog.setMessage(stringMessage);
                                            unlinkDialog.show();
                                        } else {
                                            Ti.API.error('Failed to unlink '+errorMessage);
                                        }
                                        logOutAssigner();
                                    });
                                }
                            }
                        }
                    }
                });
            } else {
                for (var a = 0; a < uniqueDevices.length; a++){
                    for (b = 0; b < devices.length; b++){
                        if (devices[b].imei == uniqueDevices[a]){
                            currentDevice = devices[b];
                            Cloud.Objects.update({
                                classname:'Device',
                                id:currentDevice.id,
                                fields:{ taken_by:null }
                            }, function (e){
                                if (e.success) {
                                	unlinkDialog.setMessage('Removing users from device');
                                    unlinkDialog.show();
                                } else {
                                    Ti.API.error('Failed to unlink '+currentDevice.model+' ('+currentDevice.platform+') from all users');
                                }
                                logOutAssigner();
                            });
                        }
                    }
                }
            }
        }
    });
}

function deleteDevice(){
    if (Ti.Platform.osname != 'mobileweb'){
        Cloud.Objects.remove({
            classname:'Device',
            id:deviceIDValue
        }, function (e){
            if (e.success) {
                cameraWin.remove(editWindow);
                cameraWin.remove(deviceWindow);
                if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
                    cameraWin.setLeftNavButton(backToPlatforms);
                    cameraWin.setRightNavButton(blank);
                }
                getPlatforms();
            } else {
                Ti.API.error('Failed to remove device');
            }
        });
    }
}

function deletePlatform(e){
    if (Ti.Platform.osname != 'mobileweb'){
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
                    dialog.addEventListener('singletap', function(e){
                        if (e.index != e.source.cancel){
                            Cloud.Objects.remove({
                                classname:'Platforms',
                                id:platformToRemove
                            }, function (e){
                                (e.success ? platformToRemove='' : Ti.API.error('Failed to remove platform'));
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
    if (Ti.Platform.osname != 'mobileweb'){
        platforms = [];
        uniquePlatforms = [];
        Cloud.Objects.query({
            classname:'Platforms',
            order:'platform',
            limit:1000,
            where:{
                companyName:companyName
            }
        }, function (e){
            for (var i = 0; i < e.Platforms.length; i++) {
                var devPlat = e.Platforms[i];
                if (e.success){
                    platforms.push({
                        title:devPlat.platform,
                        name:devPlat.platform,
                        color:'white',
                        platform:true,
                        id:devPlat.id
                    });
                }
            }
            platforms = platforms.filter(function(elem, pos) {
                return platforms.indexOf(elem) == pos;
            });
            deviceList.setData(platforms);
       });
    }
}

function getDevices() {
    if (Ti.Platform.osname != 'mobileweb'){
        devices = [];
        Cloud.Objects.query({
            classname:'Device',
            order:'-osver, model',
            limit:1000,
            where:{
                companyName:companyName
            }
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
                        taken_by:device.taken_by,
                        image:device.photo,
                        id:device.id,
                        tags:device.tags,
                        color:'white'
                    });
                }
            }            
        });
    }
}

function logOutAssigner(){
    Cloud.Users.logout(function (e){
        if (e.success) {
            foundUser = null;
            currentDevice = null;
            scannedDevices = [];
            scannedUsers = [];
            uniqueDevices = [];
            getPlatforms();
            getDevices();
        } else {
            Ti.API.error('Failed to log out of the assigner account');
        }
    });
}

function saveDevice(){
    if (Ti.Platform.osname != 'mobileweb'){
        var modelString = deviceModeValue.value;
        var modelName = modelString.replace(/ \[[^\]]*?\]/g, "");
        var modelNickname = modelString.replace(/^[^\[]*/g, "");
        Cloud.Objects.update({
            classname:'Device',
            id:deviceIDValue,
            photo:photo,
            fields:{
                platform:devicePlatformValue.value,
                osver:deviceOSValue.value,
                model:modelString,
                name:deviceNameValue.value,
                imei:deviceIMEIValue.value,
                companyName:companyName,
                tags:deviceIMEIValue.value+','+deviceNameValue.value+','+modelName+','+modelNickname+','+deviceOSValue.value+','+devicePlatformValue.value
            }
        }, function (e) {
            if (e.success){
                cameraWin.remove(editWindow);
                if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
                    cameraWin.setLeftNavButton(backToDevices);
                    admin ? cameraWin.setRightNavButton(edit) : cameraWin.setRightNavButton(blank);
                }
            } else {
                Ti.API.error('Failed to save device');
            }
        });
        photo = null;
    }
}

function selectDevice(e){
    if (Ti.Platform.osname != 'mobileweb'){
        if (e.rowData != null){
            if (e.rowData.platform == true){
                if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
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
                listPage = false;
                listPageTwo = true;
            } else {
                if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){ 
                    cameraWin.setLeftNavButton(backToDevices);
                    admin ? cameraWin.setRightNavButton(edit) : cameraWin.setRightNavButton(blank);
                }
                var message = e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei;
                if (e.rowData.taken_by != undefined){
                    Cloud.Users.query({
                        where:{
                            id:e.rowData.taken_by
                        }
                    }, function (a){
                        var takenBy = a.users[0];
                        if (a.success){
                            var takenByID = e.rowData.taken_by;
                            deviceInfo.setText(message+'\nTaken By: '+takenBy.first_name+' '+takenBy.last_name);
                        }
                    });
                } else {
                    var takenByID = null;
                    deviceInfo.setText(message+'\nNot In Use');
                }
                Cloud.Users.query({
                    where:{
                        id:takenByID
                    }
                }, function (a){
                    if (a.success){
                        listPageTwo = false;
                        devicePage = true;
                        if (e.rowData.image == null){
                            deviceImageURL = 'assets/nodevice.png';
                        } else {
                            if (Ti.Platform.displayCaps.platformWidth > 0 && Ti.Platform.displayCaps.platformWidth < 240){
                                deviceImageURL = e.rowData.image.urls['thumb_100'];
                            } else if (Ti.Platform.displayCaps.platformWidth > 241 && Ti.Platform.displayCaps.platformWidth < 500){
                                deviceImageURL = e.rowData.image.urls['small_240'];
                            } else if (Ti.Platform.displayCaps.platformWidth > 501 && Ti.Platform.displayCaps.platformWidth < 640){
                                deviceImageURL = e.rowData.image.urls['medium_500'];
                            } else if (Ti.Platform.displayCaps.platformWidth > 641 && Ti.Platform.displayCaps.platformWidth < 1024){
                                deviceImageURL = e.rowData.image.urls['medium_640'];
                            } else if (Ti.Platform.displayCaps.platformWidth > 1025){
                                deviceImageURL = e.rowData.image.urls['large_1024'];
                            }
                        }
                        deviceImage.setImage(deviceImageURL);
                        devicePlatformValue.setValue(e.rowData.platform);
                        deviceOSValue.setValue(e.rowData.osver);
                        deviceModelValue.setValue(e.rowData.model);
                        deviceNameValue.setValue(e.rowData.name);
                        deviceIMEIValue.setValue(e.rowData.imei);
                        deviceIDValue = e.rowData.id;
                        androidCurrentPlatform = e.rowData.platform;
                        cameraWin.add(deviceWindow);
                        if (Ti.Platform.osname == 'android'){
                            cameraWin.activity.invalidateOptionsMenu();
                        }
                    }
                });
            }
        }
    }
}

function uploadDevice(){
    if (Ti.Platform.osname != 'mobileweb'){
        var modelString = deviceModelValue.value;
        var modelName = modelString.replace(/ \[[^\]]*?\]/g, "");
        var modelNickname = modelString.replace(/^[^\[]*/g, "");
        Cloud.Objects.create({
            classname:'Device',
            acl_name:'AllAccess',
            photo:photo,
            fields:{
                name:deviceNameValue.value,
                platform:devicePlatformValue.value,
                model:modelString,
                osver:deviceOSValue.value,
                imei:deviceIMEIValue.value,
                companyName:companyName,
                tags:deviceIMEIValue.value+','+deviceNameValue.value+','+modelName+','+modelNickname+','+deviceOSValue.value+','+devicePlatformValue.value
            }
        }, function (e){
            if (e.success){
                cameraWin.remove(addWindow);
                if (Ti.Platform.osname == 'iphone' || Ti.Platform.osname == 'ipad'){
                    cameraWin.setLeftNavButton(blank);
                    admin ? cameraWin.setRightNavButton(add) : cameraWin.setRightNavButton(blank);
                }
            } else {
                Ti.API.error('Failed to upload device');
            }
        });
        photo = null;
        var foundPlatform = 0;
        Cloud.Objects.query({
            classname:'Platforms',
            order:'platform',
            limit:1000,
            where:{
                companyName:companyName
            }
        }, function (e){
            for (var i = 0; i < e.Platforms.length; i++) {
                if (devicePlatformValue.value == e.Platforms[i].platform){
                    foundPlatform++;
                }
            }
            if(foundPlatform = 0){
                Cloud.Objects.create({
                    classname:'Platforms',
                    acl_name:'AllAccess',
                    fields:{
                        platform:devicePlatformValue.value,
                        companyName:companyName
                    }
                }, function (e){
                    if (!e.success){
                        Ti.API.error('Failed to create new platform');
                    }
                });
            }
       });
    }
}

// Export the following functions so they can be used outside of this file
exports.addPicture                = addPicture;
exports.call                      = call;
exports.checkoutDeviceLoggedIn    = checkoutDeviceLoggedIn;
exports.deleteDevice              = deleteDevice;
exports.deletePlatform            = deletePlatform;
exports.getPlatforms              = getPlatforms;
exports.getDevices                = getDevices;
exports.checkoutDeviceNotLoggedIn = checkoutDeviceNotLoggedIn;
exports.saveDevice                = saveDevice;
exports.selectDevice              = selectDevice;
exports.uploadDevice              = uploadDevice;