import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <Link to="/admin" className="nav-link" href="index.html">
            <span className="menu-title">Dashboard</span>
            <i className="mdi mdi-home menu-icon" />
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/admin/categories" className="nav-link" href="index.html">
            <span className="menu-title">Quản lý danh mục</span>
            <i className="mdi mdi-format-list-bulleted menu-icon" />
          </Link>
        </li>  
        <li className="nav-item">
          <Link to="/admin/news" className="nav-link">
            <span className="menu-title">Quản lý bài báo</span>
            <i className="mdi mdi-view-list menu-icon" />
          </Link>
        </li>

        <li className="nav-item">
          <Link to="/admin/manage-members" className="nav-link" href="index.html">
            <span className="menu-title">Quản lý người dùng</span>
            <i className="mdi mdi-account menu-icon" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}
