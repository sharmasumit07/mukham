import Link from "next/link"

import { Badge, Box, Button, Card, CardHeader, Divider, Grid, Icon, IconButton, Menu, MenuItem, Modal, Typography, styled, Chip } from "@mui/material"
import { DataGrid, GridToolbar } from "@mui/x-data-grid"
import { useContext, useEffect, useState } from "react"
import AddInHousePaySide from "./AddInHousePaySide"
import AddBuySide from "./AddBuySide"
import AddVendorPaySide from "./AddVendorPaySide"
import AssessmentIcon from '@mui/icons-material/Assessment';
import toast from "react-hot-toast"
import { AuthContext, AxiosPost } from "src/context/AuthContext"
import { display } from "@mui/system"
import DateRangeIcon from '@mui/icons-material/DateRange';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

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

const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return 'th'; // catches 11th - 20th
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

// Helper function to format a date and limit month name to first 3 letters
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0'); // Add leading zero
  const month = date.toLocaleString('default', { month: 'short' }); // First 3 letters of month
  const year = date.getFullYear();
  
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

// Helper function to get dark color based on the month
const getMonthColor = (month) => {
  const monthColors = {
    Jan: '#8B0000', // DarkRed for January
    Feb: '#800080', // Purple for February
    Mar: '#006400', // DarkGreen for March
    Apr: '#2E8B57', // SeaGreen for April
    May: '#8B4513', // SaddleBrown for May
    Jun: '#FF8C00', // DarkOrange for June
    Jul: '#4682B4', // SteelBlue for July
    Aug: '#9932CC', // DarkOrchid for August
    Sep: '#2F4F4F', // DarkSlateGray for September
    Oct: '#FF4500', // OrangeRed for October
    Nov: '#A0522D', // Sienna for November
    Dec: '#228B22'  // ForestGreen for December
  };

  return monthColors[month] || '#000'; // Default to black if month not found
};

const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
}); 


const RowOptions = ({ id, setScreen }) => {
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
                    onClick={() => { setScreen(1); handleRowOptionsClose() }}
                >
                    <Icon icon='mdi:eye-outline' fontSize={20} />
                    View
                </MenuItem>
            </Menu>
        </>
    )
}

