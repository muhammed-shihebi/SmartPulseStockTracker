import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import Search from '@material-ui/icons/Search';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import MuiAlert from '@material-ui/lab/Alert';
import { getDeviceTypes, addDeviceType, deleteDeviceType, getSantrals, addDevice, updateDevices, deleteDevice } from '../Service';
import { AgGridReact, AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import santralCellRenderer from '../components/santralCellRenderer';
import AlertDialog from '../components/ConfirmationDialog';

const useStyles = makeStyles(theme => ({
    layout: {
        height: '84vh'
	},
    mainPaper: {
        height: '100%', // make the paper as big as the layout
        marginBottom: theme.spacing(1)
    },
    menuButton: {
        marginRight: theme.spacing(2) // margen to the menu button
    },
    title: {
        flexGrow: 1 // make title right and button left
    },
    formTitle: {
        margin: theme.spacing(1),
        marginTop: theme.spacing(2),
        fontWeight: 'bold'
    },
    formInputs: {
        marginBottom: theme.spacing(1)
    },
    mainGrid: {
        marginRight: theme.spacing(1)
    },
    list: {
        overflow: 'auto',
        maxHeight: '60vh'
    }, 
	popover: {
		width: "30vw", 
		height: "40vh", 
		padding: theme.spacing(2)
	}, 
	normalButton:{
		marginTop: theme.spacing(1),
		marginRight: theme.spacing(1)
	}, 
	barButton:{
		marginLeft: theme.spacing(2)
	}, 
	formControl: {
		minWidth: 120,
		marginBottom: theme.spacing(1)
	}
}));

export default function Inventory() {

    // =========================================================== Consts

    const classes = useStyles();
	// eslint-disable-next-line
    const theme = useTheme();

    // =========================================================== List

	const [deviceTypes, setDeviceTypes] = useState([]); 
    const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState(-1);
	const [searchedDeviceTypes, setSearchedDeviceTypes] = useState([])
	const initSelectedDeviceTypeValue = {
		id: -1, 
		name: "", 
		devices: []
    }
    const [selectedDeviceType, setSelectedDeviceType] = useState(initSelectedDeviceTypeValue);

	function loadDeviceTypeList() {
		getDeviceTypes().then(response => {
				var programDeviceTypes = response.map(deviceType => {
					return(
						{
							id: deviceType.id, 
							name: deviceType.name, 
							devices: deviceType.devices
						}
					); 
				}); 
				setDeviceTypes(programDeviceTypes); 
				setSearchedDeviceTypes(programDeviceTypes)
				if(showGrid){
					const newSelectedDeviceType = programDeviceTypes.find(deviceType => deviceType.id === selectedDeviceType.id); 
					showDevices(newSelectedDeviceType); 
				}
		})
    }

	useEffect(() => {
		loadDeviceTypeList(); 
		// eslint-disable-next-line
	}, []);

    const handleListItemClick = (event, deviceTypeId) => {
        setSelectedDeviceTypeId(deviceTypeId);
        var selectedItem = deviceTypes.find(element => element.id === deviceTypeId);
        setSelectedDeviceType(selectedItem);
		showDevices(selectedItem); 
    };

    function handleSearch(event) {
        const text = event.target.value;
        var selectedDevices = deviceTypes.filter(element => {
            return element.name.toLowerCase().includes(text.toLowerCase())
        });
        setSearchedDeviceTypes(selectedDevices);
    }

    // =========================================================== Device Type  

	const [openPopover, setOpenPopover] = useState(false); 
	const [addDeviceNameError, setAddDeviceNameError] = useState(false); 
	const [newDeviceType, setNewDeviceType] = useState({
		name: ""
	}); 

	function handleAddDeviceButton(){
		setOpenPopover(true); 
	}

	function onClosePopover(){
		setOpenPopover(false); 
	}

	function handleAddFormChange(event){
		var value = event.target.value;
		setAddDeviceNameError(false); 
		setNewDeviceType({name: value});
	}

	function handleAddTypeButton(){
		if(newDeviceType.name === ""){
			setAddDeviceNameError(true); 
			return; 
		}else{
			addDeviceType(newDeviceType).then(response =>{
				if(response.ok){
					showSnackBar ("Device Type Added Successfully", "success"); 
					loadDeviceTypeList(); 
				}else{
					showSnackBar ("Error", "error"); 
					console.log(response);
				}
				setOpenPopover(false);
				setNewDeviceType({name:""})
			})

		}
	}

	function handleDeleteDeviceTypeButton(){
		if(selectedDeviceType.id === -1){
			showSnackBar ("Please Select a Device Type first", "error"); 
		}else{
			setOpenDialog(true); 
		}
	}

	function finalDeleteDeviceType(){
		const devicesWithSantrals = selectedDeviceType.devices.filter(d => d.santral !== null); 
		if(devicesWithSantrals.length > 0){
			showSnackBar ("You can't delete a Device Type With deviceses associated with a Santral", "error");
		}else{
			deleteDeviceType(selectedDeviceType).then(response => {
				if(response.ok){
					showSnackBar ("Device Type deleted Successfully", "success"); 
					setShowGrid(false); 
					setSelectedDeviceType(initSelectedDeviceTypeValue); 
					loadDeviceTypeList(); 
				}else{
					showSnackBar ("Error", "error"); 
					console.log(response);
				}
			})
		}
	}
	const [openDialog, setOpenDialog] = useState(false);

	// =========================================================== Devices Grid

	const [showGrid, setShowGrid] = useState(false); 
	const [gridData, setGridData] = useState([]); // are linked to one santral
	const [gridApi, setGridApi] = useState(); 
	const [santrals, setSantrals] = useState([]); 

	var defaultColDef = {
        flex: 1,
        minWidth: 150, 
		resizable: true, 
		editable: true
    }

	function onGridReady(params) {
        setGridApi(params.api);
    }

	function showDevices(selectedItem){
		if(selectedItem !== undefined){
			if(selectedItem.id === -1) { // there is no selected device type
				showSnackBar("Please Select a Device first!", "warning"); 
			}else{
				setShowGrid(true); 
				setGridData([...selectedItem.devices]); 
			}
		}else{
			setShowGrid(false); 
			setSelectedDeviceType(initSelectedDeviceTypeValue); 
		}
	}

	function loadSantrals(){
		getSantrals().then(response=>{
			setSantrals(response); 
		})
	}

	function handleSerialNumEdit(event){
		if(event.column.colId === "serialNum"){

			if(event.newValue === ""){
				showSnackBar("Serial number can't be empty", "warning"); 
				let rowNode = gridApi.getRowNode(event.rowIndex);
				rowNode.setDataValue("serialNum", event.oldValue); 
			}else{
				let deviceId = event.data.id; 
				const newGridData = gridData.map(device => {
					if(device.id === deviceId){
						return({
							...device, 
							serialNum: event.newValue
						})
					}else{
						return device; 
					}
				}); 
				setGridData(newGridData); 
			}
		}
	}

	useEffect(() => {
		loadSantrals();  
	}, []);

	// =========================================================== Button under gird 

	const [addDeviceAnchorEl, setAddDeviceAnchorEl] = useState(null); 
	const [selectedSantral, setSelectedSantral] = useState(""); 
	const [emptyDeviceNameError, setEmptyDeviceNameError] = useState(false); 
	const [newDevice, setNewDevice] = useState({
		serialNumber: ""
	})

	function onCloseAddDeivcePopover(){
		setAddDeviceAnchorEl(null); 
	}


	function handleAddDveiceButton(event){
		setAddDeviceAnchorEl(event.currentTarget)
	}

	const openAddDevicePopover = Boolean(addDeviceAnchorEl);

	function handleAddDeviceFormChange(event){
		const newSerialNum = event.target.value; 
		setNewDevice(pervValue=>{
			return({
				...pervValue, 
				serialNumber: newSerialNum,
			})
		})
		setEmptyDeviceNameError(false); 
	}

	function handlePopoverAddDeviceButton(){
		if(newDevice.serialNumber === ""){
			setEmptyDeviceNameError(true); 
		}else{
			const deviceToAdd = { 
				serialNum: newDevice.serialNumber, 
				santralId: selectedSantral.id, 
				deviceTypeId: selectedDeviceType.id
			}
			addDevice(deviceToAdd).then(response => {
				if(response.status === 400){
					showSnackBar("The serial number is already used for other device", "error"); 
				}else if(response.ok){
					showSnackBar("Device was added successfully", "success"); 
					setAddDeviceAnchorEl(null); 
					loadDeviceTypeList();
				}else{
					console.log(response);
					showSnackBar(response.status, "error");
					setAddDeviceAnchorEl(null);  
				}
			})
		}
	}

	function handleSelectSantral(event){
		setSelectedSantral(event.target.value); 
	}
	
	function handleSaveChangesButton(){
		const DataToUpdate = gridData.map(d => {
			return ({
				id : d.id, 
				serialNum: d.serialNum, 
				deviceTypeId: d.deviceTypeId, 
				santralId: d.santralId
			});
		});
		updateDevices(DataToUpdate).then(response => {
			if(response.ok){
				loadDeviceTypeList(); 
				showSnackBar("Data updated Successully", "success"); 
			}else{
				showSnackBar("error", "error"); 
				console.log(response);
			}
		})
	}

	function handleDeleteDeviceButton(){
		let selectedNodes = gridApi.getSelectedNodes();
		let selectedData = selectedNodes.map(node => node.data);
		
		if(selectedData.length <= 0){
			showSnackBar("Please select a device first", "warning"); 
		}else{
			deleteDevice(selectedData[0]).then(response => {
				if(response.ok){
					showSnackBar("Device deleted successfully", "success"); 
					loadDeviceTypeList();
				}else{
					showSnackBar("Error", "error");
					console.log(response);
				}
			})
		}
	}

    // =========================================================== Snackbar

    const [snackProperties, setSnackProperties] = useState({
		open: false, 
		message: "", 
		severity: ""
	});
    const handleSnackClose = () => {
        setSnackProperties(prevValue => {
			return {
				...prevValue, 
				open: false
			}
		})
    };

	function showSnackBar (message, severity){
		setSnackProperties({
			open: true, 
			message: message, 
			severity: severity
		})
	}

	// =========================================================== Render

    return (
		<React.Fragment>
			<CssBaseline />
			<main className={classes.layout}>
				<Paper className={classes.mainPaper}>
					<AppBar position="static" color="default">
						<Toolbar>
							<Typography
								variant="body1"
								className={classes.title}
							>
								Inventory
							</Typography>
							<Button
								onClick={handleAddDeviceButton}
								variant="contained"
								color="primary"
							>
								Add New Device Type
							</Button>
							<Button
								className={classes.barButton}
								onClick={handleDeleteDeviceTypeButton}
								variant="contained"
								color="secondary"
							>
								Delete Device Type
							</Button>
						</Toolbar>
					</AppBar>
					<Grid container spacing={2}>
						<Grid item xs={3}>
							<TextField
								id="santral-search"
								style={{ margin: 8 }}
								placeholder="Search Device Types"
								fullWidth
								margin="normal"
								type="search"
								variant="standard"
								onChange={handleSearch}
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<Search />
										</InputAdornment>
									),
								}}
							/>
							<List className={classes.list}>
								{searchedDeviceTypes.map((device) => {
									return (
										<React.Fragment key={device.id}>
											<ListItem
												key={device.id}
												button
												selected={
													selectedDeviceTypeId ===
													device.id
												}
												onClick={(event) =>
													handleListItemClick(
														event,
														device.id
													)
												}
												alignItems="flex-start"
											>
												<ListItemAvatar>
													<Avatar
														alt={device.name.trim()}
														src={device.name.trim()}
													/>
												</ListItemAvatar>
												<ListItemText
													primary={device.name.trim()}
												/>
											</ListItem>
											<Divider
												variant="inset"
												component="li"
											/>
										</React.Fragment>
									);
								})}
							</List>
						</Grid>
						<Grid item xs className={classes.mainGrid}>
							<Typography
								variant="body1"
								className={classes.formTitle}
							>
								Information
							</Typography>
							<hr />
							<form noValidate autoComplete="off">
								<Grid container spacing={1}>
									<Grid item xs={4}>
										<TextField
											id="device-type"
											fullWidth
											label="Device Type"
											className={classes.formInputs}
											variant="filled"
											value={selectedDeviceType.name}
											name={"name"}
											InputProps={{
												readOnly: true,
											}}
										/>
									</Grid>

									<Grid item xs={4}>
										<TextField
											id="used-device-count"
											label="Used Device Count"
											fullWidth
											InputProps={{
												readOnly: true,
											}}
											className={classes.formInputs}
											variant="filled"
											value={
												selectedDeviceType.devices.filter(
													(dt) => dt.santral !== null
												).length
											}
										/>
									</Grid>
									<Grid item xs={4}>
										<TextField
											id="available-device-count"
											label="Available Device count"
											fullWidth
											InputProps={{
												readOnly: true,
											}}
											className={classes.formInputs}
											variant="filled"
											value={
												selectedDeviceType.devices.filter(
													(dt) => dt.santral === null
												).length
											}
										/>
									</Grid>
								</Grid>
								{showGrid ? (
									<div
										className="ag-theme-alpine"
										style={{
											height: "45vh",
											width: "100%",
										}}
									>
										<AgGridReact
											rowData={gridData}
											defaultColDef={defaultColDef}
											frameworkComponents={{
												santralCellRenderer:
													santralCellRenderer,
											}}
											onGridReady={onGridReady}
											onCellValueChanged={
												handleSerialNumEdit
											}
											rowSelection="single"
										>
											<AgGridColumn field="serialNum" />
											<AgGridColumn
												field="Santral"
												cellRenderer="santralCellRenderer"
												cellRendererParams={{
													rowdata: gridData,
													setrowdata: setGridData,
													santrals: santrals,
												}}
											/>
										</AgGridReact>
										<Button
											className={classes.normalButton}
											variant="contained"
											color="primary"
											onClick={handleAddDveiceButton}
											id={
												openAddDevicePopover
													? "add-device"
													: undefined
											}
										>
											Add New Device
										</Button>

										<Popover
											id={
												openAddDevicePopover
													? "add-device"
													: undefined
											}
											open={openAddDevicePopover}
											onClose={onCloseAddDeivcePopover}
											anchorEl={addDeviceAnchorEl}
											anchorOrigin={{
												vertical: "top",
												horizontal: "right",
											}}
											transformOrigin={{
												vertical: "bottom",
												horizontal: "center",
											}}
										>
											<div className={classes.popover}>
												<form
													noValidate
													autoComplete="off"
												>
													<FormControl
														fullWidth
														className={
															classes.formControl
														}
													>
														<TextField
															error={
																emptyDeviceNameError
															}
															id="device-serilaNum"
															label="Device Serial Number"
															fullWidth
															className={
																classes.formInputs
															}
															variant="filled"
															name={"serilaNum"}
															value={
																newDevice.serialNumber
															}
															onChange={
																handleAddDeviceFormChange
															}
														/>
													</FormControl>
													<FormControl
														fullWidth
														className={
															classes.formControl
														}
													>
														<InputLabel
															shrink
															id="santral-optional"
														>
															Santral (Optional)
														</InputLabel>
														<Select
															labelId="add-device-select-santral"
															id="add-device-select-santral"
															value={
																selectedSantral
															}
															onChange={
																handleSelectSantral
															}
															displayEmpty
														>
															<MenuItem value="">
																<em>None</em>
															</MenuItem>

															{santrals.map(
																(santral) => {
																	return (
																		<MenuItem
																			key={
																				santral.id
																			}
																			value={
																				santral
																			}
																		>
																			{
																				santral.name
																			}
																		</MenuItem>
																	);
																}
															)}
														</Select>
													</FormControl>

													<Button
														onClick={
															handlePopoverAddDeviceButton
														}
														variant="contained"
														color="inherit"
													>
														Add
													</Button>
												</form>
											</div>
										</Popover>

										<Button
											className={classes.normalButton}
											variant="contained"
											color="inherit"
											onClick={handleSaveChangesButton}
										>
											Save Changes
										</Button>
										<Button
											className={classes.normalButton}
											variant="contained"
											color="secondary"
											onClick={handleDeleteDeviceButton}
										>
											Delete Device
										</Button>
									</div>
								) : null}
							</form>
						</Grid>
					</Grid>
				</Paper>
				<Popover
					id={"add-device"}
					open={openPopover}
					onClose={onClosePopover}
					anchorReference="anchorPosition"
					anchorPosition={{ top: 200, left: 1200 }}
					anchorOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
					transformOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
				>
					<div className={classes.popover}>
						<form noValidate autoComplete="off">
							<TextField
								error={addDeviceNameError}
								id="device-name"
								label="Device Name"
								fullWidth
								className={classes.formInputs}
								variant="filled"
								name={"name"}
								value={newDeviceType.came}
								onChange={handleAddFormChange}
							/>
							<Button
								onClick={handleAddTypeButton}
								variant="contained"
								color="inherit"
							>
								Add
							</Button>
						</form>
					</div>
				</Popover>
			</main>
			<Snackbar
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				autoHideDuration={2000}
				open={snackProperties.open}
				onClose={handleSnackClose}
				key={"snackBar"}
			>
				<MuiAlert
					onClose={handleSnackClose}
					severity={snackProperties.severity}
					elevation={2}
					variant="filled"
				>
					{snackProperties.message}
				</MuiAlert>
			</Snackbar>
			<AlertDialog
				openDialog={openDialog}
				setOpenDialog={setOpenDialog}
				finalDeleteDeviceType={finalDeleteDeviceType}
			></AlertDialog>
		</React.Fragment>
	);
}

