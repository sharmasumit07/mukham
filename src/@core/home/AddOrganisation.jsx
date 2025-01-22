// ** MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { AxiosPost } from 'src/context/AuthContext'
import { ScaleLoader } from 'react-spinners'
import { LoadingButton } from '@mui/lab'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

const AddOrganisation = (props) => {
    const [isLoading, setIsLoading] = useState(false)
    const initialFormData = { org_name: '', org_owner_username: '', address: '', phone_number: '', org_email: '', fullname: '', email: '', plan_type:'' }
    const [formData, setFormData] = useState(initialFormData)

    const onChangeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const addOrganisation = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        try {
            const data = await AxiosPost('addOrganisation.php', formData)
            console.log(data)
            if (data.success) {
                await props.fetchOrganisations()
                toast.success("Organisation added successfully")
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

    return (
        <Card>
            <CardHeader title='Add Organisation' />
            <CardContent>
                <form onSubmit={e => addOrganisation(e)}>
                    <Grid container spacing={5}>
                        <Grid item xs={6}>
                            <TextField fullWidth type='text' label='Organisation Name' name='org_name' value={formData.org_name} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type='number' label='Organisation Phone' name='phone_number' value={formData.phone_number} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type='email' label='Organisation Email' name='org_email' value={formData.org_email} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type='text' label='Organisation Owner UserName' name='org_owner_username' value={formData.org_owner_username} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        {/* <Grid item xs={6}>

                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id='demo-simple-select-outlined-label'>Plan Type</InputLabel>
                            <Select
                                label='Plan Type'
                                name='plan_type'
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                value={formData.plan_type}
                                onChange={(e) => onChangeHandler(e)} required
                            >

                                <MenuItem key="Basic" value="Basic">Basic</MenuItem>
                                <MenuItem key="Basic-Plus" value="Basic-Plus">Basic +</MenuItem>
                                <MenuItem key="Pro-Plus" value="Pro-Plus">Pro +</MenuItem>
                                <MenuItem key="Premium" value="Premium">Premium</MenuItem>

                            </Select>
                        </FormControl>
                        </Grid> */}
                        <Grid item xs={6}>
                            <TextField fullWidth type='text' label='Owner Fullname' name='fullname' value={formData.fullname} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type='text' label='Owner Email' name='email' value={formData.email} onChange={(e) => onChangeHandler(e)} required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth type='text' label='Organisation Address' name='address' value={formData.address} onChange={(e) => onChangeHandler(e)} minRows={3} multiline required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position='start'>
                                            <Icon icon='mdi:account-outline' />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <LoadingButton type='submit' loading={isLoading} size='large' variant="contained" >
                                Submit
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>

        </Card>
    )
}

export default AddOrganisation
