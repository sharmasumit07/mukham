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
import FormHelperText from '@mui/material/FormHelperText'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import { LoadingButton } from '@mui/lab'
import { useContext, useState, useEffect } from 'react'
import AddNewRole from './AddNewRole'
import SidebarAddVendor from './AddNewVendor'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const schema = yup.object().shape({
  name: yup.string().required(),
  price: yup.string().min(0).required()
})

const CustomSelectItem = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.success.main,
  backgroundColor: 'transparent !important',
  '&:hover': { backgroundColor: `${alpha(theme.palette.success.main, 0.1)} !important` }
}))


const AddNewWorker = ({ open, toggle, fetchWorkers }) => {

  const {selectedSite} = useContext(AuthContext)

  const [selectedVendor, setSelectedVendor] = useState('');

  const onVendorChangeHandler = (e) => {
    setSelectedVendor(e.target.value);
  }

  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: '', worker_type:'', price: '', role: '' }
  })

  const [isLoading, setIsLoading] = useState(false)
  const { user } = useContext(AuthContext)

  // console.log("INPUT",inputdata);

  // const onSubmit = async (inputdata) => {
  //   try {
  //     const data = await AxiosPost('addWorker.php', { ...inputdata, org_id: user.orgId })
  //     console.log(data)
  //     if (data.success) {
  //       await fetchWorkers()
  //       toast.success("Worker added successfully")
  //       toggle()
  //       reset({ name: '', worker_type:'', price: '', role: '' })
  //     }
  //     else toast.error(data.error)
  //   } catch (err) {
  //     toast.error("Server Error!");
  //     console.log(err)
  //   }
  //   finally {
  //     setIsLoading(false);
  //   }
  // }


  const onSubmit = async (inputdata) => {
    try {
      
      const data = await AxiosPost('addWorker.php', { ...inputdata, org_id: user.orgId, vendor_id: selectedVendor });
  
      if (data.success) {
        await fetchWorkers();
        toast.success("Worker added successfully");
        toggle();
        reset({ name: '', worker_type: '', price: '', role: '' });
        setSelectedVendor('');
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
    reset({ name: '', worker_type:'', price: '', role: '' })
  }

  const [workerType, setWorkerType] = useState('')

  const onChangeHandlerWorkerType = (e) => {
    setWorkerType(e.target.value);
  }

  const [vendorOptions, setVendorOptions] = useState([])

  const fetchVendorOptions = async () => {
		setIsLoading(true);
		try {
			const data = await AxiosPost('fetchVendorOptions.php', { org_id: user.orgId })
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

  const [roleOptions, setRoleOptions] = useState();

  const fetchRoleOptions = async () => {
    try {
      const data = await AxiosPost('fetchRoleOptions.php', { orgId: user.orgId, site_id: selectedSite })
      if (data.success) {
        setRoleOptions(data.roleOptions)
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

  const [addRoleOpen, setaddRoleOpen] = useState(false);
  const [addVendorOpen, setaddVendorOpen] = useState(false);

  const toggleAddRoleDrawer = () => setaddRoleOpen(!addRoleOpen);
  const toggleAddVendorDrawer = () => setaddVendorOpen(!addVendorOpen);

  useEffect(() => {
    fetchRoleOptions()
  },[]);

  useEffect(() => { fetchVendorOptions(); }, [])

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
        <Typography variant='h6'>Add New Worker</Typography>
        <IconButton size='small' onClick={toggle} sx={{ color: 'text.primary' }}>
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </Header>
      <Box component='form' sx={{ p: 5 }} onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{ mb: 6 }}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label='Name'
                value={value}
                variant='outlined'
                onChange={onChange}
                error={Boolean(errors.name)}
              />
            )}
          />
          {errors.name && (
            <FormHelperText sx={{ color: 'error.main' }} id='invoice-name-error'>
              {errors.name.message}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth sx={{ mb: 6 }}>
              	<InputLabel id='demo-simple-select-outlined-label'>Worker Type</InputLabel>
								<Select
									label='Worker Type'
									defaultValue=''
									id='demo-simple-select-outlined'
									labelId='demo-simple-select-outlined-label'
									name='worker_type'
									value={workerType}
									onChange={onChangeHandlerWorkerType}                                
								>
									<MenuItem value="In-House">In-House</MenuItem>
                  <MenuItem value="Vendor's Worker">Vendor's Worker</MenuItem>
								</Select>
        </FormControl>

          {workerType === `Vendor's Worker` && (
            <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id='demo-simple-select-outlined-label'>Vendor Name</InputLabel>
            <Select
              label='Vendor Name'
              defaultValue=''
              id='demo-simple-select-outlined'
              labelId='demo-simple-select-outlined-label'
              name='vendor_id'
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
          )}

        <FormControl fullWidth sx={{ mb: 6 }}>
          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              // <TextField
              //   label='Role'
              //   value={value}
              //   variant='outlined'
              //   onChange={onChange}
              //   error={Boolean(errors.role)}
              // />
              <>
              <InputLabel id='demo-simple-select-outlined-label'>Worker Role</InputLabel>
              <Select
                label='Worker Role'
								defaultValue=''
								id='demo-simple-select-outlined'
								labelId='demo-simple-select-outlined-label'
                fullWidth
                value={value}
                onChange={onChange}
                error={Boolean(errors.role)}
              >
                <CustomSelectItem value='' onClick={toggleAddRoleDrawer}>
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                    <Icon icon='mdi:plus' fontSize={20} />
                    Add New Role
                  </Box>
                </CustomSelectItem>
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
              </>
            )}
          />
          
          {errors.name && (
            <FormHelperText sx={{ color: 'error.main' }} id='invoice-name-error'>
              {errors.name.message}
            </FormHelperText>
          )}
        </FormControl>
        <FormControl fullWidth sx={{ mb: 6 }}>
          <Controller
            name='price'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <TextField
                value={value}
                label='Price'
                variant='outlined'
                onChange={onChange}
                error={Boolean(errors.price)}
              />
            )}
          />
          {errors.price && (
            <FormHelperText sx={{ color: 'error.main' }} id='invoice-company-error'>
              {errors.price.message}
            </FormHelperText>
          )}
        </FormControl>
        <div>
          <LoadingButton size='large' type='submit' loading={isLoading} variant='contained' sx={{ mr: 4 }}>
            Add
          </LoadingButton>
          <Button size='large' variant='outlined' color='secondary' onClick={handleDrawerClose}>
            Cancel
          </Button>
        </div>
      </Box>
      
    </Drawer>
      <AddNewRole
      open={addRoleOpen}
      toggle={toggleAddRoleDrawer}
      fetchRoleOptions={fetchRoleOptions}
      />
      <SidebarAddVendor openVendor={addVendorOpen} toggleVendor={toggleAddVendorDrawer} fetchVendorsOptions={fetchVendorOptions} />
    </>
  )
}

export default AddNewWorker;
