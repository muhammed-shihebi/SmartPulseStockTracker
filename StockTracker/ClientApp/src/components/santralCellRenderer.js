import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';


export default props => {
  const handleChange = event => {
    var newData = props.rowdata.map(device=> {
      if(device.id === props.data.id){
		const newSantral = props.santrals.find(s => s.id === event.target.value)
		if(newSantral === undefined){
			return {
				...device,
				santral: null,
				santralId: null
			};
		}else{
			return {
				...device,
				santral: newSantral,
				santralId: newSantral.id
			};
		}
      }else{
        return device; 
      }
    })
    props.setrowdata(newData)
  };

  return (
    <FormControl>
      <Select
        labelId="select-santral"
        id="select-santral"
        onChange={handleChange}
        displayEmpty
        value={props.data.santral === null? "": props.data.santral.id}
        name="SantralId"
      >
		  <MenuItem value=""><em>None</em></MenuItem>
		  {props.santrals.map(santral=> {
			  return <MenuItem key={santral.id} value={santral.id}>{santral.name}</MenuItem>;
		  })}
      </Select>
    </FormControl>
  );
};
