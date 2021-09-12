export function getUsedDevicesCount(device){
	if(device.santralDevices.length !== 0){
		var count = 0; 
		for (let i = 0; i < device.santralDevices.length; i++) {
			const sd = device.santralDevices[i];
			count += sd.count; 
		}
		return count; 
	}else{ 
		return 0; 
	}
}
