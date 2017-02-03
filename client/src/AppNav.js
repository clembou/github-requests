import React from 'react'
import { Navbar, Nav, NavDropdown, MenuItem } from 'react-bootstrap'
import { Route, Link } from 'react-router-dom'

const MenuLink = ({ label, to, activeOnlyWhenExact }) => (
  <Route path={to} exact={activeOnlyWhenExact} children={({ match }) => (
    <li className={match ? 'active' : ''}>
      <Link to={to}>{label}</Link>
    </li>
  )} />
)

const MenuItemLink = ({ label, to, active }) => (
  <li>
    <Link to={to}>{label}</Link>
  </li>
)

const AppNav = (props) => (
  <Navbar inverse fixedTop>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">Software Requests</Link>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <MenuLink activeOnlyWhenExact={true} to="/requests" label="Requests" />
        {(props.isAuthenticated && props.isAdmin) && (
          <MenuLink activeOnlyWhenExact={true} to="/backlog" label="Backlog" />
        )}
      </Nav>
      <Nav pullRight>
        {(props.isAuthenticated && props.userProfile) && (
          <NavDropdown eventKey="5" title={`Signed in as ${props.userProfile.name}`} id="nav-dropdown-profile" pullRight>
            {(props.isAdmin && props.githubUserProfile) && (
              <MenuItem>
                <img src={props.githubUserProfile.avatar_url} className="profile-pic-small" alt="github avatar" />
                <strong> {props.githubUserProfile.login}</strong> on Github
              </MenuItem>
            )}
            {(props.isAuthenticated && props.isAdmin == null) && (
              <MenuItemLink to="/admin-consent" label="Enable admin features" />
            )}
            {(process.env.NODE_ENV !== 'production') &&
              <MenuItem onClick={() => props.onToggleAdmin()}>Toggle Admin</MenuItem>}
            {(process.env.NODE_ENV !== 'production') && <MenuItem divider />}
            <MenuItemLink to="/signout" label="Sign Out" />
          </NavDropdown>
        )}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
)

AppNav.defaultProps = {
  isAdmin: false,
  isAuthenticated: false,
  userProfile: null,
  githubUserProfile: null
}

export default AppNav;
