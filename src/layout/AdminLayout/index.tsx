import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '~/context/authProvider'
import NavBar from './NavBar'
import useViewport from '~/hooks/useViewport'
import { ADMIN, USER } from '~/common/const/role'
import { permissionObject } from '~/common/const/permissions'

function AdminLayout({ children }: any) {
  const location = useLocation()
  const { token, user } = useAuth()
  const { width } = useViewport()
  const isMobile = width <= 1024
  if (token || user?.role == ADMIN || user?.permissions.includes(permissionObject.MANAGER)) {
    return (
      <div className='h-[100vh] overflow-hidden bg-[#e8eaed]'>
        <div className='fixed w-full z-30'>
          <NavBar />
        </div>

        <div
          className={`${isMobile ? 'mt-[50px] h-[calc(100vh-50px)]' : 'mt-[100px] h-[calc(100vh-100px)]'} overflow-auto`}
        >
          {children}
        </div>
      </div>
    )
  }
  return <Navigate to='/404notfound' state={{ from: location }} replace></Navigate>
}

export default AdminLayout
