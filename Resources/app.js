Ti.UI.setBackgroundColor('#484850');
var Cloud = require('ti.cloud'), scannerFile = require('scannerFile'), userLog = require('userLog'),
	deviceFunctions = require('deviceFunctions'), scanditsdk = require('com.mirasense.scanditsdk'), cameraIndexField,
	startupAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:1, duration:1000}),
	endAnimation = Ti.UI.createAnimation({curve:Ti.UI.ANIMATION_CURVE_EASE_OUT, opacity:0, duration:1000}),
	updated = Ti.UI.createLabel({backgroundColor:'#303036', borderRadius:15, font:{fontSize:20}, color:'white', bottom:10, opacity:0}),
	blank = Ti.UI.createButton({color:'white', backgroundImage:'none'}),
	toDevices = Ti.UI.createButton({title:'Devices', color:'white', backgroundImage:'none'}),
	admin = false, loggedIn = false, photo = null, allPlatforms = [], currentPlatforms = [];

// check for network
if(!Ti.Network.networkType != Ti.Network.NETWORK_NONE){
	var alertDialog = Ti.UI.createAlertDialog({
		title:'WARNING!',
		message:'Your device is not online.\nThis app will not work if you aren\'t connected.',
	});
	alertDialog.show();
}

deviceFunctions.getPlatforms();

//-- START OF SCANNER VIEW SECTION --\\

var	cameraWin	= Ti.UI.createWindow({title:'Scan Devices', backgroundColor:'#484850', barColor:'#B50D00'}),
	deviceWin	= Ti.UI.createView({title:'List Of Devices', backgroundColor:'#484850', barColor:'#B50D00'}),
	search		= Ti.UI.createSearchBar({barColor:'#B50D00', height:43, top:0}),
	deviceList	= Ti.UI.createTableView({data:platforms, search:search, backgroundColor:'#484850', color:'white'});

//cameraWin.addEventListener('focus', function(){ cameraWin.remove(deviceWin); });
deviceWin.addEventListener('blur', function() { scannerFile.openScanner(); });
cameraWin.addEventListener('androidback', function(e) {
	cameraWin.remove(deviceWin);
	scannerFile.openScanner();
    return false;
});

//-- END OF SCANNER VIEW SECTION --\\
//-- START OF DEVICE TABLE SECTION --\\

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
	// deviceInfo			= Ti.UI.createLabel({font:{fontSize:18}, textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, top:'50%', height:'50%', color:'black'}),
	// deviceImage			= Ti.UI.createImageView({top:20, bottom:20, height:'50%'}),
	// devicePlatformValue	= Ti.UI.createTextField({font:{fontSize:18}, top:20, hintText:'Platform', color:'black'}),
	// deviceOSValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'OS Version', color:'black'}),
	// deviceModelValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Model', color:'black'}),
	// deviceNameValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Name', color:'black'}),
	// deviceIMEIValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'IMEI', color:'black'}),
	// deviceIDValue;
// 
// deviceWindow.add(deviceImage);
// deviceWindow.add(deviceInfo);
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
// 
// //-- END OF DEVICE TABLE SECTION --\\

cameraWin.open();
scannerFile.openScanner(); 