import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider, useParams } from 'react-router-dom'
import RequireAuth from './components/RequireAuth.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import UserLayout from './layouts/UserLayout.jsx'
import AlgoVisualization from './pages/AlgoVisualization.jsx'
import BinarySearch from './pages/BinarySearch.jsx'
import ContestList from './pages/ContestList.jsx'
import ContestProblem from './pages/ContestProblem.jsx'
import ContestSolving from './pages/ContestSolving.jsx'
import Home from './pages/Landing.jsx'
import LinearSearch from './pages/LinearSearch.jsx'
import Login from './pages/Login.jsx'
import PaymentCancel from './pages/PaymentCancel.jsx'
import PaymentSuccess from './pages/PaymentSuccess.jsx'
import ProblemList from './pages/ProblemList.jsx'
import ProblemPage from './pages/ProblemPage.jsx'
import Profile from './pages/Profile.jsx'
import Signup from './pages/SignUp.jsx'
import Sorting from './pages/Sorting.jsx'

function AlgorithmPage() {
  const { algorithmId } = useParams()
  if (algorithmId === 'linear-search') return <LinearSearch />
  if (algorithmId === 'binary-search') return <BinarySearch />
  if (algorithmId === 'sorting') return <Sorting />
  return <LinearSearch />
}

const router = createBrowserRouter([
  // Public routes
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Signup /> },
  { path: '/payment/success', element: <PaymentSuccess /> },
  { path: '/payment/cancel', element: <PaymentCancel /> },
  // Protected app
  {
    element: <RequireAuth />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'problems', element: <ProblemList /> },
          { path: 'problem/:id', element: <ProblemPage /> },
          { path: 'algo-visualization', element: <AlgoVisualization /> },
          { path: 'algo-visualization/:categoryId/:algorithmId', element: <AlgorithmPage /> },
          { path: 'profile', element: <Profile /> },
          { path: 'contests', element: <ContestList /> },
          { path: 'contest/:id', element: <ContestProblem /> },
        ]
      },
      // Contest solving page (fullscreen, no layout)
      { path: 'contest/:contestId/solve/:problemId', element: <ContestSolving /> },
      { path: 'contest/:contestId/solve', element: <ContestSolving /> },
    ]
  }
])

export default function UserRouter(){
  return (
    <AuthProvider>
      <AuthInitializer />
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

function AuthInitializer(){
  const { refresh } = useAuth()
  useEffect(() => {
    refresh()
  }, [])
  return null
}
