// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Styled Avatar component
const Avatar = styled(CustomAvatar)(({ theme }) => ({
    width: 40,
    height: 40,
    marginRight: theme.spacing(4)
}))

const CardStatsHorizontal = props => {
    return (
        <Card>
            <CardContent sx={{ py: theme => `${theme.spacing(4.125)} !important` }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar skin='light' color={props.color} variant='rounded'>
                        {props.icon}
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant='h6'>{props.stats}</Typography>
                        <Typography variant='caption'>{props.title}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

export default CardStatsHorizontal
