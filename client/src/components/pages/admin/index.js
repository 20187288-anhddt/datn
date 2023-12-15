import React from "react";
import {Helmet} from 'react-helmet'
import { Route, Switch } from "react-router-dom";
import NavbarRight from "./Navbar";
import Dashboard from "./Dashboard";
import Member from "./manage-member/Member";
import { Chart as ChartJS } from 'chart.js/auto'
import { Chart }            from 'react-chartjs-2'
import Category from "./manage-category/CategoryManagement";
import CategoryTrash from "./manage-category/CategoryTrash";
import AddCategory from "./manage-category/AddCategory";
import Comment from "./manage-comment/Comment";
import EditNews from "./manage-news/EditNews";
import NewsManagement from "./manage-news/NewsManagement";
import AddNews from "./manage-news/AddNews";
import NewsTrash from "./manage-news/NewsTrash";

export default function Admin() {
  return (
    <>
      <Helmet>
        <title>Admin - Trang quản trị admin</title>
      </Helmet>
      <div className="container-scroller">
        <div className="container-fluid page-body-wrapper">
          <NavbarRight />
          <div className="main-panel">
            <Switch>
              <Route exact path="/admin" component={Dashboard} />
              <Route path="/admin/manage-members" component={Member} />
              {/* Category manage */}
              <Route path="/admin/categories/trash" component={CategoryTrash} />
              <Route exact path="/admin/categories/add" component={AddCategory} />
              <Route path="/admin/categories" component={Category} />
              {/* Comment manage */}
              <Route path="/admin/manage-comments" component={Comment} />
              {/* News manage */}
              <Route exact path="/admin/news" component={NewsManagement} />
              <Route exact path="/admin/news/add" component={AddNews} />
              <Route exact path="/admin/news/trash" component={NewsTrash} />
              <Route path="/admin/news/:id" component={EditNews} />
            </Switch>
          </div>
        </div>
      </div>
    </>
  );
}
