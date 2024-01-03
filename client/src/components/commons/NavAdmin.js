import React from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getCategories } from "../../actions/category.action";
import { addUser } from "../../actions/user.action";
import { hanldeUrlPretty } from "../mixin/UrlPretty";
import CheckAdmin from "./CheckAdmin";

export default function NavAdmin(props) {
  const appState = useSelector(state => state);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);
  const hanldLogout = () => {
    dispatch(addUser(null));

    sessionStorage.removeItem("userId");
    localStorage.removeItem("auth-token");
  };

  return (
    <nav className="navbar fixed-top navbar-expand-xl navbar-dark bg-dark shadow-sm py-0 px-3">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img width="100%" src="/Logo-news.png" alt="Logo news" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
            {appState.categories.data
              ? appState.categories.data.map((item, index) => (
                  <li key={index} className="nav-item">
                    <Link className="nav-link category-link" to={`/category/${item.name && hanldeUrlPretty(item.name)}/${item._id}`}
                    >
                      {item.name ? <h5><strong>{item.name.toUpperCase()}</strong></h5> : null}
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        
          <ul className="navbar-nav mr-auto align-items-center">
            <h5><CheckAdmin role={props.role} /></h5>
          </ul>
          <div>
            <ul className="navbar-nav mr-0">
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle account"
                  href="#0"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {appState.users.data ? (
                    <div className="account__avatar">
                      <img
                        style={props.style}
                        src={`/uploads/users/${appState.users.data.image ||
                          "avatar-default.jpg"}`}
                        alt="avatar"
                      />
                    </div>
                  ) : (
                    "TÀI KHOẢN"
                  )}
                </a>
                {appState.users.data ? (
                  
                  <div
                    className="dropdown-menu shadow"
                    aria-labelledby="navbarDropdown"
                  >
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
                    <Link className="dropdown-item" to="/profile">
                    <i class="fa fa-address-card mr-2" aria-hidden="true"></i>
                      <span>Thông tin</span>
                    </Link>
                    <Link className="dropdown-item" to="/admin">
                      <i className="fa fa-cogs mr-2"></i>
                      <span>Trang Admin</span>
                    </Link>
                    <div className="dropdown-divider" />
                    <Link
                      to="/login"
                      className="dropdown-item"
                      onClick={hanldLogout}
                    >
                      <i className="fas fa-sign-out-alt mr-2"></i>
                      <span>Đăng xuất</span>
                    </Link>
                  </div>
                ) : (
                  <div
                    className="dropdown-menu shadow"
                    aria-labelledby="navbarDropdown"
                  ><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
                    <Link className="dropdown-item" to="/login">
                      <i className="fas fa-sign-in-alt mr-4"></i>
                      <span>Đăng nhập</span>
                    </Link>
                    <Link className="dropdown-item" to="/register">
                    <i class="fa fa-sign-out" aria-hidden="true"></i>
                      <span>Đăng ký</span>
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}