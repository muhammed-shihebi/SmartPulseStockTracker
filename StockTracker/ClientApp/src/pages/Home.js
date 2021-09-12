import { Button } from '@material-ui/core';
import React from 'react';
import { getTest } from '../Service';


function getData(){
	getTest().then(response => {
		console.log(response);
	})
}

export default function Home () {
    return (
		<div>
			<h1>Hello, Home!</h1>
			<p>
				This is an application to track the inventory of IoT devices of
				our company.
			</p>

			<Button onClick={getData}> Get Data</Button>
		</div>
	);
}
