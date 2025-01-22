import { Box, Fab, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import toast from "react-hot-toast";
import { AuthContext, AxiosPost } from "src/context/AuthContext";

import Icon from 'src/@core/components/icon'

const { Fragment, useEffect, useState, useContext } = require("react")


const SiteSelection = props => {
  // const [site, setSite] = useState('');
  const [siteOptions, setSiteOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, selectedSite, setSelectedSite } = useContext(AuthContext);

  // console.log("USER", user);

  const fetchSiteOptions = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchSiteOptions.php', { org_id: user.orgId })
      // console.log(data)
      if (data.success) {
        setSiteOptions(data.options)
      }
      else toast.error(data.error)
    } catch (err) {
      console.log(err)
    }
    finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { fetchSiteOptions() }, [user.orgId])

  const onChangeHandler = (e) => {
    setSelectedSite(e.target.value);
  }

  return (
    <Fragment>
      <Box display='flex' alignItems='center' gap={2}>
        <Fab color='primary' aria-label='refresh' size='small' onClick={fetchSiteOptions}>
          <Icon icon='mdi:cached' />
        </Fab>
        <FormControl fullWidth sx={{ mr: 3 }}>
          <InputLabel size='small' id='form-layouts-separator-select-label'>Site</InputLabel>
          <Select
            size='small'
            label='Site'
            defaultValue=''
            id='form-layouts-separator-select'
            labelId='form-layouts-separator-select-label'
            value={selectedSite}
            name='site'
            onChange={onChangeHandler}
          >
            {siteOptions && siteOptions.map((site, index) => (
              <MenuItem key={index} value={site.site_id}>
                {site.site_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Fragment>

  )
}

export default SiteSelection