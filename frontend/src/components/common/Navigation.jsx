import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Navigation.css'

export default function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          EcoVehicle
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className={getLinkClass(location.pathname === '/')} onClick={closeMenu}>
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/predict" className={getLinkClass(location.pathname === '/predict' || location.pathname === '/dashboard')} onClick={closeMenu}>
                Predictor
              </Link>
              <Link to="/history" className={getLinkClass(location.pathname === '/history')} onClick={closeMenu}>
                History
              </Link>
              <Link to="/reports" className={getLinkClass(location.pathname === '/reports')} onClick={closeMenu}>
                Reports
              </Link>
              <div className="nav-user">
                <span className="user-name">{user?.full_name}</span>
                <button className="nav-logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={getLinkClass(location.pathname === '/login')} onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="nav-link nav-link-primary" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen((open) => !open)} type="button" aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}

function getLinkClass(isActive) {
  return `nav-link${isActive ? ' nav-link-active' : ''}`
}
