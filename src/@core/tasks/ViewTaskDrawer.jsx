import React, { useContext, useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Icon from 'src/@core/components/icon'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab'
import { Grid, Paper, Divider, CircularProgress, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import { CalendarToday, Description, Assignment, Business, Folder, Straighten, AspectRatio } from '@mui/icons-material'

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(3, 4),
  justifyContent: 'space-between',
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.shadows[2],
}))

const TaskDetailItem = ({ icon, label, value }) => (
  <Box display="flex" alignItems="center" mb={2}>
    {icon}
    <Box ml={2}>
      <Typography variant="body2" color="textSecondary">{label}</Typography>
      <Typography variant="body1" fontWeight="bold">{value || 'N/A'}</Typography>
    </Box>
  </Box>
)

const SubTaskItem = ({ name, description }) => (
  <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: '#f9f9f9' }}>
    <Typography variant="subtitle1" fontWeight="bold">{name}</Typography>
    <Typography variant="body2" color="textSecondary">{description}</Typography>
  </Paper>
)

const DimensionsCard = ({ length, breadth, depth, whd, uom }) => (
  <Card elevation={3} sx={{ mt: 4 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        <Straighten color="primary" sx={{ mr: 2 }}/>
        Dimensions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">Length</TableCell>
              <TableCell align="right">{length} {uom}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">Breadth</TableCell>
              <TableCell align="right">{breadth} {uom}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">WHD</TableCell>
              <TableCell align="right">{whd} {uom}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
)

const ViewTaskDetails = ({ formData }) => {
  if (!formData) return <Typography>No data available</Typography>

  const { 
    task_id, task_name, task_description, length, breadth, whd, uom,
    start_date, actual_start_date, end_date, actual_end_date, 
    status, depth, vendor_name, path, sub_tasks
  } = formData

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>{task_name}</Typography>
      <Divider sx={{ my: 3 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <TaskDetailItem icon={<Assignment color="primary" />} label="Task ID" value={task_id} />
          <TaskDetailItem icon={<Description color="primary" />} label="Description" value={task_description} />
          <TaskDetailItem icon={<Business color="primary" />} label="Vendor" value={vendor_name} />
          <TaskDetailItem icon={<Straighten color="primary" />} label="UOM" value={uom} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="success" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" color="textSecondary">Start Date</Typography>
                <Typography>{start_date}</Typography>
              </TimelineContent>
            </TimelineItem>
            {actual_start_date && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="info" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" color="textSecondary">Actual Start Date</Typography>
                  <Typography>{actual_start_date}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot color="error" />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" color="textSecondary">End Date</Typography>
                <Typography>{end_date}</Typography>
              </TimelineContent>
            </TimelineItem>
            {actual_end_date && (
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot color="warning" />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body2" color="textSecondary">Actual End Date</Typography>
                  <Typography>{actual_end_date}</Typography>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
          <TaskDetailItem icon={<Assignment color="primary" />} label="Status" value={status} />
        </Grid>
      </Grid>

      <DimensionsCard length={length} breadth={breadth} depth={depth} whd={whd} uom={uom} />

      {/* <Box mt={5}>
        <Typography variant="h6" gutterBottom>Sub Tasks</Typography>
        {sub_tasks && sub_tasks.length > 0 ? (
          sub_tasks.map((subtask, index) => (
            <SubTaskItem key={index} name={subtask.subtask_name} description={subtask.sub_task_description} />
          ))
        ) : (
          <Typography color="textSecondary">No sub tasks available</Typography>
        )}
      </Box> */}
    </Box>
  )
}

const ViewTaskDrawer = props => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState(null)

  const { user, selectedSite } = useContext(AuthContext)

  const fetchParticularTask = async () => {
    setIsLoading(true)
    try {
      const data = await AxiosPost('fetchParticularTask.php', { 
        id: props.selectedId, 
        site_id: selectedSite, 
        org_id: user.orgId 
      })
      if (data.success) {
        const taskData = data.task
        taskData.sub_tasks = taskData.sub_tasks ? JSON.parse(taskData.sub_tasks) : []
        setFormData(taskData)
      } else {
        toast.error(data.error)
      }
    } catch (err) {
      console.error(err)
      toast.error("Error fetching task details.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { 
    if (props.selectedId) {
      fetchParticularTask() 
    }
  }, [props.selectedId])

  const handleClose = () => {
    props.toggle()
  }

  return (
    <Drawer
      open={props.open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 320, sm: 600 }, borderRadius: '10px 0 0 10px' } }}
    >
      <Header>
        <Typography variant='h6' fontWeight='bold'>Task Details</Typography>
        <IconButton size='small' onClick={handleClose} sx={{ color: 'text.primary' }}>
          <Icon icon='mdi:close' fontSize={24} />
        </IconButton>
      </Header>
      <Box sx={{ p: 5, overflowY: 'auto' }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <ViewTaskDetails formData={formData} />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 5 }}>
        <Button size='large' variant='outlined' color='secondary' onClick={handleClose}>
          Close
        </Button>
      </Box>
    </Drawer>
  )
}

export default ViewTaskDrawer