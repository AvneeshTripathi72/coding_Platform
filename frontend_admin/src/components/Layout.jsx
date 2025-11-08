import { NavLink, Outlet } from 'react-router-dom'

function Layout(){
  return (
    <div style={{minHeight:'100vh', background:'#0b0b0f', color:'#fff'}}>
      <header style={{position:'sticky', top:0, backdropFilter:'blur(6px)', borderBottom:'1px solid #222'}}>
        <div style={{maxWidth:980, margin:'0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <NavLink to="/" style={{fontWeight:900}}>Admin<span style={{color:'#38f8a5'}}>Panel</span></NavLink>
          <nav style={{display:'flex', gap:12, fontSize:14, color:'#bbb'}}>
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/endpoints">Endpoints</NavLink>
            <NavLink to="/problems">Problems</NavLink>
            <NavLink to="/users">Users</NavLink>
            <NavLink to="/submissions">Submissions</NavLink>
          </nav>
        </div>
      </header>
      <main style={{maxWidth:980, margin:'0 auto', padding:'16px'}}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
