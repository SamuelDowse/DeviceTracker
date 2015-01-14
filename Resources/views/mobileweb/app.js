/**
 * Set up the UI for a mobileweb device.
 * Everything visual outside of the scanning screen is set up in here.
 */
function beginMobileWeb(){
	Ti.API.info(Ti.Platform.osname);
	cameraWin.add(backToDevice);
}

// Export the following functions so they can be used outside of this file
exports.beginMobileWeb = beginMobileWeb;
