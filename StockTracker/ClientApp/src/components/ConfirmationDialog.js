import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function AlertDialog(props) {

    const handleClose = (event) => {
		var bName = event.currentTarget.name; 
		if(bName === "yes"){
			props.finalDeleteDeviceType();
		}
		props.setOpenDialog(false);
    };

    return (
		<div>
			<Dialog
				open={props.openDialog}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">
					{"Are You Sure you want to delete the Device Type?"}
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						Please be aware that all devices that are associated
						with this Device Type are also going to be deleted. Are
						you sure you want to proceed?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button name={"no"} onClick={handleClose} color="primary">
						No
					</Button>
					<Button name={"yes"} onClick={handleClose} color="primary" autoFocus>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</div>
    );
}