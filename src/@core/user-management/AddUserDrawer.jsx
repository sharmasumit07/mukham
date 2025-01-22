import { useEffect } from 'react'

import { styled, alpha, useTheme } from '@mui/material/styles'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useContext, useState } from 'react'
import { LoadingButton } from '@mui/lab'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'
import { Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select } from '@mui/material'

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const SidebarAddUser = props => {
  const { open, toggle } = props
  const [isLoading, setIsLoading] = useState(false)
  const initialFormData = { user_name: '', fullname: '', email: '', mobile_number: '',  privilege: '' }
  const [formData, setFormData] = useState(initialFormData)
  const { user } = useContext(AuthContext)
  const [sites, setSites] = useState();


  const fetchSites = async () => {
    try {
      const data = await AxiosPost('fetchSites.php', { orgId: user.orgId })
      console.log(data)
      if (data.success) {
        setSites(data.sites)
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

  useEffect(() => { fetchSites() }, [])

  const [siteName, setSiteName] = useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSiteName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  // useEffect(() => {
  //   setFormData({
  //     ...formData,
  //   })
  // }, [formData])

  // useEffect(() => { fetchSiteOptions(); }, [])

  const [selected, setSelected] = useState();

  // const handleInvoiceChange = event => {
  //   setSelected(event.target.value)
  //   if (siteOptions !== undefined) {
  //     setSelected(siteOptions.filter(i => i.site_id === event.target.value)[0])
  //   }
  // }

  const addUser = async (e) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const data = await AxiosPost('addUser.php', { ...formData, site_id: siteName, org_id: user.orgId })
      console.log(data)
      if (data.success) {
        toast.success("User added successfully")
        props.fetchUsers()
        handleClose()
        setFormData(initialFormData)
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
    setFormData(initialFormData)
    toggle()
  }

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // console.log(selected);
  const [roleType, setRoleType] = useState('')

  const onChangeHandlerRoleType = (e) => {
    setRoleType(e.target.value);
  }

  console.log(siteName);

  return (
    <Drawer open={open} anchor='right' variant='temporary' onClose={handleClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }} >
      <Header>
        <Typography variant='h6'>Add User</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5 }}>
        <form onSubmit={(e) => { addUser(e) }}>
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Username' value={formData.user_name} name='user_name' onChange={onChangeHandler} />
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Full Name' value={formData.fullname} name='fullname' onChange={onChangeHandler} />
          <TextField required type='email' fullWidth sx={{ mb: 6 }} label='Email' value={formData.email} name='email' onChange={onChangeHandler} />
          <TextField required type='number' fullWidth sx={{ mb: 6 }} label='Mobile Number' value={formData.mobile_number} name='mobile_number' onChange={onChangeHandler} />
          <FormControl fullWidth sx={{ mb: 6 }}>
            <InputLabel id='form-layouts-separator-select-label'>Department</InputLabel>
            <Select
              label='Department'
              defaultValue=''
              id='form-layouts-separator-select'
              labelId='form-layouts-separator-select-label'
              name='privilege-type' onChange={onChangeHandlerRoleType}
            >
              <MenuItem value='Developer'>Developer</MenuItem>
              <MenuItem value='HR'>Hr</MenuItem>
            </Select>
          </FormControl>

          {/* {roleType === 'In-House' && (
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='form-layouts-separator-select-label'>Role</InputLabel>
              <Select
                label='Role'
                defaultValue=''
                id='form-layouts-separator-select'
                labelId='form-layouts-separator-select-label'
                value={formData.privilege} name='privilege' onChange={onChangeHandler}
              >
                <MenuItem value='Supervisor'>Supervisor</MenuItem>
                <MenuItem value='Accountant'>Accountant</MenuItem>
                <MenuItem value='Engineer'>Engineer</MenuItem>
                <MenuItem value='Client'>Client</MenuItem>
              </Select>
            </FormControl>
          )}

          {roleType === 'Outsider' && (
            <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Outsider Role' value={formData.privilege} name='privilege' onChange={onChangeHandler} />
          )} */}

          {/* <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Sites' value={formData.site_id} name='site_id' onChange={(e) => { setFormData({ ...formData, site_id: [e.target.value] }) }} /> */}
          {/* <FormControl fullWidth sx={{ mb: 6 }}>
								<InputLabel  id='demo-simple-select-outlined-label'>Site Name</InputLabel>
								<Select
									label='Site Name'
									defaultValue=''
									id='demo-simple-select-outlined'
									labelId='demo-simple-select-outlined-label'
									name='site_id'
									value={formData.site_id}
									onChange={onChangeHandlerSiteId}
								>
									   {siteOptions.map(site =>
                      <MenuItem value={site.site_id}>
                        <input
                                        type="checkbox"
                                        name={site.site_id}
                                        checked={checkedItems[site.site_id] || false}
                                        onChange={handleCheckboxChange}
                                    /> &nbsp;

                        {site.site_name}</MenuItem>

                     )}


								</Select>
							</FormControl> */}


                            {/* <FormControl fullWidth sx={{ mb: 6 }}>
                                <InputLabel id="demo-multiple-checkbox-label">Sites</InputLabel>
                                <Select
                                labelId="demo-multiple-checkbox-label"
                                id="demo-multiple-checkbox"
                                multiple
                                value={siteName}
                                onChange={handleChange}
                                input={<OutlinedInput label="Sites" />}
                                renderValue={(selected) => selected.join(', ')}
                                MenuProps={MenuProps}
                                >
                                {sites && sites.map((name) => (
                                    <MenuItem key={name.site_id} value={name.site_id}>
                                    <Checkbox  checked={siteName.indexOf(name.site_id) > -1} />
                                    <ListItemText primary={name.site_name} />
                                    </MenuItem>
                                ))}
                                </Select>
                            </FormControl> */}


          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

export default SidebarAddUser
