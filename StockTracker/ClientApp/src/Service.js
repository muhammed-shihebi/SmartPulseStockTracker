// =========================================================== Inventory Page

// =========================================================== Device Type 

const baseUrl = "https://localhost:5401/"; 

export async function addDeviceType(deviceType) {
    const response = await fetch(baseUrl + 'AddDeviceType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceType)
    });
    return response;
}

export async function getDeviceTypes() {
    const response = await fetch(baseUrl +'GetDeviceTypes', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
}

export async function deleteDeviceType(deviceType) {
    const response = await fetch(baseUrl +'DeleteDeviceType/'+ deviceType.id, {
		method: "DELETE",
		headers: { "Content-type": "application/json" },
		body: JSON.stringify(deviceType),
	});
	return response; 
}

// =========================================================== Device

export async function addDevice(device) {
    const response = await fetch(baseUrl + 'AddDevice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
    });
    return response;
}

export async function updateDevices(devices) {
    const response = await fetch(baseUrl + 'UpdateDevices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(devices)
    });
    return response;
}

export async function deleteDevice(device){
	const response = await fetch(baseUrl +"DeleteDevice/" + device.id, {
		method: "DELETE",
		headers: { "Content-type": "application/json" },
		body: JSON.stringify(device),
	});
	return response; 
}

export async function getSantrals() {
    const response = await fetch(baseUrl +'GetSantrals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
}

// =========================================================== Companies Page 

export async function getSantralsWithDevices() {
    const response = await fetch(baseUrl +'GetSantralsWithDevices', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
}

export async function updateSantralDevices(data) {
    const response = await fetch(baseUrl +'UpdateSantralDevices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return response;
}

// =========================================================== Tests 

export async function getTest() {
    const response = await fetch(baseUrl+'PrintTest', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    return await response.text();
}