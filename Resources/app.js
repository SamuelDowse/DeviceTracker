// Set the background color of the application
Ti.UI.setBackgroundColor('#484850');
// GLOBAL VARIABLES \\
if (Ti.Platform.osname != 'mobileweb'){
    var Cloud           = require('ti.cloud');
    var scanditsdk      = require('com.mirasense.scanditsdk');
}
if (Ti.Platform.osname == 'android')
    var androidSetUp    = require('views/android/app');
if (Ti.Platform.osname == 'ipad' || Ti.Platform.osname == 'iphone')
    var iOSSetUp        = require('views/ios/app');
if (Ti.Platform.osname == 'mobileweb')
    var mobileWebSetUp  = require('views/mobileweb/app');
var scannerFile         = require('scannerFile');
var userLog             = require('userLog');
var deviceFunctions     = require('deviceFunctions');

var checkout            = Ti.UI.createButton({backgroundImage:'assets/capture.png', bottom:'6%', width:60, height:60});
var cancelButton        = Ti.UI.createButton({title:"Cancel", top:30, color:'white'});
var listDevice          = Ti.UI.createButton({backgroundImage:'assets/list.png', bottom:'5%', right:'13%', width:50, height:50});
var login               = Ti.UI.createButton({backgroundImage:'assets/login.png', bottom:'5%', left:'13%', width:50, height:50});
var loginButton         = Ti.UI.createButton({title:"Log In", top:30, color:'white'});
var logout              = Ti.UI.createButton({backgroundImage:'assets/logout.png', bottom:'5%', left:'13%', width:50, height:50});
var takePhoto           = Ti.UI.createButton({title:'Take Photo of Device', top:15, font:{fontSize:18}});

var deviceImage         = Ti.UI.createImageView({top:20, bottom:20, height:'50%'});

var deviceInfo          = Ti.UI.createLabel({font:{fontSize:18}, textAlign:Ti.UI.TEXT_ALIGNMENT_CENTER, top:'51%', height:'50%', color:'white'});

if (Ti.Platform.osname != 'mobileweb')
    var search          = Ti.UI.createSearchBar({barColor:'#B50D00', height:43, top:0});

var deviceList          = Ti.UI.createTableView({data:platforms, search:search, backgroundColor:'#484850', color:'white'});
var deviceListTwo       = Ti.UI.createTableView({data:platforms, backgroundColor:'#484850', color:'white', width:'70%', height:'95%', right:0, bottom:0});

var deviceIMEIValue     = Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'IMEI', color:'white'});
var deviceModelValue    = Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Model', color:'white'});
var deviceNameValue     = Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'Name', color:'white'});
var deviceOSValue       = Ti.UI.createTextField({font:{fontSize:18}, top:15, hintText:'OS Version', color:'white'});
var devicePlatformValue = Ti.UI.createTextField({font:{fontSize:18}, top:20, hintText:'Platform', color:'white'});
var searchBar           = Ti.UI.createTextField({font:{fontSize:18}, hintText:'Search', color:'#93939e', backgroundColor:'white', right:10, width:'20%'});
var userName            = Ti.UI.createTextField({top:50, autocorrect:false, hintText:'Username', color:'white'});
var userPassword        = Ti.UI.createTextField({top:40, autocorrect:false, passwordMask:true, hintText:'Password', color:'white'});

var addWindow           = Ti.UI.createView({backgroundColor:'#484850', layout:'vertical'});
var deviceWin           = Ti.UI.createView({title:'List Of Devices', backgroundColor:'#484850', barColor:'#B50D00'});
var deviceWindow        = Ti.UI.createView({backgroundColor:'#484850'});
var editWindow          = Ti.UI.createView({backgroundColor:'#484850', layout:'vertical'});
var loginWindow         = Ti.UI.createView({backgroundColor:"#484850", layout:"vertical"});

var cameraWin           = Ti.UI.createWindow({title:'Scan Devices', backgroundColor:'#484850', barColor:'#B50D00'});

