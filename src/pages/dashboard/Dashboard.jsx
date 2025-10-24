import Sidebar from "./sidebard"
import { Outlet } from "react-router-dom"

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar
      <Navbar /> */}

      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1  overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Dashboard
