import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import Link from 'react-router/Link'

const AppNav = (props) => (
  <Navbar>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">Github-Requests</Link>
      </Navbar.Brand>
      <Navbar.Toggle />
    </Navbar.Header>
    <Navbar.Collapse>
      <Nav>
        <NavItem componentClass={Link} href="/" to="/">Home</NavItem>
        <NavItem componentClass={Link} href="/requests" to="/requests">Requests</NavItem>
        {(props.isAuthenticated && props.isAdmin) && (<NavItem componentClass={Link} href="/backlog" to="/backlog">Backlog</NavItem>)}
        {!props.isAuthenticated && (
          <NavItem componentClass={Link} href="/login/azure" to="/login/azure">Login</NavItem>
        )}
        {(props.isAuthenticated && props.isAdmin == null) && (<NavItem componentClass={Link} href="/admin-consent" to="/admin-consent">Enable Admin features</NavItem>)}
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
            <MenuItem onClick={() => props.onToggleAdmin()}>Toggle Admin</MenuItem>
            <MenuItem divider />
            <MenuItem componentClass={Link} href="/signout" to="/signout">Sign Out</MenuItem>
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
