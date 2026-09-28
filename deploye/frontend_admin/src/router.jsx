import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import Analytics from './pages/Analytics.jsx'
import Contests from './pages/Contests.jsx'
import Courses from './pages/Courses.jsx'
import CreateProblem from './pages/CreateProblem.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Endpoints from './pages/Endpoints.jsx'
import Login from './pages/Login.jsx'
import Problems from './pages/Problems.jsx'
import Settings from './pages/Settings.jsx'
import Submissions from './pages/Submissions.jsx'
import SubscriptionManagement from './pages/SubscriptionManagement.jsx'
import Users from './pages/Users.jsx'
import Videos from './pages/Videos.jsx'

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'users', element: <Users /> },
      { path: 'courses', element: <Courses /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
      { path: 'endpoints', element: <Endpoints /> },
      { path: 'problems', element: <Problems /> },
      { path: 'problems/create', element: <CreateProblem /> },
      { path: 'submissions', element: <Submissions /> },
      { path: 'videos', element: <Videos /> },
      { path: 'contests', element: <Contests /> },
      { path: 'subscriptions', element: <SubscriptionManagement /> },
    ]
  }
])

export default function AdminRouter(){
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
