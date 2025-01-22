import FullCalendar from "@fullcalendar/react";
import { Card, CardContent, Grid, useTheme } from "@mui/material";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from "@fullcalendar/interaction";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext, AxiosPost } from "src/context/AuthContext";



const SiteEngineerCalendar = (props) => {

    const [expenses, setExpenses] = useState([]);
    const theme = useTheme();
    const { user } = useContext(AuthContext)

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
          case '':
            return 'skyblue'
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

      const handleDatesSet = (eventInfo) => {
        const newDate = eventInfo.view.currentStart;
        const year = newDate.getFullYear();
        const month = newDate.getMonth() + 1;
    
        const formattedDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        // console.log("DATE FORMAT", formattedDate);
    
        fetchMonthlySiteExpenses(formattedDate);
      };

      // const handleDateClick = (arg) => {
      //   const clickedDate = new Date(arg.date);
      //   if (clickedDate.getDay() === 6) {
      //     setShowPopup(true);
      //     setSelectedDate(clickedDate);
      //     fetchWeeklySiteExpense(clickedDate);
      //   }
      // };
    


      const [isLoading, setIsLoading] = useState(false);

      const fetchMonthlySiteExpenses = async (date) => {
        setIsLoading(true);
        const site_id = props.site;
        try {
          const data = await AxiosPost('fetchMonthlySiteExpenses.php', {
            orgId: user.orgId,
            date: date,
            site_id: site_id
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


      // const pivotExpensesData = () => {
      //   // Create an object to store the pivoted data
      //   const pivotedData = {};
    
      //   // Create a counter for generating unique IDs
      //   let idCounter = 1;
    
      //   // Array to represent days of the week
      //   const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
      //   // Iterate over the fetched expenses
      //   expensesWeekly.forEach(expense => {
      //     // Extract worker name and details
      //     const { worker_name, details } = expense;
    
      //     // console.log("DETAILS", details)
    
      //     // Iterate over details to access activity_date and amount
      //     details.forEach(detail => {
      //       const { activity_date, amount } = detail;
    
    
      //       // Get the day of the week (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
      //       const dayOfWeekIndex = new Date(activity_date).getDay();
      //       const dayOfWeek = daysOfWeek[dayOfWeekIndex];
    
      //       // If the worker name doesn't exist in pivotedData, initialize it
      //       if (!pivotedData[worker_name]) {
      //         pivotedData[worker_name] = {
      //           id: idCounter++, // Assign a unique ID to the row
      //           worker_name,
      //           Sunday: '',
      //           Monday: '',
      //           Tuesday: '',
      //           Wednesday: '',
      //           Thursday: '',
      //           Friday: '',
      //           Saturday: ''
      //         };
      //       }
    
      //       // Concatenate the amount with '|' if there's already an amount for this day
      //       // Otherwise, set the amount for the day
      //       pivotedData[worker_name][dayOfWeek] += amount ? `${amount}\n  ` : '';
      //     });
      //   });
    
      //   // Convert the pivotedData object to an array of objects
      //   const formattedData = Object.values(pivotedData);
    
      //   return formattedData;
      // };

    return (
        <Card sx={{ mt: '20px' }}>
            <CardContent>
            <Grid item xs={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ backgroundColor: '#FA2A55', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Advance</span>
              <span style={{ marginLeft: 20, backgroundColor: '#5DE138', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Salary</span>
              <span style={{ marginLeft: 20, backgroundColor: 'blue', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Overtime</span>
              <span style={{ marginLeft: 20, backgroundColor: theme.palette.primary.main, width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Purchase</span>
              <span style={{ marginLeft: 20, backgroundColor: '#FA8128', width: 10, height: 10, borderRadius: '50%' }} />
              <span style={{ marginLeft: 5 }}>Rent</span>
            </div>
          </Grid>
                <FullCalendar
                plugins={[interactionPlugin, dayGridPlugin]}
                initialView="dayGridMonth"
                weekends={true}
                events={events}
                datesSet={handleDatesSet}
                />
            </CardContent>
        </Card>
        
    )
}

export default SiteEngineerCalendar;