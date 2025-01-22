import { LoadingButton } from "@mui/lab";
import { Box, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, CardContent, Collapse, TextField, Icon, Card, CardHeader, Switch, Divider } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext, AxiosPost } from "src/context/AuthContext";
import CloseIcon from '@mui/icons-material/Close'; 
import Repeater from "src/@core/components/repeater";
import { styled, alpha } from '@mui/material/styles';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

import SidebarAddVendor from "./AddNewVendor";
import AddNewWorker from "./AddNewWorker";

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}));

const RepeatingContent = styled(Grid)(({ theme }) => ({
    paddingRight: 0,
    display: 'flex',
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    '& .col-title': {
      top: '-1.5rem',
      position: 'absolute'
    },
    '& .MuiInputBase-input': {
      color: theme.palette.text.secondary
    },
    [theme.breakpoints.down('lg')]: {
      '& .col-title': {
        top: '0',
        position: 'relative'
      }
    }
  }))
  
  const RepeaterWrapper = styled(CardContent)(({ theme }) => ({
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(5.5),
    '& .repeater-wrapper + .repeater-wrapper': {
      marginTop: theme.spacing(12)
    }
  }))
  
  const InvoiceAction = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: theme.spacing(2, 1),
    borderLeft: `1px solid ${theme.palette.divider}`
  }))

  const CustomSelectItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.success.main,
    backgroundColor: 'transparent !important',
    '&:hover': { backgroundColor: `${alpha(theme.palette.success.main, 0.1)} !important` }
  }))

