import { useContext } from "react"
import { AuthContext } from "src/context/AuthContext"

const navigation = () => {
  const { user } = useContext(AuthContext)
  console.log(user);
  let pages = [
    {
      title: `${user.org_name}`,
      path: '/home',
      icon: 'mdi:home-outline',
    },
    {
      title: 'Users',
      path: '/user-management',
      icon: 'mdi:account-multiple',
    },
  ]
  return pages
}

export default navigation
