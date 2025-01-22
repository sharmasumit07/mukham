// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { styled, alpha } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import { LoadingButton } from '@mui/lab'
import { useContext, useState, useEffect } from 'react'

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { Grid, Switch } from '@mui/material'
import SidebarAddVendor from './AddNewVendor'
import AddNewWorker from './AddNewWorker'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const CustomSelectItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.success.main,
  backgroundColor: 'transparent !important',
  '&:hover': { backgroundColor: `${alpha(theme.palette.success.main, 0.1)} !important` }
}))


const AddVendorPaySide = ({ open, toggle, fetchExpensesVendor }) => {

  const [isSwitchOn, setIsSwitchOn] = useState(false);


  const [selectedVendor, setSelectedVendor] = useState('');

  const handleSwitchChange = (event) => {
    setIsSwitchOn(event.target.checked);
  };

  const { user, selectedSite, setSelectedSite } = useContext(AuthContext)

  const [isLoading, setIsLoading] = useState(false)

  const defaultState = {
    worker: '',
    amount: '',
    activity_date: '',
    payment_reason: '',
    startTime: '',
    endTime: '',
    expense_description: ''
  }

  const [values, setValues] = useState(defaultState)

  const [selectedExpenseReason, setSelectedExpenseReason] = useState();
  
  const [paymentType, setPaymentType] = useState('');

  const onSubmit = async (inputdata) => {
    try {
      // const { worker_type } = inputdata;
      if (selectedSite === '') {
        toast.error("Please select a site")
        return;
      }
      const data = await AxiosPost('addLabourExp.php', { ...values, orgId: user.orgId, site_id: selectedSite, payment_reason: selectedExpenseReason, date: date, vendor_id: selectedVendor, paymentType: paymentType });

      if (data.success) {
        await fetchExpensesVendor();
        toast.success("Expense added successfully");
        setValues(defaultState);
        toggle();
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


  const handleDrawerClose = () => {
    toggle()
  }

  const handleExpenseReasonChange = (e) => {
    setSelectedExpenseReason(e.target.value)
  }

  const handleWorkerChange = event => {
    setValues({ ...values, worker: workers.filter(i => i.id === event.target.value)[0].id })
  }

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

  useEffect(() => { fetchSiteName() }, [selectedSite])


  const onChangeHandlerSiteId = (e) => {
    setSelectedSite(e.target.value);
  }

  const [expenseOptions, setExpenseOptions] = useState();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const onChangeHandler = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }


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

  const calculateAmount = () => {
    // Check if both worker, startTime, and endTime are selected
    if (values.worker && values.startTime && values.endTime) {
      // Find the selected worker from the workers array
      const selectedWorker = workers.find(worker => worker.id === values.worker);
      if (selectedWorker) {
        // Retrieve the price of the selected worker
        const pricePerHour = parseFloat(selectedWorker.price) / 8;
        // Calculate time difference in hours
        const startTime = dayjs(values.startTime, 'hh:mm A');
        const endTime = dayjs(values.endTime, 'hh:mm A');
        const timeDiffInHours = endTime.diff(startTime, 'hour');
        // Calculate total amount
        const calculatedAmount = pricePerHour * timeDiffInHours;
        // Update the amount in the state with 2 decimal places
        setValues(prevState => ({
          ...prevState,
          amount: calculatedAmount.toFixed(2),
        }));
      }
    }
  };

  const [workers, setWorkers] = useState();

  const fetchWorkers = async () => {
    try {
      const data = await AxiosPost('fetchParticularVendorWorker.php', { orgId: user.orgId, vendor_id: selectedVendor })
      console.log(data)
      if (data.success) {
        setWorkers(data.workers)
        console.log("WORKER", workers)
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



  const fetchExpenseOptions = async () => {
    try {
      const data = await AxiosPost('fetchExpenseOptions.php', { orgId: user.orgId, site_id: selectedSite, payment_reason: 'payment_reason_pay_options' })
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

  //   console.log("VALUES",values);


  const [addVendorOpen, setaddVendorOpen] = useState(false);

  const toggleAddVendorDrawer = () => setaddVendorOpen(!addVendorOpen);

  const [addWorkerOpen, setaddWorkerOpen] = useState(false);

  const toggleAddWorkerDrawer = () => {
    setaddWorkerOpen(!addWorkerOpen);
    toggle();
  }

  console.log(addWorkerOpen);

  const [vendorOptions, setVendorOptions] = useState([])

  const fetchVendorOptions = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchLVendorOptions.php', { org_id: user.orgId })
      // console.log(data)
      if (data.success) {
        setVendorOptions(data.options)
      }
      else toast.error(data.error)
    } catch (err) {
      console.log(err)
    }
    finally {
      setIsLoading(false);
    }
  }


  const onVendorChangeHandler = (e) => {
    setSelectedVendor(e.target.value);
    setValues(defaultState);
  }

  const [paymentOptions, setPaymentOptions] = useState([])

  const fetchBillPaymentOptions = async () => {
    try {
      const data = await AxiosPost('fetchBillPaymentOptions.php', { org_id: user.orgId })
      console.log(data.paymentOptions)
      if (data.success) {
        setPaymentOptions(data.paymentOptions)
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

  const onPaymentTypeChangeHandler = (e) => {
    setPaymentType(e.target.value);
  }

  useEffect(() => {
    fetchBillPaymentOptions()
  }, []);

  useEffect(() => { fetchVendorOptions() }, [])

  useEffect(() => { fetchWorkers() }, [selectedVendor])

  useEffect(() => { fetchExpenseOptions(); }, [])

  useEffect(() => {
    if (values.worker && values.startTime && values.endTime) {
      calculateAmount();
    }
  }, [values.worker, values.startTime, values.endTime]);


  return (
    <>
      <Drawer
        open={open}
        anchor='right'
        variant='temporary'
        onClose={handleDrawerClose}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: [300, 400] } }}
      >
        <Header>
          <Typography variant='h6'>Add Vendor Pay</Typography>
          <IconButton size='small' onClick={toggle} sx={{ color: 'text.primary' }}>
            <Icon icon='mdi:close' fontSize={20} />
          </IconButton>
        </Header>

        <Box component='form' sx={{ p: 5 }}>


          <Typography sx={{ mb: 4 }}>Vendor Payment for Site: <strong> {siteName}</strong></Typography>

          <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Vendor Name</InputLabel>
            <Select
              label='Vendor Name'
              defaultValue=''
              id='demo-simple-select-outlined'
              labelId='demo-simple-select-outlined-label'
              name='selectedVendor'
              value={selectedVendor}
              onChange={onVendorChangeHandler}
            >
              <CustomSelectItem value='' onClick={toggleAddVendorDrawer}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                  <Icon icon='mdi:plus' fontSize={20} />
                  Add New Vendor
                </Box>
              </CustomSelectItem>
              {vendorOptions.map(vendor => <MenuItem value={vendor.vendor_id}>{vendor.vendor_name}</MenuItem>)}
            </Select>
          </FormControl>

          {selectedVendor !== '' && (
            <Grid sx={{ display: "flex", gap: '2rem', mb: 4 }}>
              <Typography>Pay to Worker: </Typography>
              <Switch
                checked={isSwitchOn}
                onChange={handleSwitchChange}
                size="small"
              />
            </Grid>
          )}




          {/* <Typography variant='subtitle2' sx={{ mb: 3, color: 'text.primary' }}>
         Worker Name:
       </Typography> */}

          {isSwitchOn && (
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='demo-simple-select-outlined-label'>Worker Name</InputLabel>
              <Select fullWidth
                label='Worker Name'
                defaultValue=''
                id='demo-simple-select-outlined'
                labelId='demo-simple-select-outlined-label'
                value={values.worker} onChange={handleWorkerChange}>
                <CustomSelectItem value='' onClick={toggleAddWorkerDrawer}>
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
              </Select>
            </FormControl>
          )}

          {selectedExpenseReason !== 'Overtime' && (
            <FormControl fullWidth sx={{ mb: 6 }}>
              <TextField
                label='Expense Description'
                value={values.expense_description}
                variant='outlined'
                name='expense_description'
                onChange={onChangeHandler}
              />
            </FormControl>
          )}


          {/* <FormControl fullWidth sx={{ mb: 6 }}>
              	<InputLabel id='demo-simple-select-outlined-label'>Site</InputLabel>
								<Select
									label='Site'
									defaultValue=''
									id='demo-simple-select-outlined'
									labelId='demo-simple-select-outlined-label'
									name='site_id'
									value={selectedSite}
									onChange={onChangeHandlerSiteId}                                
								>
									{siteOptions.map(site => <MenuItem value={site.site_id}>{site.site_name}</MenuItem>)}
								</Select>
        </FormControl> */}

          <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Expense Reason</InputLabel>
            <Select
              label='Expense Reason'
              name='expense_reason'
              fullWidth
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

          {selectedExpenseReason === 'Overtime' && (
            <Box >
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
              <Box sx={{ mb: 6 }}>
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

          <FormControl fullWidth sx={{ mb: 6 }}>
            <TextField label='Amount' name='amount' value={values.amount} onChange={onChangeHandler} required
              InputProps={{
                readOnly: selectedExpenseReason === 'Overtime'
              }}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Payment Type</InputLabel>
            <Select
              label='payment_type'
              fullWidth
              id="outlined-read-only-input"
              name='payment_type'
              value={paymentType}
              onChange={(e) => onPaymentTypeChangeHandler(e)}
            >

              {paymentOptions && paymentOptions.map((unit, index) => {
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


          <FormControl fullWidth sx={{ mb: 6 }}>
            <TextField label='Date Of Entry' type='date' InputLabelProps={{ shrink: true }} name='date' value={date}
              InputProps={{
                inputProps: {
                  max: new Date().toISOString().split('T')[0],
                },
              }}
              onChange={(e) => {
                const selectedDate = e.target.value;
                setDate(selectedDate);
              }
              } required />
          </FormControl>



          <div>
            <LoadingButton size='large' onClick={(e) => { onSubmit() }} loading={isLoading} variant='contained' sx={{ mr: 4 }}>
              Add
            </LoadingButton>
            <Button size='large' variant='outlined' color='secondary' onClick={handleDrawerClose}>
              Cancel
            </Button>
          </div>
        </Box>
      </Drawer>
      <SidebarAddVendor openVendor={addVendorOpen} toggleVendor={toggleAddVendorDrawer} fetchVendorsOptions={fetchVendorOptions} />
      <AddNewWorker openWorker={addWorkerOpen} toggleVendor={toggleAddWorkerDrawer} fetchWorkers={fetchWorkers} />
    </>
  )
}

export default AddVendorPaySide;
