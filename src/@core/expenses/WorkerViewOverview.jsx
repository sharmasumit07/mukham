// ** MUI Imports
import * as React from 'react';
import { useTheme } from '@mui/material/styles';

import { AuthContext, AxiosPost } from 'src/context/AuthContext';

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
// import DateCalendarServerRequest from './CalendarMonth';


import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'



// ** Demo Component Imports
// import UsersInvoiceListTable from './UsersInvoiceListTable.jsx'
// import UsersProjectListTable from './UsersProjectListTable.jsx'

// Styled Timeline component
const Timeline = styled(MuiTimeline)(({ theme }) => ({
  margin: 0,
  padding: 0,
  marginLeft: theme.spacing(0.75),
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none'
    },
    '&:last-child': {
      minHeight: 60
    }
  }
}))


const UserViewOverview = ({ selectedWorker, invoiceData }) => {

  const theme = useTheme();


  const [isLoading, setIsLoading] = React.useState(false);
  const [expenses, setExpenses] = React.useState([]);
  const { user } = React.useContext(AuthContext);
  const handleDatesSet = (eventInfo) => {
    const newDate = eventInfo.view.currentStart;
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1; 

    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    console.log("DATE FORMAT", formattedDate);

    fetchMonthlyExpense(formattedDate);
  };

  const fetchMonthlyExpense = async (date) => {
    setIsLoading(true);
    const worker_id = selectedWorker;
    try {
      const data = await AxiosPost('fetchMonthlyEmployeeExpenses.php', {
        orgId: user.orgId,
        date: date,
        worker_id: worker_id
      });
      
      if (data.success) {
        setExpenses(data.monthly_expenses);
        console.log("Fetched Expenses ", data.monthly_expenses);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server Error!");
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  const getBackgroundColor = (paymentReason) => {
    switch (paymentReason.toLowerCase()) {
      case 'advance':
        return '#FA2A55'; // Use theme for red color
      case 'salary':
        return '#5DE138'; // Use theme for green color
      case 'purchase':
        return theme.palette.primary.main;
      case 'rent':
        return '#FA8128'; // Use theme's primary or default to skyblue
      case 'overtime':
        return 'blue'
      default:
        return theme.palette.common.white; // Default to white
      // Default to white
    }
  };

  const events = expenses.map((expense) => ({
    title: ` Rs. ${expense.amount}`,
    date: expense.activity_date,
    backgroundColor: getBackgroundColor(expense.payment_reason),
    borderColor: 'transparent',
    borderWidth: 0,
    margin: 4,
  }));

  const eventClassNames = {
    event: 'custom-event' 
  };



  
  return (
      
      <Grid item xs={11} sx={{ marginLeft: '25px' }}>
        <Grid item xs={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ backgroundColor: '#FA2A55', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Advance</span>
              <span style={{ marginLeft: 20, backgroundColor: '#5DE138', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Salary</span>
              <span style={{ marginLeft: 20, backgroundColor: 'blue', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Overtime</span>
              {/* <span style={{ marginLeft: 20, backgroundColor: theme.palette.primary.main, width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Purchase</span>
              <span style={{ marginLeft: 20, backgroundColor: '#FA8128', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Rent</span> */}
            </div>
          </Grid>
        {/* <DateCalendarServerRequest selectedWorker={selectedWorker}/> */}
        <FullCalendar
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        weekends={true}
        events={events}
        datesSet={handleDatesSet}
        eventClassNames={eventClassNames}
      />
      </Grid>

   
  )
}

export default UserViewOverview;
