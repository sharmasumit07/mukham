import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Grid,
    TextField,
    MenuItem,
    Select,
    Button,
    InputLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    Switch,
    Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useState, useEffect, useContext } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import { AuthContext, AxiosPost } from 'src/context/AuthContext';
import toast from 'react-hot-toast';

const schema = yup.object().shape({
    task_name: yup.string().required('Task name is required'),
    task_description: yup.string(),
    start_date: yup.date().required('Start date is required'),
    end_date: yup.date().min(yup.ref('start_date'), "End date can't be before start date"),
    status: yup.string().required('Status is required'),
    uom: yup.string()
});


const AddTaskDialog = ({ open, onClose, fetchTasks, tasks, parentTaskId }) => {
    const { user, selectedSite } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [unitOptions, setUnitOptions] = useState([]);
    const [measurement, setMeasurement] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('');
    const [selectedUom, setSelectedUom] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [workerType, setWorkerType] = useState('');
    const [checked, setChecked] = useState(false);

    const defaultFormValue = {
        length: '',
        breadth: '',
        whd: '',
        diameter: '',
        weight: '',
        total_uom: '',
        rate_per_uom: '',
        total_price: '',
    };
    const [formData, setFormData] = useState(defaultFormValue);

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

    const calculateTotalPrice = (total_uom, rate_per_uom) => {
        return total_uom * rate_per_uom || 0;
    };


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

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            task_name: '',
            parent_task_id: parentTaskId || '',
            task_description: '',
            start_date: '',
            end_date: '',
            status: 'Yet to Start',
            uom: '',
        }
    });

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

    const onSubmit = async (data) => {
        setIsLoading(true);
        console.log(data);
        console.log(formData);

        try {
            const response = await AxiosPost('addTaskNew.php', {
                ...data, 
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
                handleDialogClose();
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

    const handleDialogClose = () => {
        onClose();
        reset();
        setFormData(defaultFormValue);
    };

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

    const getIndentedName = (task) => {
        const indent = '\u00A0\u00A0'.repeat(task.depth); // Non-breaking spaces for indentation
        return `${indent}${task.task_name}`;
    };

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

    useEffect(() => {
        setValue('parent_task_id', parentTaskId || '');
    }, [parentTaskId, setValue]);

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                <Typography variant='h6'>Add New Task</Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} sx={{ mb: 5 }}>
                            <Controller
                                name='task_name'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        size='small'
                                        label='Task Name'
                                        fullWidth
                                        error={Boolean(errors.task_name)}
                                        helperText={errors.task_name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ mb: 5 }}>
                            <Controller
                                name='task_description'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        size='small'
                                        label='Task Description'
                                        rows={3}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>

                    {/* Second Row: Worker Type and Parent Task */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} sx={{ mb: 5 }}>
                            <FormControl fullWidth>
                                <InputLabel size="small" id='worker-type-label'>Worker Type</InputLabel>
                                <Select
                                    size="small"
                                    labelId='worker-type-label'
                                    value={workerType}
                                    onChange={(e) => setWorkerType(e.target.value)}
                                    label='Worker Type'
                                >
                                    <MenuItem value="In-House">In-House</MenuItem>
                                    <MenuItem value="Vendor's Worker">Vendor's Worker</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {workerType === "Vendor's Worker" && (
                            <Grid item xs={12} md={6} sx={{ mb: 5 }}>
                                <FormControl fullWidth>
                                    <InputLabel size="small" id='vendor-name-label'>Vendor Name</InputLabel>
                                    <Select
                                        size="small"
                                        labelId='vendor-name-label'
                                        value={selectedVendor}
                                        onChange={(e) => setSelectedVendor(e.target.value)}
                                    >
                                        {vendorOptions.map(vendor => (
                                            <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                                                {vendor.vendor_name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12} md={6} sx={{ mb: 3 }}>
                            <FormControl fullWidth>
                                <Controller
                                    name='parent_task_id'
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <InputLabel size='small' id='parent-task-select-label'>Parent Task</InputLabel>
                                            <Select
                                                {...field}
                                                size='small'
                                                value={parentTaskId}
                                                labelId='parent-task-select-label'
                                                label='Parent Task'
                                                readOnly
                                            >
                                                <MenuItem value=''>None</MenuItem>
                                                {renderTaskOptions(tasks)}
                                            </Select>
                                        </>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        
                    </Grid>

                    {/* Third Row: Date and Status */}
                    <Grid container spacing={2}>
                        <Grid item xs={6} sx={{ mb: 5 }}>
                            <Controller
                                name='start_date'
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='date'
                                        size='small'
                                        label='Start Date'
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(errors.start_date)}
                                        helperText={errors.start_date?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6} sx={{ mb: 5 }}>
                            <Controller
                                name='end_date'
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        type='date'
                                        size='small'
                                        label='End Date'
                                        InputLabelProps={{ shrink: true }}
                                        error={Boolean(errors.end_date)}
                                        helperText={errors.end_date?.message}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>


                    <Grid container spacing={2}>
                        <Grid item xs={6} sx={{ mb: 5 }}>
                            <FormControl fullWidth>
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
                        </Grid>

                        <Grid item xs={6} sx={{ mb: 5 }}>
                            <FormControl fullWidth>
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
                        </Grid>

                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 5 }}>
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

                    <Grid container spacing={2} sx={{ mb: 5 }}>
                        <Grid item xs={6}>
                            <TextField
                                label="Total UOM"
                                name="total_uom"
                                size="small"
                                value={formData.total_uom}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Rate per UOM"
                                name="rate_per_uom"
                                size="small"
                                value={formData.rate_per_uom}
                                onChange={handleInputChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} >
                            <TextField
                                label="Total Price"
                                name="total_price"
                                size='small'
                                value={formData.total_price}
                                InputProps={{
                                    readOnly: true,
                                }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleDialogClose} color='secondary' variant='outlined'>
                    Cancel
                </Button>
                <LoadingButton
                    type='submit'
                    variant='contained'
                    loading={isLoading}
                    onClick={handleSubmit(onSubmit)}
                >
                    Add Task
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default AddTaskDialog;
