import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut } from "lucide-react";
import { logoutUser } from "../authslice.js";

const ACCENT = {
  primary: "#38f8a5",
  secondary: "#ff8bd1",
};

function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <NavLink to="/" className="font-black text-lg">
            Code<span style={{ color: ACCENT.primary }}>Verse</span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
            <a href="#problems" className="hover:text-white transition">Problems</a>
            <a href="#daily" className="hover:text-white transition">Daily</a>
            <a href="#tracks" className="hover:text-white transition">Tracks</a>
            <NavLink to="/submissions" className="hover:text-white transition">Submissions</NavLink>
            <NavLink to="/leaderboard" className="hover:text-white transition">Leaderboard</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-white/70">Hi, {user?.firstName || user?.name || "User"}!</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{ background: `linear-gradient(90deg, ${ACCENT.secondary}, ${ACCENT.primary})`, color: "#0a0a0a" }}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="px-3 py-1.5 border border-white/20 rounded-xl hover:border-white/40 text-sm">Log in</NavLink>
                <NavLink
                  to="/signup"
                  className="px-4 py-1.5 rounded-xl font-semibold"
                  style={{ background: `linear-gradient(90deg, ${ACCENT.secondary}, ${ACCENT.primary})`, color: "#0a0a0a" }}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;