const WagesTable = (props) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
    const { user, selectedSite } = useContext(AuthContext)
    const [addInHousePayOpen, setaddInHousePayOpen] = useState(false);
    const toggleAddInHousePayDrawer = () => setaddInHousePayOpen(!addInHousePayOpen)

    const [addVendorPayOpen, setaddVendorPayOpen] = useState(false);
    const toggleAddVendorPayDrawer = () => setaddVendorPayOpen(!addVendorPayOpen)



    const totalLVendorSum = props.expensesLVendor.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);    
    const totalInHouseSum = props.expensesInHouse.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);
    const totalBuy = props.expensesBuy.reduce((sum, row) => sum + parseFloat(row.total_amount), 0);

    const [showPopup, setShowPopup] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState(null);
    
    const [isLoading, setIsLoading] = useState(false);

    const handleDateClick = (weekRange) => {
      setShowPopup(true);
      setSelectedWeek(weekRange);
      fetchWeeklySiteExpense(weekRange);
  };
    
    const handleClosePopup = () => {
        setShowPopup(false);
    };
    
  const [expensesWeekly, setExpensesWeekly] = useState([]);

    const [dataArray, setDataArray] = useState([]);

    const getWeekDates = () => {
      if (!selectedWeek) return [];
  
      const [startDateStr] = selectedWeek.split(' to ');
      const startDate = new Date(startDateStr);
      
      return Array.from({ length: 7 }, (_, i) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          return date;
      });
  };

  console.log("hello",expensesWeekly);

  const fetchWeeklySiteExpense = async (weekRange) => {
    setIsLoading(true);
    const site_id = selectedSite;
    try {
      const data = await AxiosPost('fetchWeeklySiteExpenses.php', {
        orgId: user.orgId,
        weekRange: weekRange,
        site_id: site_id,
      });
  
      if (data.success) {
        console.log("Data",data);
        
        setExpensesWeekly(data.weekly_expenses);
        const weekArray = Array(7).fill(0);
        const processedDataArray = [];
        data.weekly_expenses.forEach(worker => {
          const workerExpenses = [...weekArray]; // Initialize with zeros for each day of the week
          worker.details.forEach(detail => {
            const dayOfWeek = new Date(detail.date).getDay();
            const price = parseFloat(detail.price); 
            if (Array.isArray(workerExpenses[dayOfWeek])) {
              workerExpenses[dayOfWeek].push(price);
            } else if (workerExpenses[dayOfWeek] !== 0) {
              workerExpenses[dayOfWeek] = [workerExpenses[dayOfWeek], price];
            } else {
              workerExpenses[dayOfWeek] = price;
            }
          });
          processedDataArray.push(workerExpenses);
        });
        // Set processed data to dataArray state
        setDataArray(processedDataArray);
        console.log("Processed Data Array:", processedDataArray); // Debug final structure
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

    console.log(dataArray);
    
  

    function TableWithSum({ data }) {
      // console.log("DATA",data)
      const [horizontalSum, setHorizontalSum] = useState([]);
      const [verticalSum, setVerticalSum] = useState([]);
  
      useEffect(() => {
        const calculateSums = () => {
          if (data.length === 0) return;
  
          const horizontalSums = [];
          const verticalSums = Array(data[0].length).fill(0);
  
          data.forEach((row, rowIndex) => {
            let rowSum = 0;
            row.forEach((cell, columnIndex) => {
              if (Array.isArray(cell)) {
                rowSum += cell.reduce((acc, val) => acc + val, 0);
                verticalSums[columnIndex] += cell.reduce((acc, val) => acc + val, 0);
              } else {
                rowSum += cell;
                verticalSums[columnIndex] += cell;
              }
            });
            horizontalSums.push(rowSum);
          });
  
          setHorizontalSum(horizontalSums);
          setVerticalSum(verticalSums);
        };
  
        calculateSums();
      }, [data]);
  
      // Array of day names
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Total"];

      const weekDates = getWeekDates();
  
      return (
        <div>
    <table className="table">
    <thead>
        <tr>
          {/* Worker Name column */}
          <th>Worker Name</th>
          {/* Display day names and dates as column headers */}
          {daysOfWeek.map((day, index) => (
            <th key={index}>
              {day}
              {index < 7 && (
                <div style={{ fontSize: '0.8em', fontWeight: 'normal' }}>
                  {weekDates[index].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </th>
          ))}
        </tr>
      </thead>
  
      <tbody>
        {expensesWeekly.map((worker, workerIndex) => (
          <tr key={workerIndex}>
            {/* Worker Name cell */}
            <td>{worker.worker_name}</td>
            {dataArray[workerIndex].map((cell, cellIndex) => (
              <td key={cellIndex}>
                {Array.isArray(cell) ? (
                  <div>
                    {cell.map((price, index) => (
                      <div key={index} style={{ backgroundColor: price < 0 ? 'red' : 'inherit', color: price < 0 ? '#fff' : 'inherit' }}>
                        {Math.abs(price).toLocaleString('en-IN', {
                          style: 'currency',
                          currency: 'INR'
                        })} {/* Format as Indian currency */}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ backgroundColor: cell < 0 ? 'red' : 'inherit', color: cell < 0 ? '#fff' : 'inherit' }}>
                    {Math.abs(cell).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    })} {/* Format as Indian currency */}
                  </div>
                )}
              </td>
            ))}
            <td style={{ backgroundColor: horizontalSum[workerIndex] < 0 ? 'red' : 'inherit', color: horizontalSum[workerIndex] < 0 ? '#fff' : 'inherit' }}>{Math.abs(horizontalSum[workerIndex]).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    })}</td>
          </tr>
        ))}
        <tr>
          <td>Total</td>
          {/* Render vertical sums */}
          {verticalSum.map((sum, index) => (
            <td style={{ backgroundColor: sum < 0 ? 'red' : 'inherit', color: sum < 0 ? '#fff' : 'inherit' }} key={index}>{Math.abs(sum).toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR'
            })}</td>
          ))}
          {/* Render total horizontal sum */}
          <td>{Math.abs(horizontalSum.reduce((acc, curr) => acc + curr, 0)).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR'
                    })}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
      );
    }


      const columns = [
        {
          flex: 0.1,
          minWidth: 110,
          field: 'total_amount',
          headerName: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CurrencyRupeeIcon sx={{ mr: 1, color: '#4CAF50' }} /> {/* Rupee icon with color */}
              <Typography variant="body1">Total Amount</Typography>
            </Box>
          ),
          renderCell: ({ row }) => {
            return (
              <Typography noWrap variant='body'>
                <Chip
                      label={CurrencyFormatter.format(row.total_amount)}
                      color="primary"
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: '1rem', height: 32 }}
                    />
              </Typography>
            );
          }
        },
      ];

    const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    });
    const columnsLVendor = [
      {
        flex: 0.2,
        minWidth: 230,
        field: 'week_range',
        headerName: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ mr: 1, color: '#4682B4' }} /> {/* Set icon color here */}
            <Typography variant="body1">Week Range</Typography>
          </Box>
        ),
        renderCell: ({ row }) => {
          const [startDate, endDate] = row.week_range.split(' to ');
    
          // Get month name for color
          const startMonth = new Date(startDate).toLocaleString('default', { month: 'short' });
          const endMonth = new Date(endDate).toLocaleString('default', { month: 'short' });
    
          const startColor = getMonthColor(startMonth);
          const endColor = getMonthColor(endMonth);
    
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <LinkStyled href="#" onClick={() => { props.setSelectedWeek(row.week_range); props.setScreen(1); }}>
                  <Typography component="span" sx={{ color: startColor }}>
                    {formatDate(startDate)}
                  </Typography>
                  {' to '}
                  <Typography component="span" sx={{ color: endColor }}>
                    {formatDate(endDate)}
                  </Typography>
                </LinkStyled>
              </Box>
            </Box>
          );
        }
      },
        ...columns
    ]

    const columnsInHouse = [
      {
        flex: 0.2,
        minWidth: 230,
        field: 'week_range',
        headerName: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ mr: 1, color: '#4682B4' }} /> {/* Set icon color here */}
            <Typography variant="body1">Week Range</Typography>
          </Box>
        ),
        renderCell: ({ row }) => {
          if(row.week_range) {
            const [startDate, endDate] = row.week_range.split(' to ');
    
            // Get month name for color
            const startMonth = new Date(startDate).toLocaleString('default', { month: 'short' });
            const endMonth = new Date(endDate).toLocaleString('default', { month: 'short' });
      
            const startColor = getMonthColor(startMonth);
            const endColor = getMonthColor(endMonth);
      
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <LinkStyled href="#" onClick={() => { props.setSelectedWeek(row.week_range); props.setScreen(2); }}>
                    <Typography component="span" sx={{ color: startColor }}>
                      {formatDate(startDate)}
                    </Typography>
                    {' to '}
                    <Typography component="span" sx={{ color: endColor }}>
                      {formatDate(endDate)}
                    </Typography>
                  </LinkStyled>
                </Box>
              </Box>
            );
          } else {
            return <span>Week range unavailable</span>
          }
          
        }
      },
        ...columns,
        {
          flex: 0.1,
          minWidth: 130,
          field: 'weekly_report',
          headerName: (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssessmentIcon sx={{ mr: 1, color: '#4CAF50' }} /> {/* Add icon with color */}
              <Typography variant="body1">Weekly Report</Typography>
            </Box>
          ),
          renderCell: ({ row }) => {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                  <IconButton onClick={() => { handleDateClick(row.week_range); }}>
                    <AssessmentIcon />
                  </IconButton>
                </Box>
              </Box>
            );
          }
        }
    ]


    const columnsBuy = [
      {
        flex: 0.2,
        minWidth: 230,
        field: 'week_range',
        headerName: (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DateRangeIcon sx={{ mr: 1, color: '#4682B4' }} /> {/* Set icon color here */}
            <Typography variant="body1">Week Range</Typography>
          </Box>
        ),
        renderCell: ({ row }) => {
          const [startDate, endDate] = row.week_range.split(' to ');
    
          // Get month name for color
          const startMonth = new Date(startDate).toLocaleString('default', { month: 'short' });
          const endMonth = new Date(endDate).toLocaleString('default', { month: 'short' });
    
          const startColor = getMonthColor(startMonth);
          const endColor = getMonthColor(endMonth);
    
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <LinkStyled href="#" onClick={() => { props.setSelectedWeek(row.week_range); props.setScreen(3); }}>
                  <Typography component="span" sx={{ color: startColor }}>
                    {formatDate(startDate)}
                  </Typography>
                  {' to '}
                  <Typography component="span" sx={{ color: endColor }}>
                    {formatDate(endDate)}
                  </Typography>
                </LinkStyled>
              </Box>
            </Box>
          );
        }
      },
        ...columns
    ]

    const getRowId = (row) => {
        return (
            row.id
        )
    }

      
    

    return (
        <>
            <Grid>
                <Card>
                    <CardHeader title='Labour Vendor Expenses' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
                        action={
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ mr: 4 }}>
                                        Total: 
                                        <Chip
                      label={CurrencyFormatter.format(totalLVendorSum)}
                      color="primary"
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: '1rem', height: 32 }}
                    />
                                    </Typography>
                                    <Button onClick={toggleAddVendorPayDrawer} variant='contained'>
                                        Pay
                                    </Button>
                                </Box>
                            </>
                        }
                    />

                    <Divider />
                    <DataGrid
                        loading={props.isLoading}
                        autoHeight
                        rows={props.expensesLVendor}
                        getRowId={getRowId}
                        columns={columnsLVendor}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        slots={{ toolbar: GridToolbar }}
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                    />
                </Card>

                <Card sx={{ mt: 6 }}>
                    <CardHeader title='In House Expenses' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
                        action={
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ mr: 4 }}>
                                        Total: 
                                        <Chip
                      label={CurrencyFormatter.format(totalInHouseSum)}
                      color="primary"
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: '1rem', height: 32 }}
                    />
                                    </Typography>
                                    <Button sx={{ mr: 2 }} onClick={toggleAddInHousePayDrawer} variant='contained'>
                                        Pay
                                    </Button>
                                </Box>
                            </>
                        }
                    />

                    <Divider />
                    <DataGrid
                        loading={props.isLoading}
                        autoHeight
                        rows={props.expensesInHouse}
                        getRowId={getRowId}
                        columns={columnsInHouse}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        slots={{ toolbar: GridToolbar }}
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                    />
                </Card>

                <Card sx={{ mt: 6 }}>
                    <CardHeader title='Purchase & Rent' sx={{ pb: 4, '& .MuiCardHeader-title': { letterSpacing: '.15px' } }}
                        action={
                            <>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ mr: 4 }}>
                                        Total: 
                                        <Chip
                      label={CurrencyFormatter.format(totalBuy)}
                      color="primary"
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: '1rem', height: 32 }}
                    />
                                    </Typography>
                                    <Button onClick={() => { props.setScreen(4) }} variant='contained'>
                                        Buy
                                    </Button>
                                </Box>
                            </>
                        }
                    />

                    <Divider />
                    <DataGrid
                        loading={props.isLoading}
                        autoHeight
                        rows={props.expensesBuy}
                        getRowId={getRowId}
                        columns={columnsBuy}
                        pageSizeOptions={[10, 25, 50]}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        slots={{ toolbar: GridToolbar }}
                        sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
                    />
                </Card>
            </Grid>

            <AddInHousePaySide
                open={addInHousePayOpen}
                toggle={toggleAddInHousePayDrawer}
                fetchExpensesInHouse={props.fetchExpensesInHouse}
            />

            <AddVendorPaySide
                open={addVendorPayOpen}
                toggle={toggleAddVendorPayDrawer}
                fetchExpensesVendor={props.fetchExpensesVendor}
            />

        <Modal
            open={showPopup}
            onClose={handleClosePopup}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '85%', bgcolor: 'background.paper', borderRadius: '8px', boxShadow: 24, p: 4 }}>

              <div>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <h1>Weekly Report - </h1>
                  <h1>{selectedWeek}</h1>
                </div>
                <TableWithSum data={dataArray} />
              </div>

              
            </Box>
          </Modal>

        </>
    )
}

export default WagesTable;