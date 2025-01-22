// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** Next Imports
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'


// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import AddUserDrawer from './AddUserDrawer'
import AddUser from './AddUser'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'
import { Avatar, Badge, Button } from '@mui/material'
import RolesCards from './RoleCards'

// ** Vars

const defaultIcon = 'mdi:grade '; // Default icon for unknown privileges
const defaultColor = 'info.main';
const userRoleObj = {
    Owner: { icon: 'mdi:house', color: 'error.main' },
    Admin: { icon: 'mdi:laptop', color: 'error.main' },
    Engineer: { icon: 'mdi:cog-outline', color: 'warning.main' },
    Client: { icon: 'mdi:pencil-outline', color: 'info.main' },
    Supervisor: { icon: 'mdi:chart-donut', color: 'success.main' },
    Accountant: { icon: 'mdi:account-outline', color: 'primary.main' }
}

const userStatusObj = {
    A: 'success',
    N: 'warning',
}

const LinkStyled = styled(Link)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main
    }
}))

const RowOptions = ({ id, setSelectedUser }) => {
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = event => {
        // console.log("OPEN CLICK",  event.currentTarget)
        setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
        setAnchorEl(null)
    }

    return (
        <>
            <IconButton size='small' onClick={handleRowOptionsClick}>
                <Icon icon='mdi:dots-vertical' />
            </IconButton>
            <Menu
                keepMounted
                anchorEl={anchorEl}
                open={rowOptionsOpen}
                onClose={handleRowOptionsClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                PaperProps={{ style: { minWidth: '8rem' } }}
            >
                <MenuItem
                    sx={{ '& svg': { mr: 2 } }}
                    onClick={() => { setSelectedUser(id); handleRowOptionsClose() }}
                >
                    <Icon icon='mdi:eye-outline' fontSize={20} />
                    View
                </MenuItem>
            </Menu>
        </>
    )
}

const UserList = (props) => {
    const [addUserOpen, setAddUserOpen] = useState(false)
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
    const [users, setUsers] = useState({ users: [] })
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useContext(AuthContext)

    console.log("USER", users)


    const columns = [
        {
            flex: 0.2,
            minWidth: 230,
            field: 'fullname',
            headerName: 'User',
            renderCell: ({ row }) => {

                return (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge overlap='circular'>
                            <Avatar alt='John Doe' src={'https://ui-avatars.com/api/?name=' + row.fullname + '&background=random'} sx={{ width: '2.5rem', height: '2.5rem', mr: 2 }} />
                        </Badge>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                            <LinkStyled href="#" onClick={() => { props.setSelectedUser(row.user_name); }}>{row.fullname}</LinkStyled>
                            <Typography noWrap variant='caption'>
                                {`@${row.user_name}`}
                            </Typography>
                        </Box>
                    </Box>
                )
            }
        },
        {
            flex: 0.2,
            minWidth: 250,
            field: 'email',
            headerName: 'Email',
            renderCell: ({ row }) => {
                return (
                    <Typography noWrap variant='body'>
                        {row.email}
                    </Typography>
                )
            }
        },
        {
            flex: 0.15,
            field: 'privilege',
            minWidth: 150,
            headerName: 'Role',
            renderCell: ({ row }) => {
                // console.log("ROW",row)
                const roleInfo = userRoleObj[row.privilege];

                const icon = roleInfo ? roleInfo.icon : defaultIcon;
                const color = roleInfo ? roleInfo.color : defaultColor;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', '& svg': { mr: 3, color } }}>
                        <Icon icon={icon} fontSize={20} />
                        <Typography noWrap sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                            {row.privilege}
                        </Typography>
                    </Box>
                )
            }
        },
        {
            flex: 0.1,
            minWidth: 110,
            field: 'status',
            headerName: 'Status',
            renderCell: ({ row }) => {
                return (
                    <CustomChip
                        skin='light'
                        size='small'
                        label={row.status}
                        color={userStatusObj[row.status]}
                        sx={{ textTransform: 'capitalize', '& .MuiChip-label': { lineHeight: '18px' } }}
                    />
                )
            }
        },
        {
            flex: 0.1,
            minWidth: 90,
            sortable: false,
            field: 'user_name',
            headerName: 'Actions',
            renderCell: ({ row }) => <RowOptions id={row.user_name} setSelectedUser={props.setSelectedUser} />
        }
    ]


    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await AxiosPost('fetchUsers.php', { orgId: user.orgId })
            console.log(data)
            if (data.success) {
                setUsers(data)
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

    useEffect(() => { fetchUsers() }, [])
    const getRowId = row => { return row.user_name }
    const toggleAddUserDrawer = () => setAddUserOpen(!addUserOpen)

    return (
        <Grid container spacing={6}>
            <Grid item xs={12}>
                <RolesCards></RolesCards>
            </Grid>
            <Grid item xs={12}>
                <Card>
                    <CardHeader title='All Users' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
                        action={
                            <>
                                <Button sx={{ mr: 2 }} onClick={fetchUsers} variant='contained'>
                                    Refresh
                                </Button>
                                <AddUser/>
                                {/* <Button onClick={toggleAddUserDrawer} variant='contained'>
                                    Add User
                                </Button> */}
                            </>
                        } />

                    <Divider />
                    <DataGrid
                        loading={isLoading}
                        autoHeight
                        rows={users.users}
                        getRowId={getRowId}
                        columns={columns}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        slots={{ toolbar: GridToolbar }}
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                    />
                </Card>
            </Grid>

            <AddUserDrawer open={addUserOpen} toggle={toggleAddUserDrawer} fetchUsers={fetchUsers} />
        </Grid>
    )
}

export default UserList
