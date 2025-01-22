import Grid from '@mui/material/Grid'

// ** Demo Components Imports
import UserViewLeft from './UserViewLeft.jsx'
import UserViewRight from './UserViewRight.jsx'
import { useState } from 'react'

const UserProfilePage = (props) => {
    const invoiceData = useState([])
    return (
        <Grid container spacing={6}>
            <Grid item xs={12} md={5} lg={4}>
                <UserViewLeft setSelectedUser={props.setSelectedUser} selectedUser={props.selectedUser} />
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
                <UserViewRight selectedUser={props.selectedUser} invoiceData={invoiceData} />
            </Grid>
        </Grid>
    )
}

export default UserProfilePage
