import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { Link } from 'react-router'

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
        <Link to="/" activeOnlyWhenExact>{
          ({isActive, location, href, onClick, transition}) =>
            <NavItem onClick={onClick} href={href} active={isActive}>Home</NavItem>
        }</Link>
        <Link to="/requests">{
          ({isActive, location, href, onClick, transition}) =>
            <NavItem onClick={onClick} href={href} active={isActive}>Requests</NavItem>
        }</Link>
        {(props.isAuthenticated && props.isAdmin) && (
          <Link to="/backlog">{
            ({isActive, location, href, onClick, transition}) =>
              <NavItem onClick={onClick} href={href} active={isActive}>Backlog</NavItem>
          }</Link>
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
              <Link to="/admin-consent">{
                ({isActive, location, href, onClick, transition}) =>
                  <MenuItem onClick={onClick} href={href} active={isActive}>Enable admin features</MenuItem>
              }</Link>
            )}
            {(process.env.NODE_ENV !== 'production') &&
              <MenuItem onClick={() => props.onToggleAdmin()}>Toggle Admin</MenuItem>}
            <MenuItem divider />
            <Link to="/signout">{({ href, ...rest}) =>  <MenuItem href={href}>Sign Out</MenuItem>}</Link>
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