const AddBuySide = (props) => {
  const { user, selectedSite, setSelectedSite } = useContext(AuthContext);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const [roleOptions, setRoleOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [items, setItems] = useState([{ id: 0, item_name: '', cost:'', item_type: '',  unit_of_measurement:'', quantity:'', status: 'active', item_description:'', tax_percentage:'', price:'' }]);
  
  const [count, setCount] = useState(1);

  const deleteForm = (e, i) => {
    e.preventDefault()
    setItems(prevState => {
      const newArray = [...prevState]
      newArray[i] = { ...newArray[i], status: 'deactive' }
      console.log(newArray)
      return newArray
    })
    // @ts-ignore
    e.target.closest('.repeater-wrapper').remove()
  }

  const defaultState = {
    worker:'',
    worker_role: '',
    amount: '',
    activity_date: '',
    payment_reason: '',
    startTime: '',
    endTime: '',
    expense_description: ''
  };

  const [values, setValues] = useState(defaultState);

  const [selectedExpenseReason,setSelectedExpenseReason] = useState('');

  const handleExpenseReasonChange = (e) => {
    setSelectedExpenseReason(e.target.value);
  }

//   const handleDrawerClose = () => {
//     toggle();
//   };



const handleStartTimeChange = (time) => {
    setValues(prevState => ({
      ...prevState,
      startTime: time.format('hh:mm A'), // Format time as HH:MM aa (12-hour format with AM/PM)
    }));
  };

  // Handler function to update the state when the end time changes
  const handleEndTimeChange = (time) => {
    setValues(prevState => ({
      ...prevState,
      endTime: time.format('hh:mm A'), // Format time as HH:MM aa (12-hour format with AM/PM)
    }));
  };

  const onChangeHandlerValues = (event) => {
    const { name, value } = event.target;
    setValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onChangeHandler = (e, i) => {
    const { name, value } = e.target;
    setItems(prevState => {
      const newArray = [...prevState];
      newArray[i] = { ...newArray[i], [name]: value };
      
      // Update the price when cost, quantity, or tax_percentage changes
      if (name === 'cost' || name === 'quantity' || name === 'tax_percentage') {
        const cost = parseFloat(name === 'cost' ? value : newArray[i].cost) || 0;
        const quantity = parseFloat(name === 'quantity' ? value : newArray[i].quantity) || 0;
        const taxPercentage = parseFloat(name === 'tax_percentage' ? value : newArray[i].tax_percentage) || 0;
        
        const subtotal = (cost * quantity) + (cost * quantity * (taxPercentage / 100));
        newArray[i].price = subtotal ;
      }
      
      return newArray;
    });
};

  const handleWorkerChange = event => {
    setValues({ ...values, worker: workers.filter(i => i.id === event.target.value)[0].id })
  }
//   const calculateTotalAmount = () => {
//     const totalAmount = items.reduce((acc, item) => {
//       if (item.status === 'active') {
//         return acc + (item.price || 0);
//       }
//       return acc;
//     }, 0);

//     setValues(prevState => ({ ...prevState, amount: totalAmount }));
//   };

// console.log(items)

//   const [siteOptions, setSiteOptions] = useState([]);

//   const fetchSiteOptions = async () => {
//     setIsLoading(true);
//     try {
//       const data = await AxiosPost('fetchSiteOptions.php', { org_id: user.orgId })
//       // console.log(data)
//       if (data.success) {
//         setSiteOptions(data.options)
//       }
//       else toast.error(data.error)
//     } catch (err) {
//       console.log(err)
//     }
//     finally {
//       setIsLoading(false);
//     }
//   }

// useEffect(() => { fetchSiteOptions() }, [user.orgId])

  const onChangeHandlerSiteId = (e) => {
    setSelectedSite(e.target.value);
  }

  
  const [expenseOptions, setExpenseOptions] = useState();

  const fetchExpenseOptions = async () => {
    try {
      const data = await AxiosPost('fetchExpenseOptions.php', { orgId: user.orgId, site_id: selectedSite, payment_reason: 'payment_reason_buy_options' })
      // console.log("payment",data)
      if (data.success) {
        setExpenseOptions(data.expenseOptions)
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

  useEffect(() => { fetchExpenseOptions(); }, [])

  
  const [isSwitchOn, setIsSwitchOn] = useState(true);
  const handleSwitchChange = (event) => {    
    setIsSwitchOn(event.target.checked);
    setValues(prevValues => ({
      ...prevValues,
      worker: '',
      worker_role: ''
    }));
  };

  const [addVendorOpen, setaddVendorOpen] = useState(false);

const toggleAddVendorDrawer = () => setaddVendorOpen(!addVendorOpen);


const [addWorkerOpen, setaddWorkerOpen] = useState(false);

const toggleAddWorkerDrawer = () => setaddWorkerOpen(!addWorkerOpen);

const [buyVendorOptions, setBuyVendorOptions] = useState([])

const [overHeadVendorOptions, setOverHeadVendorOptions] = useState([])

  const fetchPurchaseVendorOptions = async () => {
		setIsLoading(true);
		try {
			const data = await AxiosPost('fetchPurchaseVendorOptions.php', { org_id: user.orgId })
			// console.log(data)
			if (data.success) {
				setBuyVendorOptions(data.options)
			}
			else toast.error(data.error)
		} catch (err) {
			console.log(err)
		}
		finally {
			setIsLoading(false);
		}
	}

  const fetchLVendorOptions = async () => {
		setIsLoading(true);
		try {
			const data = await AxiosPost('fetchLVendorOptions.php', { org_id: user.orgId })
			// console.log(data)
			if (data.success) {
				setOverHeadVendorOptions(data.options)
			}
			else toast.error(data.error)
		} catch (err) {
			console.log(err)
		}
		finally {
			setIsLoading(false);
		}
	}

  const [selectedPurchaseVendor, setSelectedPurchaseVendor] = useState('');
  const [selectedOverHeadVendor, setSelectedOverHeadVendor] = useState('');

  const onVendorChangeHandler = (e) => {
    setSelectedPurchaseVendor(e.target.value);
  }
  const onOverHeadVendorChangeHandler = (e) => {
    setSelectedOverHeadVendor(e.target.value);
  }

  useEffect(()=> { fetchPurchaseVendorOptions() },[])

  useEffect(()=> { fetchLVendorOptions() },[])

  const fetchRoleOptions = async () => {
    try {
      const data = await AxiosPost('fetchRoleOptions.php', { orgId: user.orgId, site_id: selectedSite });
      if (data.success) {
        setRoleOptions(data.roleOptions);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server Error!");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoleOptions();
  }, []);

  const [unitOptions, setUnitOptions] = useState([])

  const [mTypeOptions, setMTypeOptions] = useState([])

  const [siteName, setSiteName] = useState();

  const fetchSiteName = async () => {
    try {
        const data = await AxiosPost('fetchSiteName.php', { org_id: user.orgId, site_id: selectedSite })
        // console.log("payment",data)
        if (data.success) {
            if (Array.isArray(data.siteName) && data.siteName.length > 0) {
                setSiteName(data.siteName[0].site_name);
            } else {
                console.log("Select a site");
            }
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

  useEffect(()=> { fetchSiteName() }, [selectedSite])

//   console.log(siteName);

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


    const fetchMTypeOptions = async () => {
      try {
        const data = await AxiosPost('fetchMTypeOptions.php', { orgId: user.orgId })
        // console.log("payment",data)
        if (data.success) {
        setMTypeOptions(data.mTypeOptions)
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

      useEffect(() => {
        fetchUnitOptions()
        }, []);
    
        useEffect(() => {
          fetchMTypeOptions()
          }, []);

  const [workers, setWorkers] = useState();  

  const fetchWorkers = async () => {
    try {
      const data = await AxiosPost('fetchParticularVendorWorker.php', { orgId: user.orgId, vendor_id: selectedOverHeadVendor })
      console.log(data)
      if (data.success) {
        setWorkers(data.workers)
        console.log("WORKER",workers)
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


  useEffect(()=> { fetchWorkers() },[selectedOverHeadVendor])

  const onSubmit = async (inputdata) => {
    try {
        if(selectedSite === '') {
            toast.error("Please select a site");
            return;
          }

          if(selectedExpenseReason === '') {
            toast.error("Please Select a Payment Reason");
            return;
          }

          if (user.orgId === '' || selectedSite === '' || selectedExpenseReason === '' || date === '') {
            toast.error("Missing required fields");
            return;
          }
          
        let newitems = [];
        let totalAmount = 0;
      items.map(item => {
        if (item.status == 'active'){
            newitems.push(item);
            totalAmount += item.price;
        } 
      })
      
      const data = await AxiosPost('addOtherExps.php', { ...values, orgId: user.orgId, site_id: selectedSite, payment_reason: selectedExpenseReason, date: date, items: newitems, total_amount: totalAmount, overhead_vendor: selectedOverHeadVendor, vendor_id: selectedPurchaseVendor });
  
      if (data.success) {
        await props.fetchExpensesBuy();
        toast.success("Expense added successfully");
        props.setScreen(0);
        setValues(defaultState)
        setCount(1)
        setItems([{ id:0, item_name: '', item_type: '', cost:'', unit_of_measurement:'', quantity:'', status: 'active', item_description:'', tax_percentage:'', price:''  }])
      } else {
        toast.error(data.error);
      }
    }  catch (err) {
      console.error("Error details:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      toast.error("Server Error! Please check the console for more details.");
    } finally {
      setIsLoading(false);
    }
  };

  // console.log(selectedOverHeadVendor,"over")
  console.log(values,"dfad");
  return (
    <>
      <Button size='small' color='secondary' sx={{ m: 3, mb: 3 }} variant="contained" onClick={() => props.setScreen(0)}>
              Go back
            </Button>
    <Card sx={{ p:3 }}>
        <CardHeader 
            title={`ADD BUY : Purchase & Rent`} 
            sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
        />

        <CardContent>
        <Box component='form' sx={{ px: 45, py:10 }}>
            
        <Typography variant="h5" component="h6" sx={{ mb: 2, textAlign:'center' }}>Buy for Site: <strong> {siteName}</strong></Typography>
        <Divider/>

        

          <Grid item sx={{ display: 'flex', gap:'2rem', mt: 6  }} >
            
          <FormControl required fullWidth sx={{ mb: 6}}>
              <InputLabel size='small' id='demo-simple-select-outlined-label'>Buy Vendor Name</InputLabel>
              <Select
                required
                label='Buy Vendor Name'
                size='small'
                defaultValue=''
                fullWidth
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label'
                name='selectedPurchaseVendor'
                value={selectedPurchaseVendor}
                onChange={onVendorChangeHandler}
                                               
              >
                <CustomSelectItem value='' onClick={toggleAddVendorDrawer}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                      {/* <Icon icon='mdi:plus' fontSize={20} /> */}
                      Add New Vendor
                    </Box>
                  </CustomSelectItem>
                {buyVendorOptions.map(vendor => <MenuItem value={vendor.vendor_id}>{vendor.vendor_name}</MenuItem>)} 
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 6 }}>
                <TextField size="small" label='Date Of Entry' type='date' InputLabelProps={{ shrink: true }} name='date' value={date}
                  InputProps={{
                    inputProps: {
                      max: new Date().toISOString().split('T')[0],
                    },
                  }}
                  aria-required
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setDate(selectedDate);
                  }
                  } required />
              </FormControl>

          </Grid>

          <FormControl required fullWidth sx={{ mb: 6 }}>
                <InputLabel size="small" id='demo-simple-select-outlined-label'>Expense Reason</InputLabel>
                <Select
                    required
                    label='Expense Reason'
                    name='expense_reason'
                    fullWidth
                    size="small"
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    value={selectedExpenseReason}
                    onChange={handleExpenseReasonChange}
                >
                    {expenseOptions && expenseOptions.map((payment, index) => {
                    try {
                        const paymentValues = JSON.parse(payment.options_value);
                        return paymentValues.map((value, valueIndex) => (
                        <MenuItem key={value} value={value}>
                            {value}
                        </MenuItem>
                        ));
                    } catch (error) {
                        console.error("Error parsing payment options:", error);
                        return null;
                    }
                    })}
                </Select>
            </FormControl>

          {selectedExpenseReason === 'Rent' && (
                                <Box sx={{ display: 'flex', justifyContent:'space-between' }} >
                                <Box sx={{ mb: 6 }}>
                                {/* Assuming you have TimePicker imported and properly set up */}
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                    fullWidth
                                    label="Start Time"
                                    value={values.startTime} // Set the value of the TimePicker
                                    onChange={handleStartTimeChange} // Handle changes to the start time
                                    ampm={true} // Enable 12-hour format with AM/PM
                                    />
                                </LocalizationProvider>
                                </Box>
                                <Box sx={{ mb: 6  }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                    label="End Time"
                                    value={values.endTime} // Set the value of the TimePicker
                                    onChange={handleEndTimeChange} // Handle changes to the end time
                                    ampm={true} // Enable 12-hour format with AM/PM
                                    />
                                </LocalizationProvider>
                                </Box>
                            </Box>
                            )}

          <RepeaterWrapper>
              <Repeater count={count}>
                {i => {
                  const Tag = i === 0 ? Box : Collapse

                  return (
                    <Tag key={i} className='repeater-wrapper' {...(i !== 0 ? { in: true } : {})}>
                      <Grid container>
                        <RepeatingContent item xs={12}>
                          <Grid container sx={{ py: 4, width: '100%', pr: { lg: 0, xs: 4 } }}>
                            <Grid item lg={6} md={5} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                              <Typography
                                variant='subtitle2'
                                className='col-title'
                                sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                              >
                                Item
                              </Typography>

                              {/* For Premium Users */}

                              {/* <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary' }}>
                                Material
                              </Typography>
                              <Select size='small' required name='item_name' value={items[i].item_name} onChange={(e) => onChangeHandlerMaterial(e, i)} sx={{ mb: 4, width: '200px' }}>
                                <CustomSelectItem value='' onClick={handleAddNewVendor}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                                    <Icon icon='mdi:plus' fontSize={20} />
                                    Add New Material
                                  </Box>
                                </CustomSelectItem>
                                {materials !== undefined &&
                                  materials.map(material => (
                                    <MenuItem key={material.vendor_id} value={material.material_id}>
                                      {material.material_name}
                                    </MenuItem>
                                  ))}
                              </Select> */}

                              {/* <Typography
                                name='material_name'
                                variant='body' 
                              >Name: {items[i].item_name}</Typography>

                              <Typography
                                name='unit_of_measurement'
                                variant='body' 
                              >UOM: {items[i].unit_of_measurement}</Typography>

                              <Typography
                                name='material_type'
                                variant='body' 
                              >Material Type: {items[i].item_type}</Typography> */}

                            {/* <TextField
                                size='small'
                                type='number' value={items[i].price} name='price' onChange={(e) => onChangeHandler(e, i)}
                                InputProps={{ inputProps: { min: 0 } }}
                              /> */}

                            {/* ^------^ */}

                            <FormControl required fullWidth sx={{ mb: 6 }}>
                                <TextField
                                required
                                label='Material Name'
                                size='small'
                                type='text' value={items[i].item_name} name='item_name' onChange={(e) => onChangeHandler(e, i)}
                              />
                            </FormControl>



                               <FormControl fullWidth sx={{ mb: 6 }}>
                                  <InputLabel size='small' id='demo-simple-select-outlined-label'>Material Type</InputLabel>
                                    <Select 
                                    label='Material Type'
                                    fullWidth
                                    size='small'
                                    id="outlined-read-only-input"
                                    name='item_type'
                                    value={items[i].item_type}
                                    onChange={(e) => onChangeHandler(e, i)}
                                  >
                                    {/* <CustomSelectItem value='' onClick={handleAddNewMType}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                                        <Icon icon='mdi:plus' fontSize={20} />
                                        Add New Material Type
                                      </Box>
                                    </CustomSelectItem> */}
                                    {mTypeOptions && mTypeOptions.map((mType, index) => {
                                    try {
                                      const mTypeValues = JSON.parse(mType.options_value);
                                      return mTypeValues.map((value, valueIndex) => (
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

                                <FormControl fullWidth sx={{ mb: 6 }}>
                                  <InputLabel size='small' id='demo-simple-select-outlined-label'>Unit of Measurement</InputLabel>
                                    <Select 
                                    label='Unit of Measurement'
                                    fullWidth
                                    id="outlined-read-only-input"
                                    size='small'
                                    name='unit_of_measurement'
                                    value={items[i].unit_of_measurement}
                                    onChange={(e) => onChangeHandler(e, i)}
                                  >
                                    
                                    {unitOptions && unitOptions.map((unit, index) => {
                                    try {
                                      console.log("Unit",unit);
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
                              <TextField
                                rows={2}
                                fullWidth
                                multiline
                                size='small'
                                name='item_description'
                                value={items[i].item_description} onChange={(e) => onChangeHandler(e, i)}
                                sx={{ mt: 3.5 }}
                                label="Item Description"
                              />
                            </Grid>
                            <Grid item lg={2} md={3} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                              <Typography
                                variant='subtitle2'
                                className='col-title'
                                sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                              >
                                Cost & Tax
                              </Typography>
                              <TextField
                                sx={{ mb: 2 }}
                                size='small'
                                label="Cost"
                                type='number' value={items[i].cost} name='cost' onChange={(e) => onChangeHandler(e, i)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                              <TextField
                                size='small'
                                label="Tax"
                                type='number' value={items[i].tax_percentage} name='tax_percentage' onChange={(e) => onChangeHandler(e, i)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            </Grid>
                            <Grid item lg={2} md={2} xs={12} sx={{ px: 4, my: { lg: 0, xs: 4 } }}>
                              <Typography
                                variant='subtitle2'
                                className='col-title'
                                sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                              >
                                Quantity
                              </Typography>
                              <TextField
                                size='small'
                                label="Qty"
                                type='number' value={items[i].quantity} name='quantity' onChange={(e) => onChangeHandler(e, i)}
                                InputProps={{ inputProps: { min: 0 } }}
                              />
                            </Grid>
                            
                            <Grid item lg={2} md={1} xs={12} sx={{ px: 4, my: { lg: 0 }, mt: 2 }}>
                            
                              <Typography
                                variant='subtitle2'
                                className='col-title'
                                sx={{ mb: { md: 2, xs: 0 }, color: 'text.primary' }}
                              >
                                Price
                              </Typography>
                              <Typography variant='body'>{items[i].price}</Typography>
                            </Grid>
                          </Grid>
                          <InvoiceAction>
                            <Button size='small' variant='outlined' color='secondary' onClick={(e) => { console.log(i); deleteForm(e, i); }}>
                                    Cancel
                                </Button>
                          </InvoiceAction>
                        </RepeatingContent>
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
                    // startIcon={<Icon icon='mdi:plus' fontSize={20} />}
                    onClick={() => { setCount(count + 1); setItems([...items, {  id: items.length, item_name: '', item_type: '',  unit_of_measurement:'', quantity:'', status: 'active', tax_percentage:'', price:'', cost:'' }]) }}
                  >
                    Add Item
                  </Button>
                </Grid>
              </Grid>
            </RepeaterWrapper>

            {/* <FormControl fullWidth sx={{ mb: 6 }}>
                <TextField size="small" label='Amount' name='amount' value={values.amount} required aria-readonly />
            </FormControl> */}

          <Grid item sx={{ display: 'flex', mt: 6 , justifyContent:"space-around", alignItems:"center"}}>
            
            <Grid sx={{ display:"flex", gap: '1.5rem', mb: 4 }}>
            <Typography>Buy for Vendor: </Typography>
            <Switch
              checked={isSwitchOn}
              onChange={handleSwitchChange}
              size="small"
            />
            </Grid>
        
  
        {!isSwitchOn && (
          <>
           {/* <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary' }}>
           Worker Name:
         </Typography>
         <Select size='small' value={values.worker} onChange={handleWorkerChange} sx={{ mb: 4, width: '200px' }}>
           <CustomSelectItem value='add-new-worker'>
             <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
               <Icon icon='mdi:plus' fontSize={20} />
               Add New Worker
             </Box>
           </CustomSelectItem>
           {workers !== undefined &&
             workers.map(client => (
               <MenuItem key={client.id} value={client.id}>
                 {client.name}
               </MenuItem>
             ))}
         </Select> */}
  
            <FormControl sx={{ mb: 6, width: '555px' }}>
              <InputLabel size='small' id='demo-simple-select-outlined-label'>Worker Role</InputLabel>
              <Select
                label='Worker Role'
                defaultValue=''
                size='small'
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label'
                fullWidth
                name='worker_role'
                value={values.worker_role}
                onChange={onChangeHandlerValues}
              >
                {roleOptions && roleOptions.map((role, index) => {
                  try {
                    const roleValues = JSON.parse(role.options_value);
                    return roleValues.map((value, valueIndex) => (
                      <MenuItem key={value} value={value}>
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
         </>
        )}
        
  
        {isSwitchOn && (
          <>
              <FormControl sx={{ mb: 6, width:"260px" }}>
              <InputLabel size='small' id='demo-simple-select-outlined-label'>Over Head Vendor Name</InputLabel>
              <Select
                label='Over Head Vendor Name'
                size='small'
                defaultValue=''
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label'
                name='selectedOverHeadVendor'
                value={selectedOverHeadVendor}
                onChange={onOverHeadVendorChangeHandler}
                                               
              >
                <CustomSelectItem value='' onClick={toggleAddVendorDrawer}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                      {/* <Icon icon='mdi:plus' fontSize={20} /> */}
                      Add New Vendor
                    </Box>
                  </CustomSelectItem>
                {overHeadVendorOptions.map(vendor => <MenuItem value={vendor.vendor_id}>{vendor.vendor_name}</MenuItem>)} 
              </Select>
            </FormControl>
  
          {selectedOverHeadVendor !== '' && (
            <FormControl sx={{ mb: 6, width:"260px" }}>
            <InputLabel size='small' id='demo-simple-select-outlined-label'>Worker Name</InputLabel>
              <Select
                label='Worker Name'
                defaultValue=''
                size='small'
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label' 
                name='worker' value={values.worker} 
                onChange={handleWorkerChange}
                >
              <CustomSelectItem value='' onClick={toggleAddWorkerDrawer}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                  {/* <Icon icon='mdi:plus' fontSize={20} /> */}
                  Add New Worker
                </Box>
              </CustomSelectItem>
              {workers !== undefined &&
                workers.map(client => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          )}
            
          </>
  
            )}
  
  
  
            {/* <FormControl fullWidth sx={{ mb: 6 }}>
                  <InputLabel size='small' id='demo-simple-select-outlined-label'>Site</InputLabel>
                  <Select
                    label='Site'
                    defaultValue=''
                                      size="small"
                    id='demo-simple-select-outlined'
                    labelId='demo-simple-select-outlined-label'
                    name='site_id'
                    value={selectedSite}
                    onChange={onChangeHandlerSiteId}                                
                  >
                    {siteOptions.map(site => <MenuItem value={site.site_id}>{site.site_name}</MenuItem>)}
                  </Select>
          </FormControl> */}
  
              </Grid>


          <div>
            <LoadingButton size='large' onClick={onSubmit} loading={isLoading} variant='contained' sx={{ mr: 4 }}>
              Add
            </LoadingButton>
            {/* <Button size='large' variant='outlined' color='secondary' onClick={handleDrawerClose}>
              Cancel
            </Button> */}
          </div>
        </Box>
        </CardContent>
    </Card>

    <SidebarAddVendor openVendor={addVendorOpen} toggleVendor={toggleAddVendorDrawer} fetchLVendorsOptions={fetchLVendorOptions} fetchBuyVendor={fetchPurchaseVendorOptions}/>
    <AddNewWorker open={addWorkerOpen} toggle={toggleAddWorkerDrawer} fetchWorkers={fetchWorkers} />
    </>
  );
};

export default AddBuySide;
