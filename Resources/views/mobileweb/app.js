function obtainAll(){
    platforms = []; devices = [];
    deviceFunctions.call('GET', 'objects/Platforms/query', {'order':'-platform'}, function(err, data){
        var numberOfPlatforms = data.response.Platforms;
        var platformCount = 0;
        for (currentPlatforms in numberOfPlatforms){
            if(numberOfPlatforms.hasOwnProperty(currentPlatforms))
                platformCount++;
        }
        for (i = 0; i < platformCount; i++){
            platforms.push({
                title:numberOfPlatforms[i].platform,
                name:numberOfPlatforms[i].platform,
                color:'white',
                platform:true,
                id:numberOfPlatforms[i].id
            });
        }
        platforms = platforms.filter(function(elem, pos) {
            return platforms.indexOf(elem) == pos;
        });
        deviceList.setData(platforms.reverse());
    });
    
    deviceFunctions.call('GET', 'objects/Device/query', {'limit':1000, 'order':'-osver, model'}, function(err, data){
        var numberOfDevices = data.response.Device;
        var deviceCount = 0;
        for (currentDevices in numberOfDevices){
            if(numberOfDevices.hasOwnProperty(currentDevices))
                deviceCount++;
        }
        for (i = 0; i < deviceCount; i++){
            devices.push({
                title:numberOfDevices[i].model+' ('+numberOfDevices[i].osver+')',
                model:numberOfDevices[i].model,
                name:numberOfDevices[i].name,
                imei:numberOfDevices[i].imei,
                platform:numberOfDevices[i].platform,
                osver:numberOfDevices[i].osver,
                takenBy:numberOfDevices[i].taken_by,
                image:numberOfDevices[i].photo,
                id:numberOfDevices[i].id,
                tags:numberOfDevices[i].tags,
                color:'white'
            });
        }
    });
}

function searchDevices(){
    var foundArray = [];
    var indexArray = [];
    searchValue = searchValue.replace(/\s*,\s*/g, ',');
    searchValue = searchValue.toLowerCase();
    var searchArray=searchValue.split(',');
    for (var a = 0; a < devices.length; a++){
        deviceTag = devices[a].tags.toString();
        deviceTag = deviceTag.toLowerCase();
        if (deviceTag.indexOf(searchArray[0]) > -1){
            foundArray.push(devices[a]);
        }
    }
    for (var b = 1; b < searchArray.length; b++){
        indexArray = [];
        for (var c = 0; c < foundArray.length; c++){
            searchValue = searchArray[b].toLowerCase();
            deviceTag = foundArray[c].tags.toString();
            deviceTag = deviceTag.toLowerCase();
            if (deviceTag.indexOf(searchValue) == -1){
                indexArray.push(c);
            }
        }
        indexArray = indexArray.reverse();
        for (var d = 0; d < indexArray.length; d++){
            foundArray.splice(indexArray[d], 1);
        }
    }
    searchBar.setValue("Results found: "+foundArray.length);
    deviceListTwo.setData(foundArray);
}

/**
 * Set up the UI for a mobileweb device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginMobileWeb(){
    obtainAll();
    
    var appcLogo      = Ti.UI.createImageView({image:'assets/logo.png', left:10});
    var seperator     = Ti.UI.createView({backgroundColor:'#242428', width:'3', right:0});
    var searchView    = Ti.UI.createView({backgroundColor:'#B50D00', width:'100%', height:'5%', top:0});
    
    deviceList.setBackgroundColor('#303035');
    deviceList.setBottom(0);
    deviceList.setHeight('95%');
    deviceList.setLeft(0);
    deviceList.setWidth('30%');
    deviceWindow.setBottom(0);
    deviceWindow.setHeight('95%');
    
    appcLogo.addEventListener('click', function(e){
        searchBar.setValue('');
        deviceListTwo.setData([]);
        cameraWin.remove(deviceWindow);
        obtainAll();
    });
    
    searchBar.addEventListener('click', function(e){
        searchBar.setColor('black');
        if (searchBar.value.indexOf('Results found') > -1){
            searchBar.setValue('');
        }
    });
    
    searchBar.addEventListener('blur', function(e){
        searchBar.setColor('#93939e');
    });
    
    searchBar.addEventListener('return', function(e){
        searchValue = searchBar.value;
        searchBar.setValue('');
        searchDevices();
        cameraWin.remove(deviceWindow);
    });

    cameraWin.add(deviceList);
    cameraWin.add(deviceListTwo);
    cameraWin.add(searchView);
    deviceList.add(seperator);
    deviceWindow.add(deviceImage);    
    deviceWindow.add(deviceInfo);
    searchView.add(appcLogo);
    searchView.add(searchBar);

    // If the user taps on the deviceList
    deviceList.addEventListener('click', function(e){
        if (e.rowData != null){
            if (e.rowData.platform == true){
                var selectedPlatform = [];
                for (var a = 0; a < devices.length; a++){
                    if (devices[a].platform == e.rowData.name){
                        selectedPlatform.push(devices[a]);
                    }
                }
                deviceListTwo.setData(selectedPlatform);
            }
        }
    });
    
    deviceListTwo.addEventListener('click', function(e){
        if (e.rowData != null){
            if (searchBar.value.indexOf('Results found') > -1){
                searchBar.setValue('');
            }
            var message = e.rowData.platform+' ('+e.rowData.osver+')\n'+e.rowData.model+'\n'+e.rowData.name+'\n'+e.rowData.imei;
            if (e.rowData.takenBy != undefined){
                deviceFunctions.call('GET', 'users/query', {where:{ id:e.rowData.takenBy }}, function(err, data){
                    var obtainedData = data.response;
                    var takenByID = e.rowData.takenBy;
                    deviceInfo.setText(message+'\nTaken By: '+obtainedData.users[0].first_name+' '+obtainedData.users[0].last_name);
                });
            } else {
                var takenByID = null;
                deviceInfo.setText(message+'\nNot In Use');
            }
            deviceFunctions.call('GET', 'users/query', {where:{ id:takenByID }}, function(err, data){
                var test = data.response;
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
                var alternateImage = false;
                deviceImage.addEventListener('dblclick', function(){
                    if(alternateImage == false){
                        deviceImage.setImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={"id":"'+e.rowData.imei+'","object":"device"}');
                    } else {
                        deviceImage.setImage(deviceImageURL);
                    }
                    alternateImage = !alternateImage;
                });
                cameraWin.add(deviceWindow);
            });
        }
    });
}

exports.beginMobileWeb = beginMobileWeb;