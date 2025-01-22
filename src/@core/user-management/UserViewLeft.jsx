// ** React Imports
import { useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import UserSuspendDialog from './UserSuspendDialog.jsx'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { AxiosPost } from 'src/context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { LoadingButton } from '@mui/lab'

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  A: 'success',
  D: 'warning',
  inactive: 'secondary'
}


const UserViewLeft = (props) => {
  // ** States
  const [isLoading, setIsLoading] = useState(true)
  const [openEdit, setOpenEdit] = useState(false)
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
  const [data, setData] = useState(null)
  const initialFormData = { user_name: '', fullname: '', email: '', status: '', privilege: '', mobile_number: '', site_id: '' }
  const [formData, setFormData] = useState(initialFormData)

  const onChangeHandler = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchUser.php', { user_name: props.selectedUser })
      console.log(data)
      if (data.success) {
        setData(data.user)
        setFormData({ ...formData, ...data.user })
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

  const editUser = async (e) => {
    e.preventDefault()
    setIsLoading(true);
    try {
      const data = await AxiosPost('editUser.php', { ...formData, id: props.selectedUser })
      console.log(data)
      if (data.success) {
        await fetchUserData()
        toast.success("User information updated successfully")
        setOpenEdit(false)
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

  useEffect(() => { fetchUserData() }, [])

  // Handle Edit dialog
  const handleEditClickOpen = () => setOpenEdit(true)
  const handleEditClose = () => setOpenEdit(false)

  if (data) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <Button size='small' color='secondary' sx={{ m: 3, mb: 0 }} variant="contained" onClick={() => props.setSelectedUser(null)}>
              Go back
            </Button>
            <CardContent sx={{ pt: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              <CustomAvatar
                src={'https://ui-avatars.com/api/?name=' + data.fullname + '&background=random'}
                variant='rounded'
                alt={data.fullname}
                sx={{ width: 120, height: 120, fontWeight: 600, mb: 4 }}
              />
              <Typography variant='h6' sx={{ mb: 2 }}>
                {data.fullname}
              </Typography>
              <CustomChip
                skin='light'
                size='small'
                label={data.privilege}
                color={roleColors[data.privilege]}
                sx={{
                  height: 20,
                  fontWeight: 600,
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  textTransform: 'capitalize',
                  '& .MuiChip-label': { mt: -0.25 }
                }}
              />
            </CardContent>

            <CardContent sx={{ my: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ mr: 8, display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                    <Icon icon='mdi:check' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                      1.23k
                    </Typography>
                    <Typography variant='body2'>Task Done</Typography>
                  </div>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ mr: 3 }}>
                    <Icon icon='mdi:briefcase-variant-outline' />
                  </CustomAvatar>
                  <div>
                    <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                      568
                    </Typography>
                    <Typography variant='body2'>Task Pending</Typography>
                  </div>
                </Box>
              </Box>
            </CardContent>

            <CardContent>
              <Typography variant='h6'>Details</Typography>
              <Divider sx={{ mt: theme => `${theme.spacing(4)} !important` }} />
              <Box sx={{ pt: 2, pb: 1 }}>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Username:
                  </Typography>
                  <Typography variant='body2'>@{data.user_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Email:
                  </Typography>
                  <Typography variant='body2'>{data.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography variant='subtitle2' sx={{ mr: 2, color: 'text.primary' }}>
                    Status:
                  </Typography>
                  <CustomChip
                    skin='light'
                    size='small'
                    label={data.status}
                    color={statusColors[data.status]}
                    sx={{
                      height: 20,
                      fontWeight: 500,
                      fontSize: '0.75rem',
                      borderRadius: '5px',
                      textTransform: 'capitalize'
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Role:</Typography>
                  <Typography variant='body2' sx={{ textTransform: 'capitalize' }}>
                    {data.privilege}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Contact:</Typography>
                  <Typography variant='body2'>+91 {data.mobile_number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Sites:</Typography>
                  <Typography variant='body2'>{data.site_id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', mb: 2.7 }}>
                  <Typography sx={{ mr: 2, fontWeight: 500, fontSize: '0.875rem' }}>Joined On:</Typography>
                  <Typography variant='body2'>{data.created_at}</Typography>
                </Box>
              </Box>
            </CardContent>

            <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant='contained' sx={{ mr: 2 }} onClick={handleEditClickOpen}>
                Edit
              </Button>
              <Button color='error' variant='outlined' onClick={() => setSuspendDialogOpen(true)}>
                Suspend
              </Button>
            </CardActions>

            <Dialog
              open={openEdit}
              onClose={handleEditClose}
              aria-labelledby='user-view-edit'
              aria-describedby='user-view-edit-description'
              sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650 } }}
            >
              <DialogTitle
                id='user-view-edit'
                sx={{
                  textAlign: 'center',
                  fontSize: '1.5rem !important',
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                  pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`],
                }}
              >
                Edit User Information
              </DialogTitle>
              <DialogContent
                sx={{
                  py: theme => `${theme.spacing(5)} !important`,
                  px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                }}
              >
                <form onSubmit={editUser}>
                  <Grid container spacing={6}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label='Username' value={formData.user_name} name='user_name' onChange={onChangeHandler} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label='Full Name' value={formData.fullname} name='fullname' onChange={onChangeHandler} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label='Email' value={formData.email} name='email' onChange={onChangeHandler} required />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id='user-view-status-label'>Status</InputLabel>
                        <Select required
                          label='Status'
                          value={formData.status}
                          name='status'
                          onChange={onChangeHandler}
                          id='user-view-status'
                          labelId='user-view-status-label'
                        >
                          <MenuItem value='A'>Active</MenuItem>
                          <MenuItem value='N'>Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label='Mobile Number' value={formData.mobile_number} name='mobile_number' onChange={onChangeHandler} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label='Sites' value={formData.site_id} name='site_id' onChange={onChangeHandler} required />
                    </Grid>
                  </Grid>
                  <DialogActions
                    sx={{
                      justifyContent: 'center',
                      px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
                      pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
                    }}
                  >
                    <LoadingButton isLoading={isLoading} type="submit" variant='contained' sx={{ mr: 2 }}>
                      Submit
                    </LoadingButton>
                    <Button variant='outlined' color='secondary' onClick={handleEditClose}>
                      Cancel
                    </Button>
                  </DialogActions>
                </form>
              </DialogContent>
            </Dialog>

            <UserSuspendDialog open={suspendDialogOpen} setOpen={setSuspendDialogOpen} fetchUserData={fetchUserData} selectedUser={props.selectedUser} />
          </Card>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default UserViewLeft
