import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import UserViewLeft from './WorkerViewLeft.jsx'
import UserViewRight from './WorkerViewRight.jsx'
import { useState } from 'react'

const UserProfilePage = (props) => {
    const invoiceData = useState([])
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} md={5} lg={4}>
                <UserViewLeft setSelectedWorker={props.setSelectedWorker} selectedWorker={props.selectedWorker} />
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
                <UserViewRight selectedWorker={props.selectedWorker} invoiceData={invoiceData} />
            </Grid>
        </Grid>
    )
}

export default UserProfilePage
