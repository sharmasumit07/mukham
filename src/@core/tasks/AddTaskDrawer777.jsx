
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import FormGroup from '@mui/material/FormGroup';
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useContext, useEffect, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'
import { Checkbox, FormControl, Grid, Input, InputLabel, ListItemText, MenuItem, Select } from '@mui/material'
import CustomInput from "src/views/forms/form-elements/pickers/PickersCustomInput"
import DatePicker from 'react-datepicker'
import FileUploader from './FileUploader'
import Repeater from 'src/@core/components/repeater'
import Collapse from '@mui/material/Collapse'

const Header = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(3, 4),
	justifyContent: 'space-between',
	backgroundColor: theme.palette.background.default
}))


const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8

const MenuProps = {
	PaperProps: {
		style: {
			width: 250,
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP
		}
	}
}


const AddTaskDrawer = props => {
	const [addData, setAddData] = useState()
	const { open, toggle } = props
	const [isLoading, setIsLoading] = useState(false)
	const [siteOptions, setSiteOptions] = useState([])
	const [userOptions, setUserOptions] = useState([])
	const [count, setCount] = useState(0)
	const [countDetailing, setCountDetailing] = useState(0)
	const [selectedUom, setSelectedUom] = useState('')
	const [unitOptions, setUnitOptions] = useState([])

	const [detailingItems, setDetailingItems] = useState([{detailing_name: '', detailing_description: '', length:'', breadth:'', whd:'',diameter:'', start_date: '', actual_start_date: '', end_date: '',  status: 'Yet to Start' , com:selectedUom, unit:'', weight:'', total_uom:''}])

	const [items, setItems] = useState([{ subtask_name: '', sub_task_description: '', start_date: '', length:'', breadth:'', whd:'',diameter:'', actual_start_date: '', end_date: '',  status: 'Yet to Start', detailing: detailingItems , com:selectedUom, unit:'', weight:'', total_uom:''}])
	
	const { user } = useContext(AuthContext)
	const initialFormData = {
		task_name: '', task_description: '', assigned_emp: [], start_date: '', actual_start_date: '', end_date: '', actual_end_date: '', status: 'Yet to Start', sub_tasks: items, total_subtasks: '', length:'', breadth:'', whd:'', diameter:'',   com:selectedUom,
		completed_subtasks: "", file_names: '', site_id: '', org_id: '', unit:'', weight:'',total_uom:''
	}
	
	const [formData, setFormData] = useState(initialFormData)

	const handleDetailChange = (index, event) => {
		const updatedDetailingItems = [...detailingItems]; // Create a copy to avoid mutation
		updatedDetailingItems[index][event.target.name] = event.target.value;
	  
		// Update unit-specific calculations only when relevant fields change
		if (event.target.name === 'length' || event.target.name === 'breadth' || event.target.name === 'whd' || event.target.name === 'unit') {
		  updatedDetailingItems[index].total_uom = calculateTotal3(index);
		}
	  
		setDetailingItems(updatedDetailingItems);
	};

	const handleItemsChange = (event, index) => {
		const updatedItems = [...items]; // Create a copy to avoid mutation
		updatedItems[index][event.target.name] = event.target.value;
	  
		// Update unit-specific calculations only when relevant fields change
		if (event.target.name === 'length' || event.target.name === 'breadth' || event.target.name === 'whd' || event.target.name === 'unit') {
		  updatedItems[index].total_uom = calculateTotal2(index);
		}
	  
		setItems(updatedItems);
	};

	const handleFormChange = (event) => {
		// const { [event.target.name]: newValue, ...rest } = formData;
		const updatedForm = {
			...formData,
			[event.target.name]: event.target.value
		};
	  
		if (event.target.name === 'length' || event.target.name === 'breadth' || event.target.name === 'whd' || event.target.name === 'unit') {
		  updatedForm.total_uom = calculateTotal();
		}
	  
		setFormData(updatedForm); 
	  };
	  

	useEffect(() => {
		// Update items whenever detailingItems changes
		const updatedItems = items.map(item => ({
			...item,
			detailing: detailingItems
		}));
		setItems(updatedItems);
	}, [detailingItems]);

	useEffect(() => {
		let completed = 0;
		items.forEach(item => {
			item.status == "Completed" ? completed++ : null
		});

		setFormData({
			...formData, sub_tasks: JSON.stringify(items), total_subtasks: items.length, completed_subtasks: completed
		})
	}, [items])

	

	const addTask = async (e) => {
		e.preventDefault()
		setIsLoading(true);
		try {
			console.log(formData)
			const data = await AxiosPost('addTask.php', {  orgId: user.orgId, ...formData })
			console.log(data)
			if (data.success) {
				toast.success("Task added successfully")
				handleClose()
			}
			else toast.error(data.error)
		} catch (err) {
			toast.error("Server Error!");
			console.log(err)
		}
		finally {
			setIsLoading(false);
		}
	}

	const handleClose = () => {
		setCount(0)
		setCountDetailing(0)
		setFormData(initialFormData)
		setDetailingItems([{detailing_name: '', detailing_description: '', length:'', breadth:'', whd:'',diameter:'', start_date: '', actual_start_date: '', end_date: '',  status: 'Yet to Start' , com:selectedUom, unit:'', weight:'', total_uom:''}])
		setItems([{ subtask_name: '', sub_task_description: '', start_date: '', length:'', breadth:'', whd:'',diameter:'', actual_start_date: '', end_date: '',  status: 'Yet to Start', detailing: detailingItems  , com:selectedUom, unit:'', weight:'', total_uom:''}])		
		setAddData()
		toggle()
	}

	const fetchSiteOptions = async () => {
		setIsLoading(true);
		try {
			const data = await AxiosPost('fetchSiteOptions.php', { org_id: user.orgId })
			console.log(data)
			if (data.success) {
				setSiteOptions(data.options)
			}
			else toast.error(data.error)
		} catch (err) {
			console.log(err)
		}
		finally {
			setIsLoading(false);
		}
	}

	const fetchUnitOptions = async () => {
		try {
		  const data = await AxiosPost('fetchUnitOptions.php', { orgId: user.orgId })
		  // console.log("payment",data)
		  if (data.success) {
			setUnitOptions(data.unitOptions)
		  }
		  else toast.error(data.error)
		} catch (err) {
		  toast.error("Server Error!");
		  console.log(err)
		}
		finally {
		  setIsLoading(false);
		}
	  }

	const fetchUserOptions = async () => {
		setIsLoading(true);
		try {
			const data = await AxiosPost('fetchUsersBySIteId.php', { site_id: formData.site_id })
			console.log(data)
			if (data.success) {
				setUserOptions(data.options)
			}
			else toast.error(data.error)
		} catch (err) {
			console.log(err)
		}
		finally {
			setIsLoading(false);
		}
	}

	useEffect(() => { fetchUserOptions() }, [formData.site_id])

	useEffect(() => { fetchSiteOptions(); }, [])

	const onChangeHandler = (e) => {
		// Get the selected unit from the event
		const selectedUnit = e.target.value;
		
		// Initialize comValue to an empty string
		let comValue = '';
	
		// Map the selected unit to the corresponding com value
		if (selectedUnit === 'm' || selectedUnit === 'feet') {
			// Set comValue and update selectedUom state
			comValue = 'Running Uom';
			setSelectedUom('Running Uom');
		} else if (selectedUnit === 'sq.m' || selectedUnit === 'sq.ft') {
			// Set comValue and update selectedUom state
			comValue = 'Square Uom';
			setSelectedUom('Square Uom');
		} else if (selectedUnit === 'cubic m' || selectedUnit === 'cubic feet') {
			// Set comValue and update selectedUom state
			comValue = 'Cubic Uom';
			setSelectedUom('Cubic Uom');
		}
	
		// Prepare the new formData state
		const newFormData = {
			...formData,
			[e.target.name]: e.target.value
		};
	
		// Check if comValue is not empty, then include it in the formData
		if (comValue !== '') {
			newFormData.com = comValue;
		}
	
		// Update the formData state
		setFormData(newFormData);
	};
	

	const onChangeHandlerUom = (e) => {
		setSelectedUom(e.target.value)
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}
	
	const onChangeHandlerUom2 = (e) => {
		setSelectedUom(e.target.value)
		setItems({ ...items, [e.target.name]: e.target.value })
	}

	const onChangeHandlerUom3 = (e) => {
		setSelectedUom(e.target.value)
		setDetailingItems({ ...detailingItems, [e.target.name]: e.target.value })
	}

	const onChangeHandler2 = (e, j) => {
		const selectedUnit = e.target.value;
		let comValue = '';
	
		// Map the selected unit to the corresponding com value
		if (selectedUnit === 'm' || selectedUnit === 'feet') {
			setSelectedUom('Running Uom');
			comValue = 'Running Uom';
		} else if (selectedUnit === 'sq.m' || selectedUnit === 'sq.ft') {
			comValue = 'Square Uom';
			setSelectedUom('Square Uom');
		} else if (selectedUnit === 'cubic m' || selectedUnit === 'cubic feet') {
			comValue = 'Cubic Uom';
			setSelectedUom('Cubic Uom');
		}
	
		setItems(prevState => {
			const newArray = [...prevState];
	
			// Create a new object with updated values
			const updatedItem = {
				...newArray[j],
				[e.target.name]: e.target.value
			};
	
			// Only set com property if comValue is not empty
			if (comValue !== '') {
				updatedItem.com = comValue;
			}
	
			// Update the newArray with the updatedItem at index j
			newArray[j] = updatedItem;
	
			console.log(newArray); // Log the updated array for debugging
	
			return newArray;
		});
	};
	

	const onChangeHandler3 = (e, i) => {
		const selectedUnit = e.target.value;
		let comValue = '';
	
		// Map the selected unit to the corresponding com value
		if (selectedUnit === 'm' || selectedUnit === 'feet') {
			setSelectedUom('Running Uom');
			comValue = 'Running Uom';
		} else if (selectedUnit === 'sq.m' || selectedUnit === 'sq.ft') {
			comValue = 'Square Uom';
			setSelectedUom('Square Uom');
		} else if (selectedUnit === 'cubic m' || selectedUnit === 'cubic feet') {
			comValue = 'Cubic Uom';
			setSelectedUom('Cubic Uom');
		}
	
		setDetailingItems(prevState => {
			const newArrayDet = [...prevState];
	
			// Create a new object with updated values
			const updatedItem = {
				...newArrayDet[i],
				[e.target.name]: e.target.value
			};
	
			// Only set com property if comValue is not empty
			if (comValue !== '') {
				updatedItem.com = comValue;
			}
	
			// Update the newArrayDet with the updatedItem at index i
			newArrayDet[i] = updatedItem;
	
			// Log the updated array for debugging
			console.log(newArrayDet);
	
			return newArrayDet;
		});
	};
	


	const deleteForm = (e, i) => {
		e.preventDefault()
		setCount(count - 1)
		const updatedItems = items.filter((item, index) => index !== i);
		setItems(updatedItems);
		if(count === 1) {
			setCountDetailing(0);
		}
	}
	console.log("Count",count)
	console.log("CountDetail",countDetailing)

	const deleteFormDetailing = (e, i) => {
		e.preventDefault()
		setCountDetailing(countDetailing - 1)
		// console.log("CountDetail",countDetailing)
		const updatedItemsDetailing = detailingItems.filter((item, index) => index !== i);
		setDetailingItems(updatedItemsDetailing);
	}

	const calculateTotal = () => {
		if (formData.unit === 'cubic m') {
		  return formData.length * formData.breadth * formData.whd;
		} else if (formData.unit === 'sq.m') {
		  return formData.length * formData.breadth;
		} else if (formData.unit === 'm') {
		  return formData.length;
		} else {
		  return ''; 
		}
	};
	
	const calculateTotal2 = (i) => {
		if (items[i].unit === 'cubic m') {
		  return items[i].length * items[i].breadth * items[i].whd;
		} else if (items[i].unit === 'sq.m') {
		  return items[i].length * items[i].breadth;
		} else if (items[i].unit === 'm') {
		  return items[i].length;
		} else {
		  return ''; 
		}
	};

	const calculateTotal3 = (j) => {
		if (detailingItems[j].unit === 'cubic m') {
		  return detailingItems[j].length * detailingItems[j].breadth * detailingItems[j].whd;
		} else if (detailingItems[j].unit === 'sq.m') {
		  return detailingItems[j].length * detailingItems[j].breadth;
		} else if (detailingItems[j].unit === 'm') {
		  return detailingItems[j].length;
		} else {
		  return ''; 
		}
	};

	const [checked, setChecked] = useState(false);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

	useEffect(() => {
		fetchUnitOptions()
	  }, []);

	// console.log("Data",formData)

	//   console.log(selectedUom);
	  
	return (
		<Drawer open={open} anchor='right' variant='temporary' onClose={handleClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 600, sm: 1535 } } }} >
			<Header>
				<Typography variant='h6'>Add Task</Typography>
				<IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
					<Icon icon='mdi:close' fontSize={20} />
				</IconButton>
			</Header>
			<Box sx={{ p: 5 }}>
				<form onSubmit={(e) => { addTask(e) }}>
					<Grid container spacing={6}>
						<Grid item md={6}>
							<TextField required fullWidth size='small' type='text' label='Task Name' value={formData.task_name} name='task_name' onChange={onChangeHandler} />
						</Grid>
						<Grid item md={6}>
							<TextField required fullWidth size='small' type='text' label='Task Description' value={formData.task_description} name='task_description' onChange={onChangeHandler} />
						</Grid>
						<Grid item md={6}>
							<TextField required fullWidth size='small' type='date' label='Start Date' value={formData.start_date} name='start_date' onChange={onChangeHandler} InputLabelProps={{ shrink: true }} />
						</Grid>
						{/* <Grid item md={6}>
							<TextField  fullWidth type='date' label='Actual Start Date' value={formData.actual_start_date} name='actual_start_date' onChange={onChangeHandler} InputLabelProps={{ shrink: true }} />
						</Grid> */}
						<Grid item md={6}>
							<TextField required fullWidth size='small' type='date' label='End Date' value={formData.end_date} name='end_date' onChange={onChangeHandler} InputLabelProps={{ shrink: true }} />
						</Grid>
						{/* <Grid item md={6}>
							<TextField fullWidth type='date' label='Actual End Date' value={formData.actual_end_date} name='actual_end_date' onChange={onChangeHandler} InputLabelProps={{ shrink: true }} />
						</Grid> */}
						<Grid item md={6}>
							<FormControl fullWidth>
								<InputLabel size='small' id='demo-simple-select-outlined-label'>Site Name</InputLabel>
								<Select
									label='Site Name'
									defaultValue=''
									id='demo-simple-select-outlined'
									labelId='demo-simple-select-outlined-label'
									name='site_id'
									size='small'
									value={formData.site_id}
									onChange={onChangeHandler}
								>
									{siteOptions.map(site => <MenuItem value={site.site_id}>{site.site_name}</MenuItem>)}
								</Select>
							</FormControl>
						</Grid>
						<Grid item md={6}>
							<FormControl fullWidth>
								<InputLabel size='small' id='demo-simple-select-outlined-label'>Status</InputLabel>
								<Select
									label='Status'
									size='small'
									id='demo-simple-select-outlined'
									labelId='demo-simple-select-outlined-label'
									name='status'
									value={formData.status}
									onChange={onChangeHandler}
								>
									<MenuItem value="Yet to Start">Yet to Start</MenuItem>
									<MenuItem value="In-Progress">In-Progress</MenuItem>
									<MenuItem value="Completed">Completed</MenuItem>
								</Select>
							</FormControl>
						</Grid>

						
						
						{(count === 0 && countDetailing === 0) &&(
							<>
							<Grid item  md={6} >
								<FormControl fullWidth>
									<InputLabel size='small' id='demo-simple-select-outlined-label'>Unit of Measurement</InputLabel>
										<Select
										label='Unit of Measurement'
										size='small'
										id="outlined-read-only-input"
										name='unit'
										value={formData.unit}
										onChange={onChangeHandler}
									>
										{unitOptions && unitOptions.map((unit, index) => {
										try {
											const unitValues = JSON.parse(unit.options_value);
											return unitValues.map((value, valueIndex) => (
											<MenuItem key={index + '-' + valueIndex} value={value}>
												{value}
											</MenuItem>
											));
										} catch (error) {
											console.error("Error parsing payment options:", error);
											return null; // Or render a placeholder message
										}
										})}
									</Select>
								</FormControl>
							</Grid>
							<Grid item md={6}>
								<FormControl fullWidth>									
										<TextField
										label='Measurements'
										fullWidth
										id='demo-simple-select-outlined'
										labelId='demo-simple-select-outlined-label'
										name='com'
										size="small"
										defaultValue="Measurements"
										value={formData.com}
										onChange={onChangeHandlerUom}
										InputProps={{
											readOnly: true,
										}}
									>
										{/* <MenuItem value="Running Uom">Running Uom</MenuItem>
										<MenuItem value="Square Uom">Square Uom</MenuItem>
										<MenuItem value="Cubic Uom">Cubic Uom</MenuItem> */}
									</TextField>
								</FormControl>
								
							</Grid>

							<Grid item md={6}>
								<TextField
								sx={{bgcolor: 'greenyellow'}}
								fullWidth
								size='small'
								id="outlined-read-only-input"
								label="Total"
								name="total_uom"
								value={calculateTotal()}
								InputProps={{
									readOnly: true,
								}}
								/>
							</Grid>

							<Grid item md={6}>
								<TextField label="Length"
									multiline
									size='small'
									name='length'
									value={formData.length} onChange={handleFormChange}
									fullWidth
								/>
							</Grid>

							{(selectedUom === 'Square Uom' || selectedUom === 'Cubic Uom') && (
								<Grid item md={6}>
								<TextField label="Breadth"
									fullWidth
									multiline
									size='small'
									name='breadth'
									value={formData.breadth} onChange={handleFormChange} 
								/>
								</Grid>
							)}

							{selectedUom === 'Cubic Uom' && (
								<Grid item md={6}>
								<TextField label="Width/Height/Depth"
									multiline
									size='small'
									name='whd'
									value={formData.whd} onChange={handleFormChange}
									fullWidth
								/>
								</Grid>
						)}
							<Grid item md={6}>
						<FormGroup>
							<FormControlLabel
								control={<Switch checked={checked} onChange={handleChange} />}
								label={checked ? 'Hide Diameter & Weight' : 'Show Diameter & Weight'}
							/>
							{checked && (
								<>
									<Grid item lg={5} sm={12}>
										<TextField label="Diameter"
											fullWidth
											multiline
											size='small'
											name='diameter'
											value={formData.diameter} onChange={onChangeHandler}
											sx={{ mt: 3.5 }}
										/>
									</Grid>
									<Grid item lg={5} sm={12}>
										<TextField label="Weight (Kg)"
											fullWidth
											multiline
											size='small'
											name='weight'
											value={formData.weight} onChange={onChangeHandler}
											sx={{ mt: 3.5 }}
										/>
									</Grid>
								</>
							)}
						</FormGroup>
						</Grid>					
						</>
																
					)}
						
						<Grid item md={12}>
							<Repeater count={count}>
								{i => {
									const Tag = i === 0 ? Box : Collapse
									return (
										<Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
											<Grid sx={{ display: "flex" }} container>
												<Grid container sx={{ py: 4, width: '100%', pr: { lg: 0, xs: 4 } }}>
													<Grid item sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
														<Typography variant='subtitle2' className='col-title' sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}>
															Sub Task {i + 1}
														</Typography>
														<Grid container spacing={3} sx={{ display: "flex" }}>
															<Grid item lg={5} sm={12}>
																<TextField label="Sub Task Name"
																	fullWidth
																	multiline
																	size='small'
																	name='subtask_name'
																	value={items[i].subtask_name} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																/>
															</Grid>
															
															<Grid item lg={5} sm={12}>
																<TextField
																	fullWidth
																	size='small'
																	name='sub_task_description'
																	value={items[i].sub_task_description} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																	label="Sub Task Description"
																/>
															</Grid>
															<Grid sm={1}>
																<IconButton size='small' onClick={(e) => { console.log(i); deleteForm(e, i); }}>
																	<Icon icon='mdi:close' fontSize={20} />
																</IconButton>
															</Grid>
															<Grid item lg={5} sm={12}>
																<TextField
																	fullWidth
																	size='small'
																	name='start_date'
																	value={items[i].start_date} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																	label="Start Date"
																	type='date'
																	InputLabelProps={{ shrink: true }}
																/>
															</Grid>
															<Grid item lg={5} sm={12}>
																<TextField
																	fullWidth
																	size='small'
																	name='end_date'
																	value={items[i].end_date} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																	label="End Date"
																	type='date'
																	InputLabelProps={{ shrink: true }}
																/>
															</Grid>
															<Grid item lg={5} sm={12}>
																<TextField
																	fullWidth
																	size='small'
																	name='actual_start_date'
																	value={items[i].actual_start_date} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																	label="Actual Start Date"
																	type='date'
																	InputLabelProps={{ shrink: true }}
																/>
															</Grid>
															
															{/* <Grid item lg={5} sm={12}>
																<TextField
																	fullWidth
																	size='small'
																	name='actual_end_date'
																	value={items[i].actual_end_date} onChange={(e) => onChangeHandler2(e, i)}
																	sx={{ mt: 3.5 }}
																	label="Actual End Date"
																	type='date'
																	InputLabelProps={{ shrink: true }}
																/>
															</Grid> */}
															
															<Grid item lg={5} sm={12}>
																<FormControl fullWidth 
																	sx={{ mt: 3.5 }}>
																	<InputLabel size='small' id='demo-simple-select-outlined-label'>Status</InputLabel>
																	<Select
																		size='small'
																		label='Status'
																		id='demo-simple-select-outlined'
																		labelId='demo-simple-select-outlined-label'
																		name='status'
																		value={items[i].status}
																		onChange={(e) => onChangeHandler2(e, i)}
																	>
																		<MenuItem value="Yet to Start">Yet to Start</MenuItem>
																		<MenuItem value="In-Progress">In-Progress</MenuItem>
																		<MenuItem value="Completed">Completed</MenuItem>
																	</Select>
																</FormControl>
															</Grid>
															
															{count >=1 && countDetailing === 0 &&(
																<>
																	<Grid item  lg={5} sm={12}>
																		<FormControl fullWidth>
																			<InputLabel size='small' id='demo-simple-select-outlined-label'>Unit of Measurement</InputLabel>
																				<Select
																				size='small'
																				label='Unit of Measurement'
																				fullWidth
																				id="outlined-read-only-input"
																				name='unit'
																				value={items[i].unit}
																				onChange={(e) => onChangeHandler2(e, i)}
																			>
																				{unitOptions && unitOptions.map((unit, index) => {
																				try {
																					const unitValues = JSON.parse(unit.options_value);
																					return unitValues.map((value, valueIndex) => (
																					<MenuItem key={index + '-' + valueIndex} value={value}>
																						{value}
																					</MenuItem>
																					));
																				} catch (error) {
																					console.error("Error parsing payment options:", error);
																					return null; // Or render a placeholder message
																				}
																				})}
																			</Select>
																		</FormControl>
																	</Grid>
																	<Grid item lg={5} sm={12}>
																		<FormControl fullWidth>
																				<TextField
																				size='small'
																				label='Measurements'
																				id='demo-simple-select-outlined'
																				labelId='demo-simple-select-outlined-label'
																				name='com'
																				defaultValue="Measurements"
																				value={items[i].com}
																				onChange={(e) => onChangeHandlerUom2(e, i)}
																				InputProps={{
																					readOnly: true,
																				}}
																			>
																				{/* <MenuItem value="Running Uom">Running Uom</MenuItem>
																				<MenuItem value="Square Uom">Square Uom</MenuItem>
																				<MenuItem value="Cubic Uom">Cubic Uom</MenuItem> */}
																			</TextField>
																		</FormControl>
																	</Grid>

																	<Grid item lg={5} sm={12}>
																		<TextField
																		size='small'
																		sx={{bgcolor: 'greenyellow'}}
																		fullWidth
																		id="outlined-read-only-input"
																		label="Total"
																		value={calculateTotal2(i)}
																		InputProps={{
																			readOnly: true,
																		}}
																		/>
																	</Grid>

																	<Grid item lg={5} sm={12}>
																		<TextField label="Length"
																			fullWidth
																			multiline
																			size='small'
																			name='length'
																			value={items[i].length} onChange={(e) => handleItemsChange(e, i)}
																		/>
																	</Grid>


																	{(selectedUom === 'Square Uom' || selectedUom === 'Cubic Uom') && (
																		<Grid item lg={5} sm={12}>
																		<TextField label="Breadth"
																			fullWidth
																			multiline
																			size='small'
																			name='breadth'
																			value={items[i].breadth} onChange={(e) => handleItemsChange(e, i)}
																		/>
																		</Grid>
																	)}

																	{selectedUom === 'Cubic Uom' && (
																		<Grid item lg={5} sm={12}>
																		<TextField label="Width/Height/Depth"
																			fullWidth
																			multiline
																			size='small'
																			name='whd'
																			value={items[i].whd} onChange={(e) => handleItemsChange(e, i)}
																		/>
																		</Grid>
																	)}


																	<FormGroup>
																		<FormControlLabel
																			control={<Switch checked={checked} onChange={handleChange} />}
																			label={checked ? 'Hide Diameter & Weight' : 'Show Diameter & Weight'}
																		/>
																		{checked && (
																			<Box>
																				<Grid item lg={5} sm={12}>
																				<TextField label="Diameter"
																					fullWidth
																					multiline
																					size='small'
																					name='subtask_diameter'
																					value={items[i].diameter} onChange={(e) => onChangeHandler2(e, i)}
																					sx={{ mt: 2.5 }}
																				/>
																				</Grid>

																				<Grid item lg={5} sm={12}>
																				<TextField label="Weight (Kg)"
																					fullWidth
																					multiline
																					size='small'
																					name='subtask_weight'
																					value={items[i].weight} onChange={(e) => onChangeHandler2(e, i)}
																					sx={{ mt: 2.5 }}
																				/>
																				</Grid>
																			</Box>
																		)}
																	</FormGroup>
																</>

																)}



															{/* Detailing */}

															<Grid>
															<Repeater count={countDetailing}>
																	{j => {
																		const Tag = j === 0 ? Box : Collapse

																		return (
																			<Tag key={j} className='repeater-wrapper' {...(j !== 0 ? { in: true } : {})}>
																				<Grid sx={{ display: "flex" }} container>
																					<Grid container sx={{ py: 4, width: '100%', pr: { lg: 0, xs: 4 } }}>
																						<Grid item sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
																							<Typography variant='subtitle2' className='col-title' sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}>
																								Detailing {j + 1}
																							</Typography>
																							<Grid container spacing={3} sx={{ display: "flex" }}>
																								<Grid item lg={5} sm={12}>
																									<TextField label="Detailing Name"
																										fullWidth
																										multiline
																										size='small'
																										name='detailing_name'
																										value={detailingItems[j].detailing_name} onChange={(e) => onChangeHandler3(e, j)}
																										sx={{ mt: 3.5 }}
																									/>
																								</Grid>
																								<Grid item lg={5} sm={12}>
																									<TextField
																										fullWidth
																										size='small'
																										name='detailing_description'
																										value={detailingItems[j].detailing_description} onChange={(e) => onChangeHandler3(e, j)}
																										sx={{ mt: 3.5 }}
																										label="Detailing Description"
																									/>
																								</Grid>
																								<Grid sm={1}>
																									<IconButton size='small' onClick={(e) => { console.log(i); deleteFormDetailing(e,j); }}>
																										<Icon icon='mdi:close' fontSize={20} />
																									</IconButton>
																								</Grid>
																								<Grid item lg={5} sm={12}>
																									<TextField
																										fullWidth
																										size='small'
																										name='start_date'
																										value={detailingItems[j].start_date} onChange={(e) => onChangeHandler3(e, j)}
																										sx={{ mt: 3.5 }}
																										label="Start Date"
																										type='date'
																										InputLabelProps={{ shrink: true }}
																									/>
																								</Grid>
																								<Grid item lg={5} sm={12}>
																									<TextField
																										fullWidth
																										size='small'
																										name='end_date'
																										value={detailingItems[j].end_date} onChange={(e) => onChangeHandler3(e, j)}
																										sx={{ mt: 3.5 }}
																										label="End Date"
																										type='date'
																										InputLabelProps={{ shrink: true }}
																									/>
																								</Grid>
																								<Grid item lg={5} sm={12}>
																									<TextField
																										fullWidth
																										size='small'
																										name='actual_start_date'
																										value={detailingItems[j].actual_start_date} onChange={(e) => onChangeHandler3(e, j)}
																										label="Actual Start Date"
																										type='date'
																										InputLabelProps={{ shrink: true }}
																									/>
																								</Grid>
																								{/* <Grid item lg={5} sm={12}>
																									<TextField
																										fullWidth
																										size='small'
																										name='actual_end_date'
																										value={items[i].actual_end_date} onChange={(e) => onChangeHandler2(e, i)}
																										sx={{ mt: 3.5 }}
																										label="Actual End Date"
																										type='date'
																										InputLabelProps={{ shrink: true }}
																									/>
																								</Grid> */}
																								
																								<Grid item lg={5} sm={12}>
																									<FormControl fullWidth>
																										<InputLabel id='demo-simple-select-outlined-label' size='small'>Status</InputLabel>
																										<Select
																											size='small'
																											label='Status'
																											id='demo-simple-select-outlined'
																											labelId='demo-simple-select-outlined-label'
																											name='status'
																											value={detailingItems[j].status}
																											onChange={(e) => onChangeHandler3(e, j)}
																										>
																											<MenuItem value="Yet to Start">Yet to Start</MenuItem>
																											<MenuItem value="In-Progress">In-Progress</MenuItem>
																											<MenuItem value="Completed">Completed</MenuItem>
																										</Select>
																									</FormControl>
																								</Grid>

																								

																								{count >=1 && countDetailing > 0 &&(
																									<>
																										<Grid item lg={5} sm={12}>
																											<FormControl fullWidth>
																												<InputLabel size='small' id='demo-simple-select-outlined-label'>Unit of Measurement</InputLabel>
																													<Select
																													label='Unit of Measurement'
																													fullWidth
																													size='small'
																													id="outlined-read-only-input"
																													name='unit'
																													value={detailingItems[j].unit}
																													onChange={(e) => onChangeHandler3(e, j)}
																												>
																													{unitOptions && unitOptions.map((unit, index) => {
																													try {
																														const unitValues = JSON.parse(unit.options_value);
																														return unitValues.map((value, valueIndex) => (
																														<MenuItem key={index + '-' + valueIndex} value={value}>
																															{value}
																														</MenuItem>
																														));
																													} catch (error) {
																														console.error("Error parsing payment options:", error);
																														return null; // Or render a placeholder message
																													}
																													})}
																												</Select>
																											</FormControl>
																										</Grid>
																										<Grid item lg={5} sm={12}>
																											<FormControl fullWidth>
																												
																													<TextField
																													size='small'
																													fullWidth
																													label='Measurements'
																													id='demo-simple-select-outlined'
																													labelId='demo-simple-select-outlined-label'
																													name='com'
																													defaultValue="Measurements"
																													value={detailingItems[j].com}
																													onChange={(e) => onChangeHandlerUom3(e,j)}
																													InputProps={{
																														readOnly: true,
																													}}
																												>
																													{/* <MenuItem value="Running Uom">Running Uom</MenuItem>
																													<MenuItem value="Square Uom">Square Uom</MenuItem>
																													<MenuItem value="Cubic Uom">Cubic Uom</MenuItem> */}
																												</TextField>
																											</FormControl>
																										</Grid>

																										<Grid item lg={5} sm={12}>
																											<TextField
																											sx={{bgcolor: 'greenyellow'}}
																											fullWidth
																											size='small'
																											id="outlined-read-only-input"
																											label="Total"
																											name="total_uom"
																											onChange={(e) => onChangeHandler3(e, j)}
																											value={calculateTotal3(j)}
																											InputProps={{
																												readOnly: true,
																											}}
																											/>
																										</Grid>
																										

																									<Grid item lg={5} sm={12}>
																									<TextField label="Length"
																										fullWidth
																										multiline
																										size='small'
																										name='length'
																										value={detailingItems[j].length} 
																										onChange={(e) => handleDetailChange(j, e)}
																									/>
																									</Grid>

																									

																									{(selectedUom === 'Square Uom' || selectedUom === 'Cubic Uom') && (
																										<Grid item lg={5} sm={12}>
																										<TextField label="Breadth"
																											fullWidth
																											multiline
																											size='small'
																											name='breadth'
																											value={detailingItems[j].breadth} onChange={(e) => handleDetailChange(j, e)}
																										/>
																										</Grid>
																									)}

																									{selectedUom === 'Cubic Uom' && (
																										<Grid item lg={5} sm={12}>
																										<TextField label="Width/Height/Depth"
																											fullWidth
																											multiline
																											size='small'
																											name='whd'
																											value={detailingItems[j].whd} onChange={(e) => handleDetailChange(j, e)}
																										/>
																										</Grid>
																									)}

																								<FormGroup>
																									<FormControlLabel
																										control={<Switch checked={checked} onChange={handleChange} />}
																										label={checked ? 'Show Diameter & Weight' : 'Hide Diameter & Weight'}
																									/>
																									{checked && (
																										<Box>
																											
																										<Grid item lg={5} sm={12}>
																										<TextField label="Diameter"
																											fullWidth
																											multiline
																											size='small'
																											name='diameter'
																											value={detailingItems[j].diameter} onChange={(e) => onChangeHandler3(e, j)}
																											sx={{ mt: 3.5 }}
																										/>
																										</Grid>

																										<Grid item lg={5} sm={12}>
																										<TextField label="Weight (Kg)"
																											fullWidth
																											multiline
																											size='small'
																											name='weight'
																											value={detailingItems[j].weight} onChange={(e) => onChangeHandler3(e, j)}
																											sx={{ mt: 3.5 }}
																										/>
																										</Grid>
																										</Box>
																									)}
																								</FormGroup>

																									</>
																									
																								)}
																							</Grid>
																						</Grid>
																					</Grid>

																				</Grid>
																			</Tag>
																		)
																	}}
																</Repeater>

																
																	<Grid container sx={{ mt: 4.75 }}>
																		<Grid item xs={12} sx={{ px: 0 }}>
																			
																			<Button
																				size='small'
																				variant='contained'
																				startIcon={<Icon icon='mdi:plus' fontSize={20} />}
																				onClick={() => { setCountDetailing(countDetailing + 1); setDetailingItems([...detailingItems, {detailing_name: '', detailing_description: '', length:'', breadth:'', whd:'',diameter:'', start_date: '', actual_start_date: '', end_date: '',  status: '' , com:selectedUom, unit:'', weight:'', total_uom:''}]) }}
																			>
																				Add Detailing
																			</Button>
																		</Grid>
																	</Grid>
																
															</Grid>

														</Grid>
													</Grid>
												</Grid>

											</Grid>
										</Tag>
									)
								}}
							</Repeater>

							<Grid container sx={{ mt: 4.75 }}>
								<Grid item xs={12} sx={{ px: 0 }}>
									<Button
										size='small'
										variant='contained'
										startIcon={<Icon icon='mdi:plus' fontSize={20} />}
										onClick={() => { setCount(count + 1); setItems([...items, { subtask_name: '', sub_task_description: '', start_date: '', length:'', breadth:'', whd:'',diameter:'', actual_start_date: '', end_date: '',  status: '', detailing: detailingItems  , com:selectedUom, unit:'', weight:'', total_uom:''}]) }}
									>
										Add SubTask
									</Button>
								</Grid>
							</Grid>
						</Grid>
						<Grid item md={12}>
							<FileUploader setAddData={setAddData} />
						</Grid>
					</Grid>
					<Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
						<LoadingButton type='submit' sx={{ mr: 3 }} loading={isLoading} size='large' variant="contained" >
							Submit
						</LoadingButton>
						<Button size='large' variant='outlined' color='secondary' onClick={handleClose}>
							Cancel
						</Button>
					</Box>
				</form>
			</Box>
		</Drawer>
	)
}

export default AddTaskDrawer
