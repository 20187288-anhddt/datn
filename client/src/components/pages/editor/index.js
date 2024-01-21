import React from "react";
import { Route, Switch } from "react-router-dom";
import NavbarRight from "./Navbar";
import Dashboard from "./Dashboard";
// import AddNew from "./AddNew";
import New from "./New";
import Edit from "./Edit";
import EditNews from "./manage-news/EditNews";
import NewsManagement from "./manage-news/NewsManagement";
import AddNews from "./manage-news/AddNews";
import NewsTrash from "./manage-news/NewsTrash";

export default function Editor() {
  return (
    <>
      <div className="container-scroller">
        <div className="container-fluid page-body-wrapper">
          <NavbarRight />
          <div className="main-panel">
            <Switch>
              <Route exact path="/admin" component={Dashboard} />

              <Route path="/admin/news" component={New} />
              <Route path="/admin/new/:id" component={Edit} />
              {/* News manage */}
              <Route exact path="/admin/newsmng" component={NewsManagement} />
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

 //             {/* <Route path="/admin/add-new" component={AddNew} /> */}