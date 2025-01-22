// ** React Imports
import { useState, useEffect, useContext } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'
import LinearProgress from '@mui/material/LinearProgress'

// ** Third Party Imports
import axios from 'axios'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'

const Img = styled('img')(({ theme }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  marginRight: theme.spacing(3)
}))

const columns = [
  {
    flex: 0.3,
    minWidth: 230,
    field: 'projectTitle',
    headerName: 'Task',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Img src={'https://ui-avatars.com/api/?name=' + row.projectTitle + '&background=random'} alt={`project-${row.projectTitle}`} />
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>{row.projectTitle}</Typography>
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
            {row.projectType}
          </Typography>
        </Box>
      </Box>
    )
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'totalTask',
    headerName: 'Total Tasks',
    renderCell: ({ row }) => <Typography variant='body2'>{row.totalTask}</Typography>
  },
  {
    flex: 0.15,
    minWidth: 200,
    headerName: 'Progress',
    field: 'progressValue',
    renderCell: ({ row }) => (
      <Box sx={{ width: '100%' }}>
        <Typography variant='body2'>{row.progressValue}%</Typography>
        <LinearProgress
          variant='determinate'
          value={row.progressValue}
          color={row.progressValue < 25 ? "error" : row.progressValue < 50 ? "warning" : row.progressValue < 99 ? "info" : "success"}
          sx={{ height: 6, mt: 1, borderRadius: '5px' }}
        />
      </Box>
    )
  },
  {
    flex: 0.15,
    minWidth: 100,
    field: 'hours',
    headerName: 'Hours',
    renderCell: ({ row }) => <Typography variant='body2'>{row.hours}</Typography>
  }
]

const InvoiceListTable = (selectedUser) => {
  // ** State
  const [data, setData] = useState([
    { id: 0, projectTitle: "Demo Task1", hours: 100, progressValue: 80, totalTask: "80/100", projectType: "apartment" },
    { id: 1, projectTitle: "Demo Task2", hours: 100, progressValue: 20, totalTask: "80/100", projectType: "apartment" },
    { id: 2, projectTitle: "Demo Task3", hours: 100, progressValue: 100, totalTask: "80/100", projectType: "apartment" },
    { id: 3, projectTitle: "Demo Task5", hours: 100, progressValue: 40, totalTask: "80/100", projectType: "apartment" },
    { id: 4, projectTitle: "Demo Task1", hours: 100, progressValue: 80, totalTask: "80/100", projectType: "apartment" },
    { id: 5, projectTitle: "Demo Task1", hours: 100, progressValue: 80, totalTask: "80/100", projectType: "apartment" },
  ])
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 7 })
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useContext(AuthContext)

  useEffect(() => { fetchTasks() }, [])

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchTasksByUsername.php', { orgId: user.orgId, username: selectedUser.selectedUser })
      console.log(data)
      if (data.success) {
        setData(data.tasks.map(task => {
          return ({ ...task, progressValue: (task.completed_subtasks * 100 / task.totalTask) })
        }))
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
      <CardHeader title="User's Tasks List" />
      <DataGrid
        autoHeight
        rows={data}
        slots={{ toolbar: GridToolbar }}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[7, 10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </Card>
  )
}

export default InvoiceListTable
