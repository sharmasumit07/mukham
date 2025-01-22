// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import FormHelperText from '@mui/material/FormHelperText'



import themeConfig from 'src/configs/themeConfig'

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

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default
}))

const schema = yup.object().shape({
  role: yup.string().required(),
})


const AddNewRole = ({ open, toggle, fetchRoleOptions }) => {


  const {
    reset,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: '' }
  })

  const [isLoading, setIsLoading] = useState(false)
  const { user, selectedSite, setSelectedSite } = useContext(AuthContext)

  const onSubmit = async (inputdata) => {
    console.log("INPUT",inputdata)
    if(selectedSite === '') {
        toast.error("Select a Site Id")
    }
    try {
      const data = await AxiosPost('addRole.php', { ...inputdata, org_id: user.orgId, site_id: selectedSite });
  
      if (data.success) {
        await fetchRoleOptions();
        toast.success("Role added successfully");
        toggle();
        reset({ role: '' });
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
    reset({ role: '' })
  }

  const [siteOptions, setSiteOptions] = useState([])

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

  const onChangeHandlerSiteId = (e) => {
    const selectedSiteId = e.target.value;
    setSelectedSite(selectedSiteId)
  }

  useEffect(() => {
    fetchSiteOptions()
  }, [])

  return (
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
      <FormControl fullWidth sx={{ mb: 6, zIndex: 2 }}>
                <InputLabel id='demo-simple-select-outlined-label'>Site Name</InputLabel>
                <Select
                  
                  label='Site Name'
                  defaultValue=''
                  id='demo-simple-select-outlined'
                  labelId='demo-simple-select-outlined-label'
                  name='site_id'
                  value={selectedSite}
                  onChange={onChangeHandlerSiteId}
                >
                  {siteOptions.map(site => <MenuItem value={site.site_id}>{site.site_name}</MenuItem>)}
                </Select>
              </FormControl>
        <FormControl fullWidth sx={{ mb: 6 }}>
          <Controller
            name='role'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <TextField
                label='Enter Role'
                value={value}
                variant='outlined'
                onChange={onChange}
                error={Boolean(errors.role)}
              />
            )}
          />
          {errors.role && (
            <FormHelperText sx={{ color: 'error.main' }} id='invoice-name-error'>
              {errors.role.message}
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
  )
}

export default AddNewRole;
