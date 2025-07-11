// ** React Imports
import { Fragment, useEffect, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Button from '@mui/material/Button'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'

// Styled component for the upload image inside the dropzone area
const Img = styled('img')(({ theme }) => ({
    [theme.breakpoints.up('md')]: {
        marginRight: theme.spacing(10)
    },
    [theme.breakpoints.down('md')]: {
        marginBottom: theme.spacing(4)
    },
    [theme.breakpoints.down('sm')]: {
        width: 250
    }
}))

// Styled component for the heading inside the dropzone area
const HeadingTypography = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('sm')]: {
        marginBottom: theme.spacing(4)
    }
}))

const FileUploader = (props) => {
    // ** State
    const [files, setFiles] = useState([])

    useEffect(() => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files[]', file); // Assuming your server expects files in an array called 'files'
        });
        props.setAddData(formData)
    }, [files])

    // ** Hooks
    const { getRootProps, getInputProps } = useDropzone({
        maxFiles: 10,
        maxSize: 2000000,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif']
        },
        onDrop: acceptedFiles => {
            setFiles([...files, ...acceptedFiles.map(file => Object.assign(file))])
        },
        onDropRejected: () => {
            toast.error('You can only upload 2 files & maximum size of 2 MB.', {
                duration: 2000
            })
        }
    })

    const renderFilePreview = file => {
        if (file.type.startsWith('image')) {
            return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} />
        } else {
            return <Icon icon='mdi:file-document-outline' />
        }
    }

    const handleRemoveFile = file => {
        const uploadedFiles = files
        const filtered = uploadedFiles.filter(i => i.name !== file.name)
        setFiles([...filtered])
    }

    const fileList = files.map(file => (
        <ListItem key={file.name} sx={{ width: "fit-content" }}>
            <div className='file-details'>
                <div className='file-preview'>{renderFilePreview(file)}</div>
                <div>
                    <Typography className='file-name'>{file.name}</Typography>
                    <Typography className='file-size' variant='body2'>
                        {Math.round(file.size / 100) / 10 > 1000
                            ? <>{(Math.round(file.size / 100) / 10000).toFixed(1)} mb</>
                            : <>{(Math.round(file.size / 100) / 10).toFixed(1)} kb</>}
                    </Typography>
                </div>
            </div>
            <IconButton onClick={() => handleRemoveFile(file)}>
                <Icon icon='mdi:close' fontSize={20} />
            </IconButton>
        </ListItem>
    ))

    const handleRemoveAllFiles = () => {
        setFiles([])
    }

    return (
        <Fragment>
            <div {...getRootProps({ className: 'dropzone' })}>
                <input {...getInputProps()} />
                <Box sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center' }}>
                    <Img width={300} alt='Upload img' src="/images/upload.png" />
                    <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: ['center', 'center', 'inherit'] }}>
                        <HeadingTypography variant='h5'>Drop files here or click to upload.</HeadingTypography>
                        <Typography color='textSecondary'>Allowed *.jpeg, *.jpg, *.png, *.gif</Typography>
                        <Typography color='textSecondary'>Max 2 files and max size of 2 MB</Typography>
                    </Box>
                </Box>
            </div>
            {files.length ? (
                <Fragment sx={{ display: 'flex', flexDirection: ['column', 'column', 'row'], alignItems: 'center' }}>
                    <Box sx={{ display: 'flex' }}>{fileList}</Box>
                </Fragment>
            ) : null}
        </Fragment>
    )
}

export default FileUploader
