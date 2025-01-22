import { TreeItem, TreeView } from "@mui/lab";
import { Button, Card, CardContent, CardHeader, Typography, styled, Box, Chip,Paper } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext, AxiosPost } from "src/context/AuthContext";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from "next/link";

const BuyExpensesWeek = (props) => {

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


    const columns = [
        // {
        //     flex: 0.15,
        //     minWidth: 200,
        //     type: 'text',
        //     field: 'name',
        //     headerName: 'Worker Name',
        //     renderCell: ({ row }) => {
        //         // console.log(row);
        //         return (
        //             <Typography noWrap variant='body'>
        //                 <LinkStyled href="#" onClick={() => { props.setSelectedWorker(row.worker_id); 
        //                 // console.log(props.SelectedWorker)
        //                 }}>{row.name}</LinkStyled>
        //                 {/* {row.name} */}
        //             </Typography>
        //         )
        //     }
        // },
        {
            flex: 0.15,
            minWidth: 150,
            field: 'role',
            headerName: 'Role',
            renderCell: ({ row }) => {
                return (
                    <Typography noWrap variant='body'>
                        {row.role}
                    </Typography>
                )
            }
        },

        {
            flex: 0.15,
            minWidth: 170,
            sortable: false,
            field: 'status',
            headerName: 'Payment Reason',
            renderCell: ({ row }) => {

                return (
                    <Typography noWrap variant='body' sx={{ color: row.payment_reason == "Advance" ? "red" : "green" }}>
                        {row.payment_reason}
                    </Typography>
                )
            }
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
            flex: 0.15,
            minWidth: 170,
            sortable: false,
            field: 'amount',
            headerName: 'Amount',

            renderCell: ({ row }) => {
                const formattedPrice = CurrencyFormatter.format(row.amount);
                // console.log(row);
                return (
                    <Typography noWrap variant='body'>
                        {/* {row.status} */}
                        {formattedPrice}
                    </Typography>
                )
            }
        },
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
    const CurrencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    });
    const fetchBuyExpWeek = async () => {
        setIsLoading(true);
        console.log(":working");
        try {
            const data = await AxiosPost('fetchBuyExpWeek.php', { orgId: user.orgId, site_id: selectedSite, dateRange: props.selectedWeek })

            if (data.success) {
                setWeekExp(data.expWeekBuy)
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

    useEffect(() => { fetchBuyExpWeek() }, [])

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
        title={`Purchase & Rent: ${props.selectedWeek}`}
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

export default BuyExpensesWeek;