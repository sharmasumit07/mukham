// ** MUI Imports
import Grid from '@mui/material/Grid'
import OrganisationsTable from '../../@core/home/OrganisationsTable'
import AddOrganisation from '../../@core/home/AddOrganisation'
import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { AuthContext, AxiosPost } from 'src/context/AuthContext'
import SiteEngineerLanding from '../../@core/home/SiteEngineerLanding'
import OwnerLanding from '../../@core/home/OwnerLanding'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [Organisations, setOrganisations] = useState(null);
  const { user } = useContext(AuthContext);


  const fetchOrganisations = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosPost('fetchOrganisations.php')
      console.log(data)
      if (data.success) {
        setOrganisations(data.organisations)
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


  if (user.role && user.role === 'admin') {
    return (
      <Grid container spacing={6}>
        <Grid item xs={6}>
          <OrganisationsTable Organisations={Organisations} setOrganisations={setOrganisations} fetchOrganisations={fetchOrganisations} isLoading={isLoading}></OrganisationsTable>
        </Grid>
        <Grid item xs={6}>
          <AddOrganisation fetchOrganisations={fetchOrganisations}></AddOrganisation>
        </Grid>
      </Grid>
    )
  } else if (user.role && user.role === 'Owner') {
    return (
      <Grid spacing={6}>
        <OwnerLanding isLoading={isLoading} setIsLoading={setIsLoading} />
      </Grid>
    )
  } else if (user.role && user.role === 'Engineer') {
    return (
      <Grid spacing={6}>
        <SiteEngineerLanding />
      </Grid>
    )
  } else if (user.role && user.role === 'Supervisor') {
    return (
      <Grid spacing={6}>
        <SiteEngineerLanding />
      </Grid>
    )
  }

}

export default Home
