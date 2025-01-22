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
import toast from "react-hot-toast";
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CloudIcon from '@mui/icons-material/Cloud';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// import required modules
import { Navigation, Pagination } from 'swiper/modules';

const OwnerLanding = (props) => {
  const { user } = useContext(AuthContext);
  const [sites, setSites] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const theme = useTheme();

  const fetchSiteOptions = async () => {
    props.setIsLoading(true);
    try {
      const data = await AxiosPost('fetchSites.php', { orgId: user.orgId });
      if (data.success) {
        setSites(data.sites);
        // Generate dummy weather data for each site
        const dummyWeather = {};
        data.sites.forEach(site => {
          dummyWeather[site.site_id] = generateDummyWeather(site.site_id);
        });
        setWeatherData(dummyWeather);
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Server Error!");
      console.error(err);
    } finally {
      props.setIsLoading(false);
    }
  };

  const generateDummyWeather = (siteId) => {
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Snowy'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const randomTemp = Math.floor(Math.random() * 35) - 5; // Temperature between -5°C and 30°C
    return {
      temperature: randomTemp,
      condition: randomCondition
    };
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return <WbSunnyIcon sx={{ color: 'orange' }} />;
      case 'Cloudy':
        return <CloudIcon sx={{ color: 'gray' }} />;
      case 'Rainy':
        return <CloudIcon sx={{ color: 'blue' }} />;
      case 'Snowy':
        return <AcUnitIcon sx={{ color: 'lightblue' }} />;
      default:
        return <WbSunnyIcon sx={{ color: 'orange' }} />;
    }
  };

  useEffect(() => {
    fetchSiteOptions();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* User Info Card */}
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
                  sx={{ mb: 2 }}
                />
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
        
        {/* Organization Details Card */}
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

        {/* Sites Slider */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Sites in Your Organization
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Swiper
              slidesPerView={2}
              spaceBetween={30}
              navigation={true}
              pagination={{
                clickable: true,
              }}
              modules={[Navigation, Pagination]}
              className="mySwiper"
            >
              {sites.map((site, index) => (
                <SwiperSlide key={site.site_id || index}>
                  <Card elevation={3} sx={{ height: '100%', minHeight: 200, position: 'relative' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{site.site_name || 'N/A'}</Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{site.site_location || 'N/A'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{site.contact || 'N/A'}</Typography>
                      </Box>
                      
                      {/* Weather Report */}
                      {weatherData[site.site_id] && (
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 10, 
                            right: 10, 
                            display: 'flex', 
                            alignItems: 'center',
                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '4px',
                            padding: '4px 8px'
                          }}
                        >
                          {getWeatherIcon(weatherData[site.site_id].condition)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {`${weatherData[site.site_id].temperature}°C, ${weatherData[site.site_id].condition}`}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </SwiperSlide>
              ))}
            </Swiper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerLanding;