import { useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
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
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))


const SidebarAddVendor = ({ openVendor, toggleVendor, fetchLVendorsOptions, fetchBuyVendor})  => {
  const [isLoading, setIsLoading] = useState(false)
  const initialFormData = { user_name: '', vendor_name: '', vendor_type: '', mobile_number: '', is_kyc_verified:'', gst_no: '', address:'' }
  const [formData, setFormData] = useState(initialFormData)
  const { user } = useContext(AuthContext)  
    // console.log("props",props)
  const addVendor = async (e) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const data = await AxiosPost('addNewVendor.php', { ...formData, org_id: user.orgId })
      console.log(data)
      if (data.success) {
        toast.success("Vendor added successfully")
        fetchLVendorsOptions()
        fetchBuyVendor()
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
    toggleVendor()
  }

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  

  

  return (
    <Drawer open={openVendor} anchor='right' variant='temporary' onClose={handleClose} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }} >
      <Header>
        <Typography variant='h6'>Add Vendor</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
          <Icon icon='mdi:close' fontSize={20} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5 }}>
        <form onSubmit={(e) => { addVendor(e) }}>
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Username' value={formData.user_name} name='user_name' onChange={onChangeHandler} />
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Vendor Name' value={formData.vendor_name} name='vendor_name' onChange={onChangeHandler} />
          <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='form-layouts-separator-select-label'>Vendor Type</InputLabel>
              <Select
                label='Vendor Type'
                defaultValue=''
                id='form-layouts-separator-select'
                labelId='form-layouts-separator-select-label'
                value={formData.vendor_type} name='vendor_type' onChange={onChangeHandler}
              >
                <MenuItem value='Purchase'>Purchase</MenuItem>
                <MenuItem value='Contractor - Man Power Only'>Contractor - Man Power Only</MenuItem>
                <MenuItem value='Contractor - Man Power and Material'>Contractor - Man Power and Material</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 6 }}>
              <InputLabel id='form-layouts-separator-select-label'>Is KYC Verified?</InputLabel>
              <Select
                label='Is KYC Verified?'
                defaultValue=''
                id='form-layouts-separator-select'
                labelId='form-layouts-separator-select-label'
                value={formData.is_kyc_verified} name='is_kyc_verified' onChange={onChangeHandler}
              >
                <MenuItem value='Yes'>Yes</MenuItem>
                <MenuItem value='No'>No</MenuItem>
              </Select>
            </FormControl>
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Gst No' value={formData.gst_no} name='gst_no' onChange={onChangeHandler} />
          <TextField required type='number' fullWidth sx={{ mb: 6 }} label='Mobile Number' value={formData.mobile_number} name='mobile_number' onChange={onChangeHandler} />      
          <TextField required type='text' fullWidth sx={{ mb: 6 }} label='Address' value={formData.address} name='address' onChange={onChangeHandler} />

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

export default SidebarAddVendor;