var admin               = false;
var loggedIn            = false;
var scanned             = false;

var photo               = null;

var allPlatforms        = [];
var currentPlatforms    = [];
var devices             = [];
var platforms           = [];
var scannedDevices      = [];
var scannedUsers        = [];
var uniqueDevices       = [];
var uniqueUsers         = [];
var uniquePlatforms     = [];

var cameraIndexField;
var currentUser;
var deviceIDValue;
var platformToRemove;
var searchValue;
// GLOBAL VARIABLES \\

// OS SPECIFIC VARIABLES \\
var add                 = Ti.UI.createButton({title:'Add', color:'white', backgroundImage:'none'});
var backToCamera        = Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var backToDevice        = Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var backToDevices       = Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var backToHome          = Ti.UI.createButton({title:'Back', top: '2%', left:'5%'});
var backToPlatforms     = Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var blank               = Ti.UI.createButton({color:'white', backgroundImage:'none'});
var clear               = Ti.UI.createButton({title:'Clear', color:'white', backgroundImage:'none'});
var closeAddWindow      = Ti.UI.createButton({title:'Back', color:'white', backgroundImage:'none'});
var deleteDevice        = Ti.UI.createButton({title:'Delete', color:'red', backgroundImage:'none'});
var edit                = Ti.UI.createButton({title:'Edit', color:'white', backgroundImage:'none'});
var editMobileWeb       = Ti.UI.createButton({title:'Edit', top:'2%', right:'5%'});
var save                = Ti.UI.createButton({title:'Save', color:'white', backgroundImage:'none'});
var toDevices           = Ti.UI.createButton({title:'Devices', color:'white', backgroundImage:'none'});
var upload              = Ti.UI.createButton({title:'Upload', color:'white', backgroundImage:'none'});

var addPage             = false;
var devicePage          = false;
var editPage            = false;
var listPage            = false;
var loginPage           = false;

// OS SPECIFIC VARIABLES \\

// Check for a network connection
if(!Ti.Network.networkType != Ti.Network.NETWORK_NONE){
    var alertDialog = Ti.UI.createAlertDialog({
        title:'WARNING!',
        message:'Your device is not online.\nThis app will not work if you aren\'t connected.',
    });
    alertDialog.show();
}

//-- EDIT DEVICE WINDOW--\\
editWindow.add(devicePlatformValue);
editWindow.add(deviceOSValue);
editWindow.add(deviceModelValue);
editWindow.add(deviceNameValue);
editWindow.add(deviceIMEIValue);
editWindow.add(takePhoto);
editWindow.add(save);
editWindow.add(deleteDevice);
//--EDIT DEVICE WINDOW--\\
//--ADD DEVICE WINDOW--\\
addWindow.add(devicePlatformValue);
addWindow.add(deviceOSValue);
addWindow.add(deviceModelValue);
addWindow.add(deviceNameValue);
addWindow.add(deviceIMEIValue);
addWindow.add(takePhoto);
addWindow.add(upload);
//--ADD DEVICE WINDOW--\\
//--DISPLAY DEVICE WINDOW--\\
deviceWindow.add(deviceImage);
deviceWindow.add(deviceInfo);
//--DISPLAY DEVICE WINDOW--\\

// Set action listeners for the scanner file
scannerFile.setActionListeners();

// Check the users device and load the correct UI
switch(Ti.Platform.osname){
    case('android'):
        androidSetUp.beginAndroid();
        break;
    case('iphone'):
        iOSSetUp.beginiOS();
        break;
    case('ipad'):
        iOSSetUp.beginiOS();
        break;
    case('mobileweb'):
        mobileWebSetUp.beginMobileWeb();
        break;
    default:
        alert('Unsupported Platform!');
        break;
}

// If the user is not using mobileweb, START THE SCANNER!
if (Ti.Platform.osname != 'mobileweb')
    scannerFile.openScanner();

// Open the camera view
cameraWin.open();