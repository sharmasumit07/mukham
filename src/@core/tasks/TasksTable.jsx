import React, { useState, useEffect, useContext } from 'react'

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
import { TreeView, TreeItem } from '@mui/lab'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Avatar, Badge, Button, Chip, CircularProgress, Tooltip } from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import AddTaskDrawer from './AddTaskDrawer'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import toast from 'react-hot-toast'
import DeleteTaskDialog from './DeleteTaskDialogue'
import ViewTaskDrawer from './ViewTaskDrawer'
import AddTaskDialog from './AddTaskDialog'

// ** Styled component for the link
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

// ** Component for row options in the DataGrid
const RowOptions = ({ id, setSelectedId, setDeleteDialogOpen, setViewTaskOpen, setAddSubtaskOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const rowOptionsOpen = Boolean(anchorEl)

  const handleRowOptionsClick = event => {
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
          onClick={() => {
            setSelectedId(id)
            setViewTaskOpen(true)
            handleRowOptionsClose()
          }}
        >
          <Icon icon='mdi:eye-outline' fontSize={20} />
          View
        </MenuItem>
        <MenuItem
          sx={{ '& svg': { mr: 2 } }}
          onClick={() => {
            setSelectedId(id)
            handleRowOptionsClose()
          }}
        >
          <Icon icon='mdi:edit' fontSize={20} />
          Edit
        </MenuItem>
        <MenuItem
          sx={{ '& svg': { mr: 2 } }}
          onClick={() => {
            setSelectedId(id)
            setAddSubtaskOpen(true)
            handleRowOptionsClose()
          }}
        >
          <Icon icon='mdi:subdirectory-arrow-right' fontSize={20} />
          Add Subtask
        </MenuItem>
        <MenuItem
          sx={{ '& svg': { mr: 2 } }}
          onClick={() => {
            setSelectedId(id)
            setDeleteDialogOpen(true)
            handleRowOptionsClose()
          }}
        >
          <Icon icon='mdi:trash' fontSize={20} />
          Delete
        </MenuItem>
      </Menu>
    </>
  )
}

const CustomTreeItem = ({ nodeId, label, task }) => {
  const getStatusColor = status => {
    const statusColors = {
      Completed: 'success.light',
      InProgress: 'info.light',
      Pending: 'warning.light',
      Delayed: 'error.light'
    }

    return statusColors[status] || 'grey.200'
  }

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='body1' noWrap>
              {label}
            </Typography>
          </Box>
          <Chip
            label={task.status}
            size='small'
            sx={{
              bgcolor: getStatusColor(task.status),
              '& .MuiChip-label': { px: 2 }
            }}
          />
        </Box>
      }
    >
      {task.children
        ? task.children.map(node => (
            <CustomTreeItem key={node.task_id} nodeId={node.task_id.toString()} label={node.task_name} task={node} />
          ))
        : null}
    </TreeItem>
  )
}

