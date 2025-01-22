import { TreeItem, TreeView } from "@mui/lab";
import { Button, Card, CardContent, CardHeader, Typography, styled, Box, Chip,Paper } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext, AxiosPost } from "src/context/AuthContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import Link from "next/link";

const LVendorExpensesWeek = (props) => {

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

    const { user, selectedSite } = useContext(AuthContext);

    const [weekExp, setWeekExp] = useState();

    const [isLoading, setIsLoading] = useState(false);

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

    const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    });

    const columns = [
        {
            flex: 0.15,
            minWidth: 200,
            type: 'text',
            field: 'name',
            headerName: 'Worker / Vendor',
            renderCell: ({ row }) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    {row.worker_id === 0 ? (
                        <Typography noWrap variant='body'>
                            {row.vendor_name}
                        </Typography>
                    ) : (
                        <Typography noWrap variant='body'>
                            <LinkStyled href="#" onClick={() => {
                                props.setSelectedWorker(row.worker_id);
                            }}>
                                {row.name}
                            </LinkStyled>
                        </Typography>
                    )}
                </Box>
            )
        },
        
        {
            flex: 0.15,
            minWidth: 150,
            field: 'role',
            headerName: 'Role',
            renderCell: ({ row }) => {
                if (row.worker_id === 0) {
                    return (
                        <Typography noWrap variant='body'>
                            Vendor
                        </Typography>
                    )
                } else {
                    return (
                        <Typography noWrap variant='body'>
                            {row.role}
                        </Typography>
                    )
                }
            }
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
            flex: 0.2,
            minWidth: 200,
            sortable: false,
            field: 'description',
            headerName: 'Expense Description',
            renderCell: ({ row }) => {

                return (
                    <Typography noWrap variant='body' >
                        {row.expense_description}
                    </Typography>
                )
            }
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
        // {
        //     flex: 0.1,
        //     minWidth: 90,
        //     sortable: false,
        //     field: 'worker_id',
        //     headerName: 'Actions',
        //     renderCell: ({ row }) => {
        //         return (
        //             <RowOptionsWorkers id={row.worker_id} setSelectedWorker={props.setSelectedWorker} />
        //         )
        //     }
        // }


    ]

    const fetchLVendorExpWeek = async () => {
        setIsLoading(true);
        console.log(":working");
        try {
            const data = await AxiosPost('fetchLVendorExpWeek.php', { orgId: user.orgId, site_id: selectedSite, dateRange: props.selectedWeek })

            if (data.success) {
                setWeekExp(data.expWeekLVendor)
                // console.log("Fetched Expenses ",expenses)
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

    useEffect(() => { fetchLVendorExpWeek() }, [])

    const parseRecords = (recordsString) => {
        try {
            return JSON.parse(`[${recordsString}]`);
        } catch (error) {
            console.error("Error parsing records:", error);
            return [];
        }
    };

    const treeItems = weekExp ? weekExp.map((dayData) => (
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
            
    )) : null;

    return (
        <>
            {/* <Button size='small' color='secondary' sx={{ m: 3, mb: 3 }} variant="contained" onClick={() => props.setScreen(0)}>
                Go back
            </Button> */}
            <Card elevation={0} sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <CardHeader
        title={`Labour Vendor Expenses: ${props.selectedWeek}`}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={() => props.setScreen(0)}
          >
            Back
          </Button>
        }
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      />
                <CardContent>
                    <TreeView
                        aria-label="file system navigator"
                        defaultCollapseIcon={<ExpandMoreIcon />}
                        defaultExpandIcon={<ChevronRightIcon />}
                        sx={{ height: 640, flexGrow: 1, maxWidth: '100%', overflowY: 'auto' }}
                    >
                        {treeItems}
                    </TreeView>
                </CardContent>
            </Card>

        </>
    )
}

export default LVendorExpensesWeek;