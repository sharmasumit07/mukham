import React, { useState, useContext, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    FormHelperText,
    IconButton,
    Grid,
    FormGroup,
    FormControlLabel,
    Switch
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Icon from 'src/@core/components/icon';
import { styled, alpha } from '@mui/material/styles';
import { AuthContext, AxiosPost } from 'src/context/AuthContext';
import toast from 'react-hot-toast';
import SidebarAddVendor from '../site-attendance/AddNewVendor';
import AddMaterialDrawer from '../purchaseOrders/AddMaterialDrawer';

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(3, 4),
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.default
}));

const CustomSelectItem = styled(MenuItem)(({ theme }) => ({
    color: theme.palette.success.main,
    backgroundColor: 'transparent !important',
    '&:hover': { backgroundColor: `${alpha(theme.palette.success.main, 0.1)} !important` }
}))


const schema = yup.object().shape({
    task_name: yup.string().required('Task name is required'),
    task_description: yup.string(),
    parent_task_id: yup.string(),
    start_date: yup.date().required('Start date is required'),
    end_date: yup.date().min(yup.ref('start_date'), "End date can't be before start date"),
    status: yup.string().required('Status is required'),
    uom: yup.string()
});

const AddTaskDrawer = ({ open, toggle, fetchTasks, tasks }) => {
    const { user, selectedSite } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [unitOptions, setUnitOptions] = useState([]);
    const [measurement, setMeasurement] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [selectedUom, setSelectedUom] = useState('');
    const [addMaterialOpen, setAddMaterialOpen] = useState(false);
    const toggleAddMaterialDrawer = () => setAddMaterialOpen(!addMaterialOpen);

    const handleAddNewMaterial = () => {
        toggleAddMaterialDrawer()
    }

    // Default values for the form fields
    const defaultFormValue = {
        length: '',
        breadth: '',
        whd: '',
        diameter: '',
        weight: '',
        total_uom: '',
        rate_per_uom: '',
        total_price: ''
    };

    // State for the form data
    const [formData, setFormData] = useState(defaultFormValue);

    const [items, setItems] = useState([{ item_name: '', item_type: '', unit_of_measurement: '' }])

    const onChangeHandler = (e) => {
        const unit = e.target.value;

        let uomValue = '';
        let measurementValue = '';

        if (unit === 'm' || unit === 'feet') {
            uomValue = 'Running Uom';
            measurementValue = 'Running Measurement';
        } else if (unit === 'sq.m' || unit === 'sq.ft') {
            uomValue = 'Square Uom';
            measurementValue = 'Square Measurement';
        } else if (unit === 'cubic m' || unit === 'cubic feet') {
            uomValue = 'Cubic Uom';
            measurementValue = 'Cubic Measurement';
        }

        setSelectedUnit(unit);
        setSelectedUom(uomValue);
        setMeasurement(measurementValue);
    };

    const onChangeHandlerUom = (e) => {
        setSelectedUom(e.target.value);
        setMeasurement(e.target.value);
    };

    const calculateTotalPrice = (total_uom, rate_per_uom) => {
        return total_uom * rate_per_uom || 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => {
            const updatedFormData = {
                ...prevState,
                [name]: value
            };

            if (name !== 'total_uom') {
                updatedFormData.total_uom = calculateTotal(updatedFormData);
            }

            updatedFormData.total_price = calculateTotalPrice(updatedFormData.total_uom, updatedFormData.rate_per_uom);

            return updatedFormData;
        });
    };

    const calculateTotal = (data) => {
        if (selectedUnit === 'cubic m' || selectedUnit === 'cubic feet') {
            return data.length * data.breadth * data.whd || 0;
        } else if (selectedUnit === 'sq.m' || selectedUnit === 'sq.ft') {
            return data.length * data.breadth || 0;
        } else if (selectedUnit === 'm' || selectedUnit === 'feet') {
            return data.length || 0;
        } else {
            return '';
        }
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            task_name: '',
            task_description: '',
            parent_task_id: '',
            start_date: '',
            end_date: '',
            status: 'Yet to Start',
            uom: '',
        }
    });

    const fetchUnitOptions = async () => {
        try {
            const data = await AxiosPost('fetchUnitOptions.php', { orgId: user.orgId });
            if (data.success) {
                setUnitOptions(data.unitOptions);
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

    useEffect(() => {
        fetchUnitOptions();
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log(data);
        console.log(formData);

        try {
            const response = await AxiosPost('addTaskNew.php', {
                ...data, // Form data
                orgId: user.orgId,
                unit: selectedUnit,
                uom: selectedUom,
                measurement: measurement,
                site_id: selectedSite,
                ...formData,
                vendor_id: selectedVendor,
            });

            console.log(response);

            if (response.success) {
                toast.success("Task added successfully");
                await fetchTasks();
                handleDrawerClose();
            } else {
                toast.error(response.error);
            }
        } catch (err) {
            toast.error("Server Error!");
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrawerClose = () => {
        toggle();
        reset();
        // Reset the formData to default values
        setFormData(defaultFormValue);
    };

    const [checked, setChecked] = useState(false);

    const handleChange = (event) => {
        setChecked(event.target.checked);
    };

    const getIndentedName = (task) => {
        const indent = '\u00A0\u00A0'.repeat(task.depth); // Non-breaking spaces for indentation
        return `${indent}${task.task_name}`;
    };

    // Function to recursively render task options
    const renderTaskOptions = (tasks) => {
        return tasks.map((task) => (
            <MenuItem
                key={task.task_id}
                value={task.task_id}
                sx={{
                    pl: `${task.depth * 2}+0.1rem`,
                    backgroundColor: task.depth === 0 ? '#e0e0e0' : 'transparent',
                    fontWeight: task.depth === 0 ? 'bold' : 'normal'
                }}
            >
                {getIndentedName({ ...task })}
            </MenuItem>
        ));
    };

    const [selectedVendor, setSelectedVendor] = useState('');

    const onVendorChangeHandler = (e) => {
        setSelectedVendor(e.target.value);
    }

    const [workerType, setWorkerType] = useState('')

    const onChangeHandlerWorkerType = (e) => {
        setWorkerType(e.target.value);
    }

    const [vendorOptions, setVendorOptions] = useState([])

    const fetchVendorOptions = async () => {
        setIsLoading(true);
        try {
            const data = await AxiosPost('fetchVendorOptions.php', { org_id: user.orgId })
            if (data.success) {
                setVendorOptions(data.options)
            }
            else toast.error(data.error)
        } catch (err) {
            console.log(err)
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchVendorOptions()
    }, [])


    const [addVendorOpen, setaddVendorOpen] = useState(false);
    const toggleAddVendorDrawer = () => setaddVendorOpen(!addVendorOpen);

    // console.log(formData);

    const onChangeHandlerMaterial = (e) => {
        const materialId = e.target.value;
        const material = materials.find(mat => mat.material_id === materialId);
        if (material) {
            setItems(prevState => {
                const newArray = [...prevState];
                newArray[i] = { ...newArray[i], [e.target.name]: material.material_name, unit_of_measurement: material.unit_of_measurement, item_type: material.material_type }
                console.log(newArray)
                return newArray;
            });
        }
    }


    const [materials, setMaterials] = useState([])

    const fetchMaterials = async () => {
        try {
            const data = await AxiosPost('fetchMaterials.php')
            console.log(data)
            if (data.success) {
                setMaterials(data.materials)
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

    useEffect(() => { fetchMaterials() }, [])


    return (
        <>
            <Drawer
                open={open}
                anchor='right'
                variant='temporary'
                onClose={handleDrawerClose}
                ModalProps={{ keepMounted: true }}
                sx={{ '& .MuiDrawer-paper': { width: [600, 700] } }}
            >
                <Header>
                    <Typography variant='h6'>Add New Task</Typography>
                    <IconButton size='small' onClick={handleDrawerClose} sx={{ color: 'text.primary' }}>
                        <Icon icon='mdi:close' fontSize={20} />
                    </IconButton>
                </Header>
                <Box component='form' sx={{ p: 5 }} onSubmit={handleSubmit(onSubmit)}>
                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <Controller
                            name='task_name'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label='Task Name'
                                    error={Boolean(errors.task_name)}
                                    helperText={errors.task_name?.message}
                                />
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <Controller
                            name='task_description'
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label='Task Description'
                                    multiline
                                    rows={3}
                                />
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <InputLabel id='demo-simple-select-outlined-label'>Worker Type</InputLabel>
                        <Select
                            label='Worker Type'
                            defaultValue=''
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'
                            name='worker_type'
                            value={workerType}
                            onChange={onChangeHandlerWorkerType}
                        >
                            <MenuItem value="In-House">In-House</MenuItem>
                            <MenuItem value="Vendor's Worker">Vendor's Worker</MenuItem>
                        </Select>
                    </FormControl>

                    {workerType === `Vendor's Worker` && (
                        <FormControl fullWidth sx={{ mb: 6 }}>
                            <InputLabel id='demo-simple-select-outlined-label'>Vendor Name</InputLabel>
                            <Select
                                label='Vendor Name'
                                defaultValue=''
                                id='demo-simple-select-outlined'
                                labelId='demo-simple-select-outlined-label'
                                name='vendor_id'
                                value={selectedVendor}
                                onChange={onVendorChangeHandler}
                            >
                                <CustomSelectItem value='' onClick={toggleAddVendorDrawer}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                                        <Icon icon='mdi:plus' fontSize={20} />
                                        Add New Vendor
                                    </Box>
                                </CustomSelectItem>
                                {vendorOptions.map(vendor => <MenuItem value={vendor.vendor_id}>{vendor.vendor_name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <Controller
                            name='parent_task_id'
                            control={control}
                            render={({ field }) => (
                                <>
                                    <InputLabel id='parent-task-select-label'>Parent Task</InputLabel>
                                    <Select
                                        {...field}
                                        labelId='parent-task-select-label'
                                        label='Parent Task'
                                    >
                                        <MenuItem value=''>None</MenuItem>
                                        {renderTaskOptions(tasks)}
                                    </Select>
                                </>
                            )}
                        />
                    </FormControl>

                    <FormControl>
                        <InputLabel size='small' >Material</InputLabel>
                        <Select size='small' label='Material' required name='item_name' onChange={(e) => onChangeHandlerMaterial(e, i)} sx={{ mb: 4, width: '200px' }}>
                            <CustomSelectItem value='' onClick={handleAddNewMaterial}>
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', '& svg': { mr: 2 } }}>
                                    <Icon icon='mdi:plus' fontSize={20} />
                                    Add New Material
                                </Box>
                            </CustomSelectItem>
                            {materials !== undefined &&
                                materials.map(material => (
                                    <MenuItem key={material.vendor_id} value={material.material_id}>
                                        {material.material_name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item xs={6}>
                            <Controller
                                name='start_date'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='date'
                                        label='Start Date'
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(errors.start_date)}
                                        helperText={errors.start_date?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name='end_date'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='date'
                                        label='End Date'
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(errors.end_date)}
                                        helperText={errors.end_date?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <Controller
                            name='status'
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <>
                                    <InputLabel size="small" id='status-select-label'>Status</InputLabel>
                                    <Select
                                        {...field}
                                        labelId='status-select-label'
                                        label='Status'
                                        size="small"
                                        error={Boolean(errors.status)}
                                    >
                                        <MenuItem value='Yet to Start'>Yet To Start</MenuItem>
                                        <MenuItem value='In_progress'>In Progress</MenuItem>
                                        <MenuItem value='Completed'>Completed</MenuItem>
                                    </Select>
                                    {errors.status && (
                                        <FormHelperText sx={{ color: 'error.main' }}>
                                            {errors.status.message}
                                        </FormHelperText>
                                    )}
                                </>
                            )}
                        />
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <InputLabel size='small' id='unit-select-label'>Unit of Measurement</InputLabel>
                        <Select
                            label='Unit of Measurement'
                            size='small'
                            id="unit-select"
                            name='unit'
                            value={selectedUnit}
                            onChange={onChangeHandler}
                        >
                            {unitOptions && unitOptions.map((unit, index) => {
                                try {
                                    const unitValues = JSON.parse(unit.options_value);
                                    return unitValues.map((value, valueIndex) => (
                                        <MenuItem key={index + '-' + valueIndex} value={value}>
                                            {value}
                                        </MenuItem>
                                    ));
                                } catch (error) {
                                    console.error("Error parsing unit options:", error);
                                    return null;
                                }
                            })}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 6 }}>
                        <TextField
                            label='Measurements'
                            fullWidth
                            id='demo-simple-select-outlined'
                            labelId='demo-simple-select-outlined-label'
                            name='com'
                            size="small"
                            defaultValue="Measurements"
                            value={measurement}
                            onChange={onChangeHandlerUom}
                            InputProps={{
                                readOnly: true,
                            }}
                        >
                            {/* <MenuItem value="Running Uom">Running Uom</MenuItem>
										<MenuItem value="Square Uom">Square Uom</MenuItem>
										<MenuItem value="Cubic Uom">Cubic Uom</MenuItem> */}
                        </TextField>
                    </FormControl>

                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item md={6}>
                            <TextField
                                fullWidth
                                label="Length"
                                multiline
                                size='small'
                                type='number'
                                name="length"
                                value={formData.length}
                                onChange={handleInputChange}
                            />
                        </Grid>

                        {(selectedUom === 'Square Uom' || selectedUom === 'Cubic Uom') && (
                            <Grid item md={6}>
                                <TextField
                                    fullWidth
                                    label="Breadth"
                                    multiline
                                    size='small'
                                    type='number'
                                    name="breadth"
                                    value={formData.breadth}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        )}

                        {selectedUom === 'Cubic Uom' && (
                            <Grid item md={6}>
                                <TextField
                                    fullWidth
                                    label="Width/Height/Depth"
                                    multiline
                                    size='small'
                                    type='number'
                                    name="whd"
                                    value={formData.whd}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        )}
                    </Grid>

                    <FormGroup>
                        <FormControlLabel
                            control={<Switch checked={checked} onChange={handleChange} />}
                            label={checked ? 'Hide Diameter & Weight' : 'Show Diameter & Weight'}
                        />
                        {checked && (
                            <Grid container spacing={2} sx={{ mb: 6 }}>
                                <Grid item xs={6} lg={5} sm={12}>
                                    <TextField
                                        fullWidth
                                        name='diameter'
                                        label="Diameter"
                                        multiline
                                        size='small'
                                        value={formData.diameter}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                                <Grid item lg={5} sm={12}>
                                    <TextField
                                        fullWidth
                                        name='weight'
                                        label="Weight (Kg)"
                                        multiline
                                        size='small'
                                        value={formData.weight}
                                        onChange={handleInputChange}
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </FormGroup>

                    <Grid item md={6} sx={{ mb: 6, mt: 6 }}>
                        <TextField
                            fullWidth
                            size='small'
                            name='total_uom'
                            label='Total UOM'
                            onChange={handleInputChange}
                            value={formData.total_uom}
                        // Now the user can edit this field
                        />
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 6 }}>
                        <Grid item md={6}>
                            <TextField
                                fullWidth
                                label="Rate per UOM"
                                multiline
                                size='small'
                                type='number'
                                name="rate_per_uom"
                                value={formData.rate_per_uom}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item md={6}>
                            <TextField
                                fullWidth
                                label="Total Price"
                                multiline
                                size='small'
                                type='number'
                                name="total_price"
                                InputProps={{
                                    readOnly: true,
                                }}
                                value={formData.total_price}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            size='large'
                            variant='outlined'
                            color='secondary'
                            onClick={handleDrawerClose}
                            sx={{ mr: 3 }}
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            size='large'
                            type='submit'
                            variant='contained'
                            loading={isLoading}
                        >
                            Add Task
                        </LoadingButton>
                    </Box>
                </Box>
            </Drawer>

            <SidebarAddVendor openVendor={addVendorOpen} toggleVendor={toggleAddVendorDrawer} fetchVendorsOptions={fetchVendorOptions} />

            <AddMaterialDrawer open={addMaterialOpen} toggle={toggleAddMaterialDrawer} fetchMaterials={fetchMaterials} />
        </>
    );
};

export default AddTaskDrawer;