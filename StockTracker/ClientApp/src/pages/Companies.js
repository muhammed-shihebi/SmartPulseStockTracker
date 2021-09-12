import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Paper from '@material-ui/core/Paper';
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
import { getSantralsWithDevices } from '../Service';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import {HubConnectionBuilder, LogLevel} from '@microsoft/signalr'
import Button from '@material-ui/core/Button';


const useStyles = makeStyles(theme => ({
    layout: {
        // spacing around the paper
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        height: '80vh'
    },
    mainPaper: {
        margin: theme.spacing(2), // the space around the paper
        height: '100%', // make the paper as big as the layout
        marginBottom: theme.spacing(2)
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
    tabs: {
        marginTop: theme.spacing(2)
    },
    dataSource: {
        marginTop: theme.spacing(2)
    },
    list: {
        overflow: 'auto',
        maxHeight: '60vh'
    }
}));

function Companies() {

    // =========================================================== Consts

    const MAXLISTSIZE = 100;
    const classes = useStyles();
    const theme = useTheme();

    // =========================================================== List

    const [selectedSantralId, setSelectedSantralId] = React.useState(-1);
    const [santrals, setSantrals] = useState([]);
    const [miniSantrals, setMiniSantrals] = useState([]);
    const [selectedSantral, setSelectedSantral] = React.useState({
        id: 0,
        name: "",
        eic: "", 
		santralDevices: []
    });
	const selectedSantralRef = useRef(); 
	const showGridRef = useRef(); 

    const handleListItemClick = (event, santralId) => {
        setSelectedSantralId(santralId);
        var selectedItem = santrals.find(element => element.id === santralId);
        setSelectedSantral(selectedItem);
		selectedSantralRef.current = selectedItem; 
		showDevices(selectedItem); 
    };

    function handleSearch(event) {
        const text = event.target.value;
        var selectedSantrals = santrals.filter(element => {
            return element.name.toLowerCase().includes(text.toLowerCase())
        });
        setMiniSantrals(selectedSantrals);
    }

    function loadSantrals() {
        getSantralsWithDevices().then(data => {
            setSantrals(data);
            setMiniSantrals(data);
			if(showGrid){
 				showDevices(selectedSantral); 
			}
        }); 
    }

	useEffect(() => {
		loadSantrals(); 
		// eslint-disable-next-line
	}, []);

	// =========================================================== Grid 

	const [gridData, setGridData] = useState([]); // are linked to one santral
	// eslint-disable-next-line
	const [gridApi, setGridApi] = useState(); 
	const [showGrid, setShowGrid] = useState(false); 

	function showDevices(selectedItem){
		const dataForGrid = selectedItem.devices.map(d => {
			return ({
				serialNum: d.serialNum, 
				name : d.deviceType.name, 
				message: d.message, 
				state: d.state
			})
		})
		setGridData(dataForGrid)
		setShowGrid(true);
		showGridRef.current = true; 
		getData(); 
	}

    const gridColumnsDefs = [
        {field: 'name', headerName: "Device Name", filter: true, maxWidth: 200},
		{field: 'serialNum', headerName: "Device Serial Number", maxWidth: 200}, 
		{headerName:"Device State", field:"state", valueFormatter:stateFormatter, maxWidth: 200},
		{field: 'message', headerName: "Message" }, 
		
    ]

	function stateFormatter(params){
		switch (params.value) {
			case 1:
				return "Active"; 
			case 2:
				return "Passive"; 
			case 3:
				return "Broken"; 
			default:
				return "No State"; 
		}
	}

	var defaultColDef = {
        flex: 1,
        minWidth: 150
    }

	function onGridReady(params) {
        setGridApi(params.api);
    }

	// =========================================================== SignalR 

	const [connection, setConnection] = useState(); 
	const connectionRef = useRef(); // useRef get updated values but don't cause rerender on change. 

	// in an async function you can just set states and not using them because they don't update here 
	// if you want updated data use useRef() to get updateded values 
	async function getData() {
		try {
			if(!connectionRef.current) {
				console.log("getData got called");
				const con = new HubConnectionBuilder()
				.withUrl("https://localhost:5401/data")
				.configureLogging(LogLevel.Information)
				.build(); 
	
				setConnection(con); 
				connectionRef.current = con; 
	
				con.on("ReceiveData", (newSantrals) => {	
					console.log("ReceiveData got called");	
					setSantrals(newSantrals); 
					setMiniSantrals(newSantrals); 
					if(showGridRef.current){
						const newSelectedSantral = newSantrals.find(santral => santral.id === selectedSantralRef.current.id);
						newSelectedSantral.devices.forEach(device => {
							console.log(device.state);
						});
						showDevices(newSelectedSantral); 
					}
				}); 
	
				con.onclose(e => {
					setConnection(); 
					console.log('connection closed');
				}); 
				await con.start(); 
				await con.invoke("GetData"); 
			}else{
			}
		} catch (error) {
			console.log(error);
		}

	}

	useEffect(() => {
		return function cleanup() {
			connectionRef.current.stop(); 
		}; 
	}, []);

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
	// eslint-disable-next-line
	function showSnackBar (message, severity){
		setSnackProperties({
			open: true, 
			message: message, 
			severity: severity
		})
	}

    // =========================================================== RENDER

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
								Companies
							</Typography>
						</Toolbar>
					</AppBar>
					<Grid container spacing={2}>
						<Grid item xs={3}>
							<TextField
								id="santral-search"
								style={{ margin: 8 }}
								placeholder="Search Companies"
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
								{miniSantrals
									.slice(0, MAXLISTSIZE)
									.map((santral) => {
										return (
											<React.Fragment key={santral.id}>
												<ListItem
													button
													selected={
														selectedSantralId ===
														santral.id
													}
													onClick={(event) =>
														handleListItemClick(
															event,
															santral.id
														)
													}
													alignItems="flex-start"
												>
													<ListItemAvatar>
														<Avatar
															alt={santral.name.trim()}
															src={santral.name.trim()}
														/>
													</ListItemAvatar>
													<ListItemText
														primary={santral.name.trim()}
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
								Company Device Information
							</Typography>
							<hr />
							<form noValidate autoComplete="off">
								<Grid container>
									<Grid item xs={6}>
										<TextField
											style={{
												paddingRight: theme.spacing(1),
											}}
											id="company"
											label="Company"
											fullWidth
											InputProps={{
												readOnly: true,
											}}
											className={classes.formInputs}
											variant="filled"
											value={selectedSantral.name}
										/>
									</Grid>
									<Grid item xs={6}>
										<TextField
											id="company-etso"
											label="Company ETSO"
											fullWidth
											InputProps={{
												readOnly: true,
											}}
											className={classes.formInputs}
											variant="filled"
											value={selectedSantral.eic}
										/>
									</Grid>
								</Grid>
								{showGrid ? (
									<div
										className="ag-theme-alpine"
										style={{ height: "45vh" }}
									>
										<AgGridReact
											rowData={gridData}
											defaultColDef={defaultColDef}
											columnDefs={gridColumnsDefs}
											onGridReady={onGridReady}
										>
										</AgGridReact>
									</div>
								) : null}
							</form>
						</Grid>
					</Grid>
				</Paper>
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
			</main>
		</React.Fragment>
	);
}

export default Companies;