const TaskTree = ({ tasks }) => {
  const [expanded, setExpanded] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  const handleTaskSelect = (event, nodeId) => {
    const task = findTaskById(tasks, nodeId)
    setSelectedTask(task)
  }

  const findTaskById = (tasks, id) => {
    for (const task of tasks) {
      if (task.task_id.toString() === id) {
        return task
      }
      if (task.children) {
        const found = findTaskById(task.children, id)
        if (found) return found
      }
    }

    return null
  }

  // Add helper function for checking displayable values
  const shouldDisplayValue = value => {
    return value !== null && value !== 0 && value !== undefined;
  };

  return (
    <Box display='flex' height='100%' width='100%'>
      <Box
        width='60%'
        height='100%'
        sx={{
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          borderRadius: 1,
          p: 2
        }}
      >
        <Typography variant='h6' gutterBottom sx={{ px: 2, py: 1 }}>
          Task Hierarchy
          <Typography variant='body2' color='text.secondary'>
            View and manage project tasks
          </Typography>
        </Typography>
        <TreeView
          aria-label='task tree'
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          onNodeToggle={handleToggle}
          onNodeSelect={handleTaskSelect}
          sx={{
            height: 'calc(100% - 48px)',
            overflowY: 'auto',
            overflowX: 'auto',
            '& .MuiTreeItem-root': {
              my: 0.5
            },
            '& .MuiTreeItem-content': {
              p: 0.5,
              borderRadius: 1
            }
          }}
        >
          {tasks.map(task => (
            <CustomTreeItem key={task.task_id} nodeId={task.task_id.toString()} label={task.task_name} task={task} />
          ))}
        </TreeView>
      </Box>
      <Box width='40%' height='100%' sx={{ pl: 2 }}>
        <Typography variant='h6' gutterBottom sx={{ px: 2, py: 1 }}>
          Task Details
          <Typography variant='body2' color='text.secondary'>
            Detailed information about the selected task
          </Typography>
        </Typography>
        {selectedTask ? (
          <Card sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant='h6' gutterBottom>
                {selectedTask.task_name}
              </Typography>
              <Chip
                label={selectedTask.status}
                color={
                  selectedTask.status === 'Completed'
                    ? 'success'
                    : selectedTask.status === 'InProgress'
                    ? 'info'
                    : selectedTask.status === 'Pending'
                    ? 'warning'
                    : 'default'
                }
                size='small'
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              {shouldDisplayValue(selectedTask.total_uom) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:timer-outline' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Total UOM
                      </Typography>
                      <Typography variant='body1'>{selectedTask.total_uom}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.total_price) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:currency-inr' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Total Price
                      </Typography>
                      <Typography variant='body1'>₹{selectedTask.total_price}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.length) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:ruler' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Length
                      </Typography>
                      <Typography variant='body1'>{selectedTask.length}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.breadth) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:ruler-square' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Breadth
                      </Typography>
                      <Typography variant='body1'>{selectedTask.breadth}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.whd) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:cube-outline' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        WHD
                      </Typography>
                      <Typography variant='body1'>{selectedTask.whd}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.diameter) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:circle-outline' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Diameter
                      </Typography>
                      <Typography variant='body1'>{selectedTask.diameter}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.weight) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:weight' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Weight
                      </Typography>
                      <Typography variant='body1'>{selectedTask.weight}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.start_date) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:calendar-start' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Start Date
                      </Typography>
                      <Typography variant='body1'>{selectedTask.start_date}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {shouldDisplayValue(selectedTask.end_date) && (
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon icon='mdi:calendar-end' />
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        End Date
                      </Typography>
                      <Typography variant='body1'>{selectedTask.end_date}</Typography>
                    </Box>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Card>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography color='text.secondary'>Select a task to view details</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
// ** Main TasksTable component
const TasksTable = () => {
  const [addTaskOpen, setAddDrawerOpen] = useState(false)
  const [viewTaskOpen, setViewTaskOpen] = useState(false)
  const [tasks, setTasks] = useState([])
  const [flatTasks, setFlatTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { user, selectedSite } = useContext(AuthContext)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  const [addSubtaskOpen, setAddSubtaskOpen] = useState(false)

  const toggleAddSubtaskDrawer = () => {
    setAddSubtaskOpen(!addSubtaskOpen)
  }

  const columns = [
    {
      flex: 0.2,
      minWidth: 300,
      field: 'task_name',
      headerName: 'Task Name',
      renderCell: ({ row }) => (
        <Typography noWrap variant='body' style={{ marginLeft: `${row.depth * 20}px` }}>
          {row.task_name}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 150,
      sortable: false,
      field: 'assigned',
      headerName: 'Assigned to',
      renderCell: ({ row }) => (
        <Typography noWrap variant='body'>
          {row.vendor_name === null ? 'In-House' : row.vendor_name}
        </Typography>
      )
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'start_date',
      headerName: 'Start Date',
      renderCell: ({ row }) => (
        <Typography noWrap variant='body'>
          {row.start_date}
        </Typography>
      )
    },
    {
      flex: 0.15,
      field: 'end_date',
      minWidth: 150,
      headerName: 'End Date',
      renderCell: ({ row }) => (
        <Typography noWrap variant='body'>
          {row.end_date}
        </Typography>
      )
    },
    {
      flex: 0.1,
      minWidth: 110,
      field: 'status',
      headerName: 'Status',
      renderCell: ({ row }) => (
        <Chip
          label={row.status}
          size='small'
          color={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'InProgress'
              ? 'info'
              : row.status === 'Pending'
              ? 'warning'
              : 'default'
          }
        />
      )
    },
    {
      flex: 0.1,
      minWidth: 90,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <RowOptions
          id={row.task_id}
          setSelectedId={setSelectedId}
          setDeleteDialogOpen={setDeleteDialogOpen}
          setViewTaskOpen={setViewTaskOpen}
          setAddSubtaskOpen={toggleAddSubtaskDrawer}
        />
      )
    }
  ]

  // Function to flatten the hierarchical structure into a sorted list
  const flattenHierarchy = (hierarchy) => {
    const result = [];

    const traverse = (nodes) => {
      nodes.forEach((node) => {
        // Add the current node to the result
        result.push(node);
        // Recursively add children
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(hierarchy);
    return result;
  };


  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchMainTask.php', { orgId: user.orgId, site_id: selectedSite });
      if (data.success) {
        // Build the hierarchical structure for tree view
        const hierarchicalTasks = buildHierarchy(data.tasks);

        // Flatten the hierarchical structure into a sorted list for grid view
        const flatTasks = flattenHierarchy(hierarchicalTasks);

        setTasks(hierarchicalTasks);  // For tree view
        setFlatTasks(flatTasks);      // For grid view
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server Error!");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTasks() }, [selectedSite])

  const toggleAddTaskDrawer = () => {
    if (!selectedSite) {
      toast.error('Select a Site to Add a Task')
    } else {
      setAddDrawerOpen(!addTaskOpen)
    }
  }

  const buildHierarchy = (items) => {
    const hierarchy = {};
    const rootItems = [];

    // Create a map of task_id to task object
    items.forEach(item => {
      hierarchy[item.task_id] = { ...item, children: [] };
    });

    // Build hierarchy based on paths
    items.forEach(item => {
      if (item.depth === "0") {
        // Top-level tasks
        rootItems.push(hierarchy[item.task_id]);
      } else {
        // Find parent task and add this task to its children
        const parentIds = item.path.split(',');
        const parentId = parentIds[parentIds.length - 1]; // Get the immediate parent ID
        if (hierarchy[parentId]) {
          hierarchy[parentId].children.push(hierarchy[item.task_id]);
        }
      }
    });

    return rootItems;
  };

  // console.log(tasks);
  


  return (
    <>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title="Tasks"
            sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
            action={
              <>
                <Button sx={{ mr: 2 }} onClick={fetchTasks} variant="contained">
                  Refresh
                </Button>
                <Button onClick={toggleAddTaskDrawer} variant="contained">
                  Add Task
                </Button>
                <Button sx={{ ml: 2 }} onClick={() => setViewMode(viewMode === 'grid' ? 'tree' : 'grid')} variant="outlined">
                  {viewMode === 'grid' ? 'Tree View' : 'Grid View'}
                </Button>
              </>
            }
          />
          <Divider />
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ height:900, width: '100%', p: 3 }}>
              {viewMode === 'grid' ? (
                <DataGrid
                  rows={flatTasks}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5, 10, 20]}
                  slots={{ toolbar: GridToolbar }}
                  getRowId={(row) => row.task_id}
                  disableSelectionOnClick
                />
              ) : (
                <TaskTree tasks={tasks} sx={{ height: 900 }} />
              )}
            </Box>
          )}
        </Card>
      </Grid>

      <DeleteTaskDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        fetchTasks={fetchTasks}
        selectedId={selectedId}
      />
      <AddTaskDrawer
        open={addTaskOpen}
        toggle={toggleAddTaskDrawer}
        fetchTasks={fetchTasks}
        tasks={flatTasks}
      />
      <AddTaskDialog
        open={addSubtaskOpen}
        onClose={toggleAddSubtaskDrawer}
        fetchTasks={fetchTasks}
        tasks={flatTasks}
        parentTaskId={selectedId} 
      />
      <ViewTaskDrawer
        open={viewTaskOpen}
        toggle={() => setViewTaskOpen(!viewTaskOpen)}
        selectedId={selectedId}
      />
    </>
  )
}

export default TasksTable;