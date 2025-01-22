import React, { useContext, useState } from "react";
import { AuthContext, AxiosPost } from "src/context/AuthContext";
import { useEffect } from "react";
import ReactDataGrid from '@inovua/reactdatagrid-community'
import '@inovua/reactdatagrid-community/index.css'
import { Avatar, Badge, Button, Fab, IconButton, Typography } from "@mui/material"
import moment from "moment";
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import toast from "react-hot-toast";
import { Box } from "@mui/system";
import Icon from 'src/@core/components/icon'


function OrganisationsTable(props) {
    const [isLoading, setIsLoading] = useState(false);
    const gridStyle = { height: '60vh', marginTop: 10 };
    const [gridRef, setGridRef] = useState(null)
    const { user, setUser } = useContext(AuthContext)
    window.moment = moment

    const filterValue = [
        { name: 'org_name', operator: 'contains', type: 'string', value: '' },
        { name: 'org_owner_username', operator: 'contains', type: 'string', value: '' },
    ];

    const columns = [
        { name: 'org_name', header: 'Name', minWidth: 200 },
        {
            name: 'org_owner_username', header: 'Owner', minWidth: 200,
            render: ({ value }) =>
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Badge overlap='circular'>
                            <Avatar src={'https://ui-avatars.com/api/?name=' + value + '&background=random'} sx={{ width: '1.8rem', height: '1.8rem' }} />
                        </Badge>
                        <Box sx={{ display: 'flex', ml: 1, alignItems: 'flex-start', flexDirection: 'column' }}>
                            <Typography>{value}</Typography>
                        </Box>
                    </Box>
                </>
        },
        {
            name: 'id', defaultFlex: 2, header: 'Actions', minWidth: 200,
            render: ({ value }) =>
                <IconButton aria-label='capture screenshot' onClick={() => selectOrg(value)} color="primary">
                    <Icon icon='mdi:send' />
                </IconButton>
        },
    ];

    const selectOrg = (value) => {
        console.log(value)
        window.localStorage.setItem("userData", JSON.stringify({ ...user, orgId: value }))
        setUser({ ...user, orgId: value })
    }

    const exportCSV = () => {
        const columns = gridRef.current.visibleColumns;

        const header = columns.map((c) => c.name).join(',');
        const rows = gridRef.current.data.map((data) => columns.map((c) => data[c.id]).join(','));

        const contents = [header].concat(rows).join('\n');
        const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });

        downloadBlob(blob);
    };

    const downloadBlob = (blob, fileName = 'Organisations.csv') => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.position = 'absolute';
        link.style.visibility = 'hidden';

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
    };

    useEffect(() => {
        props.fetchOrganisations()
    }, [])


    const headerActions = <>
        <Fab color='primary' aria-label='add' size='small' onClick={props.fetchOrganisations}>
            <Icon icon='mdi:cached' />
        </Fab>
        <Fab sx={{ marginLeft: "10px" }} color='primary' aria-label='add' size='small' onClick={exportCSV}>
            <Icon icon='mdi:download' />
        </Fab>
    </>

    return (
        <Card>
            <CardHeader title='Organisations' action={headerActions}>
            </CardHeader>
            <CardContent>
                <div>

                    {
                        isLoading || props.Organisations == null || props.isLoading ?
                            <ReactDataGrid
                                idProperty="id"
                                style={gridStyle}
                                columns={columns}
                                pagination="local"
                                dataSource={[]}
                                defaultLimit={10}
                                defaultFilterValue={filterValue}
                                loading={true}
                            /> :
                            <>
                                <ReactDataGrid
                                    idProperty="id"
                                    style={gridStyle}
                                    columns={columns}
                                    pagination="local"
                                    dataSource={props.Organisations}
                                    defaultLimit={25}
                                    defaultFilterValue={filterValue}
                                    handle={setGridRef}
                                />
                            </>
                    }
                </div>
            </CardContent>
        </Card>
    );
}
export default OrganisationsTable;