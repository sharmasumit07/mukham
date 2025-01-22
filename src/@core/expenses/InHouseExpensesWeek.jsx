import React, { useContext, useEffect, useState } from 'react';
import { TreeItem, TreeView } from "@mui/lab";
import { Button, Card, CardContent, CardHeader, Typography, Box, Chip, Skeleton, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-hot-toast";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { AuthContext, AxiosPost } from "src/context/AuthContext";

const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
});


const InHouseExpensesWeek = ({ selectedWeek, setScreen, setSelectedWorker }) => {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const { user, selectedSite } = useContext(AuthContext);
  const [weekExp, setWeekExp] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInHouseExpWeek = async () => {
      setIsLoading(true);
      try {
        const data = await AxiosPost('fetchInHouseExpWeek.php', { orgId: user.orgId, site_id: selectedSite, dateRange: selectedWeek });
        if (data.success) {
          setWeekExp(data.expWeekInHouse);
        } else {
          toast.error(data.error);
        }
      } catch (err) {
        toast.error("Server Error!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInHouseExpWeek();
  }, [user.orgId, selectedSite, selectedWeek]);

  const parseRecords = (recordsString) => {
    try {
      return JSON.parse(`[${recordsString}]`);
    } catch (error) {
      console.error("Error parsing records:", error);
      return [];
    }
  };

  const columns = [
    {
      flex: 0.2,
      minWidth: 200,
      field: 'name',
      headerName: 'Worker Name',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography
            variant="body"
            sx={{
              cursor: 'pointer',
              color: 'primary.main',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => setSelectedWorker(row.worker_id)}
          >
            {row.name}
          </Typography>
        </Box>
      )
    },
    {
      flex: 0.15,
      minWidth: 150,
      field: 'role',
      headerName: 'Role',
      renderCell: ({ row }) => (
        <Typography variant="body">
          {row.worker_id === null ? row.buy_worker_role : row.role}
        </Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 170,
      field: 'status',
      headerName: 'Payment Reason',
      renderCell: ({ row }) => (
        <Chip
          icon={<CreditCardIcon fontSize="small" />}
          label={row.payment_reason}
          color={row.status === "Advance" ? "warning" : "default"}
          size="small"
          variant="outlined"
        />
      )
    },
    {
      flex: 0.25,
      minWidth: 200,
      field: 'description',
      headerName: 'Expense Description',
      renderCell: ({ row }) => (
        <Typography variant="body">{row.expense_description}</Typography>
      )
    },
    {
      flex: 0.2,
      minWidth: 170,
      field: 'amount',
      headerName: 'Amount',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <AttachMoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} /> */}
          <Typography variant="body" fontWeight="medium">
            {CurrencyFormatter.format(row.amount)}
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <CardHeader
        title={`In House Expenses: ${selectedWeek}`}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => setScreen(0)}
          >
            Back
          </Button>
        }
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      />
      <CardContent>
        {isLoading ? (
          <Skeleton variant="rectangular" height={400} />
        ) : (
          <TreeView
            aria-label="expenses navigator"
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            sx={{ height: 640, maxWidth: '100%', overflowY: 'auto' }}
          >
            {weekExp.map((dayData) => (
              <TreeItem
                key={dayData.date}
                nodeId={dayData.date}
                label={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, px: 2 }}>
                    <Typography variant="h7" sx={{ fontWeight: 'medium' }}>{dayData.date}</Typography>
                    <Chip
                      label={CurrencyFormatter.format(dayData.amount)}
                      color="primary"
                      size="medium"
                      variant="outlined"
                      sx={{ fontSize: '1rem', height: 32 }}
                    />
                  </Box>
                }
                sx={{
                  '& .MuiTreeItem-content': {
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                  '& .Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mt: 1, mb: 2 }}>
                  <DataGrid
                    autoHeight
                    rows={parseRecords(dayData.records)}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    getRowId={(row) => row.expense_id}
                    disableColumnMenu
                    disableColumnFilter
                    disableDensitySelector
                    disableColumnSelector
                    sx={{ border: 'none' }}
                  />
                </Paper>
              </TreeItem>
            ))}
          </TreeView>
        )}
      </CardContent>
    </Card>
  );
};

export default InHouseExpensesWeek;