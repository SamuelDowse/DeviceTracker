Ti.UI.setBackgroundColor('#484850');

var androidSetUp		= require('views/android/app');
var Cloud				= require('ti.cloud');
var deviceFunctions		= require('deviceFunctions');
var iOSSetUp			= require('views/ios/app');
var scanditsdk			= require('com.mirasense.scanditsdk');
var scannerFile			= require('scannerFile');
var userLog				= require('userLog'); 

var backToPlatforms		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var backToDevices		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var backToDevice		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var blank				= Ti.UI.createButton({color:'white', backgroundImage:'none'});
var checkout			= Ti.UI.createButton({backgroundImage:'assets/capture.png', bottom:'6%', width:60, height:60});
var closeAddWindow		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var listDevice			= Ti.UI.createButton({backgroundImage:'assets/list.png', bottom:'5%', right:'10%', width:50, height:50});
var login				= Ti.UI.createButton({backgroundImage:'assets/login.png', bottom:'5%', left:'10%', width:50, height:50});
var logout				= Ti.UI.createButton({backgroundImage:'assets/logout.png', bottom:'5%', left:'10%', width:50, height:50});
var takePhoto			= Ti.UI.createButton({title:'Take Photo of Device', top:15, font:{fontSize:18}});
var toDevices			= Ti.UI.createButton({title:'Devices', color:'white', backgroundImage:'none'});
var upload				= Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'});

var deviceImage			= Ti.UI.createImageView({top:20, bottom:20, height:'50%'});

var deviceInfo			= Ti.UI.createLabel({font:{fontSize:18}, textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, top:'50%', height:'50%', color:'black'});
var updated				= Ti.UI.createLabel({backgroundColor:'#303036', borderRadius:15, font:{fontSize:20}, color:'white', bottom:10, opacity:0});

var search				= Ti.UI.createSearchBar({barColor:'#B50D00', height:43, top:0});

var deviceList			= Ti.UI.createTableView({data:platforms, search:search, backgroundColor:'#484850', color:'white'});

var deviceIMEIValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'IMEI', color:'black'});
var deviceModelValue	= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Model', color:'black'});
var deviceNameValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Name', color:'black'});
var deviceOSValue		= Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'OS Version', color:'black'});
var devicePlatformValue	= Ti.UI.createTextField({font:{fontSize:18}, top:20, hintText:'Platform', color:'black'});

var deviceWin			= Ti.UI.createView({title:'List Of Devices', backgroundColor:'#484850', barColor:'#B50D00'});
var deviceWindow		= Ti.UI.createView({backgroundColor:'white'});

var cameraWin			= Ti.UI.createWindow({title:'Scan Devices', backgroundColor:'#484850', barColor:'#B50D00'});

var deleteDevice		= Ti.UI.createButton({title:'Delete', color:'white', backgroundImage:'none'});
var edit				= Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'});
var add					= Ti.UI.createButton({title:'Add', color:'white', backgroundImage:'none'});
var save				= Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'});

var admin				= false;
var loggedIn			= false;
var photo				= null;

var allPlatforms		= [];
var currentPlatforms	= [];
var platforms			= [];
var scannedDevices		= [];

var cameraIndexField;
var deviceIDValue;

var backToPlatforms		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		backToDevices		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		backToDevice		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		closeAddWindow		= Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'}),
		edit				= Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'}),
		add					= Ti.UI.createButton({title:'Add', color:'white', backgroundImage:'none'}),
		save				= Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'}),
		upload				= Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'}),
		takePhoto			= Ti.UI.createButton({title:'Take Photo of Device', top:15, font:{fontSize:18}}),
		editWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
		addWindow			= Ti.UI.createView({backgroundColor:'white', layout:'vertical'}),
		deleteDevice		= Ti.UI.createLabel({backgroundColor:'#B50D00', text:'DELETE', textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, color:'white', top:'15%', width:'50%', height:'10%'});

// check for network
if(!Ti.Network.networkType != Ti.Network.NETWORK_NONE){
	var alertDialog = Ti.UI.createAlertDialog({
		title:'WARNING!',
		message:'Your device is not online.\nThis app will not work if you aren\'t connected.',
	});
	alertDialog.show();
}

deviceFunctions.getPlatforms();
scannerFile.openScanner();
cameraWin.open();

if (Ti.Platform.osname == 'android')
	androidSetUp.beginAndroid();
else
	iOSSetUp.beginiOS();