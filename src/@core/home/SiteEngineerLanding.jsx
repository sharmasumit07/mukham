import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import { AuthContext, AxiosPost } from "src/context/AuthContext";
// import SiteEngineerCalendar from "./SiteEngineerCalendar";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import SiteEngineerCalendar from "./SiteEngineerCalendar";


const SiteEngineerLanding = () => {
    const [siteOptions, setSiteOptions] = useState([])
    const { user, selectedSite, setSelectedSite } = useContext(AuthContext)
    const [isLoading, setIsLoading] = useState(false)
    const theme = useTheme();

    

    return (
        <><Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card elevation={3} sx={{ height: '100%' }}>
                    <CardContent>
                        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
                            <Avatar
                                sx={{
                                    width: 100,
                                    height: 100,
                                    mb: 2,
                                    bgcolor: theme.palette.primary.main
                                }}
                            >
                                {user.fullName.charAt(0)}
                            </Avatar>
                            <Typography variant="h5" gutterBottom>
                                {user.fullName}
                            </Typography>
                            <Chip
                                label={user.role}
                                color="primary"
                                size="small"
                                sx={{ mb: 2 }} />
                            <Box display="flex" alignItems="center" mb={1}>
                                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">{user.email}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center">
                                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                <Typography variant="body2">{user.org_name}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={8}>
                <Card elevation={3} sx={{ height: '100%' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Organization Details
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box display="flex" alignItems="center" mb={2}>
                            <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="body1">{user.org_name}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                            <Typography variant="body1">{user.address}</Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        <Grid item xs={5}>
                <SiteEngineerCalendar site={selectedSite} />
            </Grid></>
    )
}

export default SiteEngineerLanding;