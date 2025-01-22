import { Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Select, Typography } from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import TasksPieChart from './TasksPieChart'
import TasksTable from './TasksTable'

const Avatar = styled(CustomAvatar)(({ theme }) => ({
    width: 40,
    height: 40,
    marginRight: theme.spacing(4)
}))

function TasksList() {
    return (
        
        <TasksTable />
    )
}

export default TasksList