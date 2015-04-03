/**
 * Set up the UI for a mobileweb device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginMobileWeb(){
	var alternateImage = false;
    // Add the deviceImage to the deviceWindow
    deviceWindow.add(deviceImage);
    // Add the deviceInfo to the deviceWindow
    deviceWindow.add(deviceInfo);
    backToHome.addEventListener('click', function(e){
        deviceList.setData(uniquePlatforms);
        cameraWin.remove(deviceWindow);
    });
    deviceWindow.add(backToHome);
    
    if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
        deviceFunctions.call("GET", "objects/Platforms/query", null, function(err, data){
            var numberOfPlatforms = data.response.Platforms;
            var platformCount = 0;
            for (currentPlatforms in numberOfPlatforms){
                if(numberOfPlatforms.hasOwnProperty(currentPlatforms))
                    platformCount++;
            }
            for (i = 0; i < platformCount; i++){
                platforms.push({title:numberOfPlatforms[i].platform, name:numberOfPlatforms[i].platform, color:'white', platform:true, id:numberOfPlatforms[i].id});
            }
            uniquePlatforms = platforms.filter(function(elem, pos) { return platforms.indexOf(elem) == pos; });
            deviceList.setData(uniquePlatforms.reverse());
            cameraWin.add(deviceList);
        });
        
        deviceFunctions.call("GET", "objects/Device/query", {"limit":1000}, function(err, data){
            var numberOfDevices = data.response.Device;
            var deviceCount = 0;
            for (currentDevices in numberOfDevices){
                if(numberOfDevices.hasOwnProperty(currentDevices))
                    deviceCount++;
            }
            for (i = 0; i < deviceCount; i++){
                devices.push({title:numberOfDevices[i].model+' ('+numberOfDevices[i].osver+')', model:numberOfDevices[i].model, name:numberOfDevices[i].name, imei:numberOfDevices[i].imei, platform:numberOfDevices[i].platform, osver:numberOfDevices[i].osver, takenBy:numberOfDevices[i].taken_by, image:numberOfDevices[i].photo, id:numberOfDevices[i].id, color:'white'});
            }
        });
    }
    
    // If the user taps on the deviceList
    deviceList.addEventListener('click', function(e){
        if(!Ti.Network.networkType == Ti.Network.NETWORK_NONE){
            if (e.rowData != null){
                if (e.rowData.platform == true){
                    var selectedPlatform = [];
                    for (var a = 0; a < devices.length; a++){
                        if (devices[a].platform == e.rowData.name)
                            selectedPlatform.push(devices[a]);
                    }
                    deviceList.setData(selectedPlatform);
                } else {
                    if (e.rowData.takenBy != undefined){
                        deviceFunctions.call("GET", "users/query", {where:{ id:e.rowData.takenBy }}, function(err, data){
                            var test = data.response;
                            var takenByID = e.rowData.takenBy;
                            deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nTaken By: '+test.users[0].first_name+' '+test.users[0].last_name);
                        });
                    } else {
                        var takenByID = null;
                        deviceInfo.setText(e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei+'\nNot In Use');
                    }
                    deviceFunctions.call("GET", "users/query", {where:{ id:takenByID }}, function(err, data){
                        var test = data.response;
                        var deviceImageURL = ((e.rowData.image != null) ? ((Ti.Platform.osname == 'ipad' || Ti.Platform.osname == 'mobileweb') ? e.rowData.image.urls['original'] : e.rowData.image.urls['small_240']) : "assets/nodevice.png");
                        deviceImage.setImage(deviceImageURL);
                        devicePlatformValue.setValue(e.rowData.platform);
                        deviceOSValue.setValue(e.rowData.osver);
                        deviceModelValue.setValue(e.rowData.model);
                        deviceNameValue.setValue(e.rowData.name);
                        deviceIMEIValue.setValue(e.rowData.imei);
                        deviceIDValue = e.rowData.id;
                        deviceImage.addEventListener('click', function(){
                        	if(alternateImage == false)
						    	deviceImage.setImage('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={"id":"'+e.rowData.imei+'","object":"device"}');
						    else
						    	deviceImage.setImage(deviceImageURL);
						    alternateImage = !alternateImage;
						});
                        cameraWin.add(deviceWindow);
                    });
                }
            }
        }
    });
}

// Export the following functions so they can be used outside of this file
exports.beginMobileWeb = beginMobileWeb;