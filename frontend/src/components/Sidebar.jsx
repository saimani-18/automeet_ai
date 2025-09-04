import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Meetings", path: "/meetings" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Knowledge Base", path: "/knowledge-base" },
    { name: "Calendar Integration", path: "/calendar-integration" },
    { name: "Settings", path: "/settings" }
  ];
  return (
    <nav style={sidebarStyle}>
      <div style={logoStyle}>AutoMeet AI</div>
      {navItems.map(item => (
        <NavLink
          key={item.name}
          to={item.path}
          style={({ isActive }) =>
            isActive ? activeLinkStyle : linkStyle
          }
        >
          {item.name}
        </NavLink>
      ))}
      <button style={signOutBtnStyle}>Sign Out</button>
    </nav>
  );
}

const sidebarStyle = {
  width: 220,
  background: '#19243b',
  color: '#cdd8f8',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  padding: '22px 12px 0'
};

const logoStyle = {
  fontWeight: 700,
  fontSize: 22,
  marginBottom: 24
};

const linkStyle = {
  padding: '10px 0',
  fontSize: 16,
  color: '#cdd8f8',
  textDecoration: 'none',
  marginBottom: 0
};

const activeLinkStyle = {
  ...linkStyle,
  color: '#468afa',
  fontWeight: 700
};

const signOutBtnStyle = {
  marginTop: 'auto',
  background: '#468afa',
  color: '#fff',
  borderRadius: 6,
  border: 'none',
  padding: '10px 0',
  fontWeight: 600,
  cursor: 'pointer'
};

export default Sidebar;
