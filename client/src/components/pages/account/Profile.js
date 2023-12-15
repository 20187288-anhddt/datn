import React from "react";
import {Helmet} from 'react-helmet'
import axios from "axios";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { addUser } from "../../../actions/user.action";
import { setMessage } from "../../../actions/message.action";

// components
import Infomation from "./Infomation";
import Avatar from "./Avatar";
import Message from "../Message";
import { closeMessage } from "../closeMessage";

export default function Profile() {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState({});

  // message error
  const [userNameErr, setUserNameErr] = useState("");
  const [userEmailErr, setUserEmailErr] = useState("");
  const [userPasswordErr, setUserPasswordErr] = useState("");
  const [userCurrentPasswordErr, setUserCurrentPasswordErr] = useState(
    ""
  );
  const [userNewPasswordErr, setUserNewPasswordErr] = useState("");
  const [userNewPasswordAgainErr, setUserNewPasswordAgainErr] = useState(
    ""
  );

  const dispatch = useDispatch();
  const userId = sessionStorage.getItem("userId");
  const token = localStorage.getItem("auth-token") || "asdasd";

  useEffect(() => {
    dispatch(setMessage({ message: "" }));
    const fetchUser = async () => {
      const res = await axios.get(`/login/${token}`);
      const rs = await res.data.data;

      dispatch(addUser(rs));
    };

    fetchUser();
  }, [dispatch, token]);

  const mer = "Không được để trống";

  // Name
  const hanldeChangeName = e => {
    setUserName(e.target.value);
  };

  const hanldeUpdateName = async e => {
    if (userName === "" || userName === null) {
      setUserNameErr(mer);
    } else {
      try {
        const res = await axios.put(`/login/updateName/${userId}`, {
          userName: userName
        });
        const { code, message } = res.data;
        dispatch(setMessage({ code, message }));
        dispatch(closeMessage());

        if (code === 200) {
          const { username, email, role, image, _id } = res.data.data;

          dispatch(addUser({ username, email, role, image, _id }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Email
  const hanldeChangeEmail = e => {
    setUserEmail(e.target.value);
  };
  console.log(userEmail);

  const hanldeUpdateEmail = async e => {
    if (userEmail === "" || userEmail === null) {
      setUserEmailErr(mer);
      console.log(mer);
    } else {
      try {
        const res = await axios.put(`/login/updateEmail/${userId}`, {
          email: userEmail
        });

        const { code, message } = res.data;
        dispatch(setMessage({ code, message }));
        dispatch(closeMessage());

        if (code === 200) {
          const { username, email, role, image, _id } = res.data.data;

          dispatch(addUser({ username, email, role, image, _id }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  // Password
  const hanldeChangePassword = e => {
    setUserPassword({ ...userPassword, [e.target.name]: e.target.value });
  };

  const hanldeUpdatePassword = async e => {
    if (
      !userPassword.currentPassword ||
      !userPassword.newPassword ||
      !userPassword.newPasswordAgain
    ) {

      setUserCurrentPasswordErr(mer);
      setUserNewPasswordErr(mer);
      setUserNewPasswordAgainErr(mer);
    } else {
      if (userPassword.newPassword !== userPassword.newPasswordAgain) {
        setUserPasswordErr("Mật khẩu không trùng khớp");
      } else {
        try {
          const res = await axios.put(`/login/updatePassword/${userId}`, {
            newPassword: userPassword.newPassword,
            currentPassword: userPassword.currentPassword
          });
          const { code, message } = res.data;

          dispatch(setMessage({ code, message }));
          dispatch(closeMessage());
  
          if (code === 200) {
            const { username, email, role, image, _id } = res.data.data;
  
            dispatch(addUser({ username, email, role, image, _id }));
          }

          setUserPasswordErr("");
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Thông tin cá nhân - chỉnh sửa</title>
        <meta name="description" content="BNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
      </Helmet>
      <div className="container bootstrap snippet">
        <div className="row">
          <div className="col-sm-4">
            {/*left col*/}
            <Avatar />
            <br />
            <Infomation />
          </div>
          {/*/col-3*/}
          <div className="col-sm-8">
            <Message />
            <h3>Chỉnh sửa profile</h3>
            <div className="tab-content">
              <div className="tab-pane active">
                <div className="form-group">
                  <div className="col-xs-6">
                    {!userName ? (
                      <div className="text-danger">{userNameErr}</div>
                    ) : (
                      ""
                    )}
                    <label htmlFor="first_name">
                      <h5>Tên</h5>
                    </label>
                    <input
                      onChange={hanldeChangeName}
                      value={userName || ""}
                      type="text"
                      className="form-control"
                      name="username"
                      placeholder=""
                    />
                  </div>
                  <div className="form-group">
                    <div className="col-xs-12">
                      <button
                        onClick={hanldeUpdateName}
                        className="btn btn-danger btn-sm mt-3"
                        type="submit"
                      >
                        <i className="glyphicon glyphicon-ok-sign" /> Cập nhật tên
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-xs-6">
                    {!userEmail ? (
                      <div className="text-danger">{userEmailErr}</div>
                    ) : (
                      ""
                    )}
                    <label htmlFor="email">
                      <h5>Email</h5>
                    </label>
                    <input
                      onChange={hanldeChangeEmail}
                      value={userEmail || ""}
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <div className="col-xs-12">
                      <button
                        onClick={hanldeUpdateEmail}
                        className="btn btn-danger btn-sm mt-3"
                        type="submit"
                      >
                        <i className="glyphicon glyphicon-ok-sign" /> Cập nhật email
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-xs-6">
                    {!userPassword.currentPassword ? (
                      <div className="text-danger">{userCurrentPasswordErr}</div>
                    ) : (
                      ""
                    )}
                    <label htmlFor="password">
                      <h5>Nhập mật khẩu hiện tại</h5>
                    </label>
                    <input
                      onChange={hanldeChangePassword}
                      value={userPassword.currentPassword || ""}
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      placeholder="Nhập mật khẩu hiện tại..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-xs-6">
                    {userPasswordErr ? (
                      <div className="text-danger">{userPasswordErr}</div>
                    ) : null}
                    {!userPassword.newPassword ? (
                      <div className="text-danger">{userNewPasswordErr}</div>
                    ) : (
                      ""
                    )}
                    <label htmlFor="password">
                      <h5>Nhập mật khẩu mới</h5>
                    </label>
                    <input
                      onChange={hanldeChangePassword}
                      value={userPassword.newPassword || ""}
                      type="password"
                      className="form-control"
                      name="newPassword"
                      placeholder="Nhập mật khẩu mới..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-xs-6">
                    {!userPassword.newPasswordAgain ? (
                      <div className="text-danger">{userNewPasswordAgainErr}</div>
                    ) : (
                      ""
                    )}
                    <label htmlFor="password">
                      <h5>Nhập lại mật khẩu mới</h5>
                    </label>
                    <input
                      onChange={hanldeChangePassword}
                      value={userPassword.newPasswordAgain || ""}
                      type="password"
                      className="form-control"
                      name="newPasswordAgain"
                      placeholder="Nhập lại mật khẩu mới..."
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-xs-12">
                    <button
                      onClick={hanldeUpdatePassword}
                      className="btn btn-danger btn-sm"
                      type="submit"
                    >
                      <i className="glyphicon glyphicon-ok-sign" /> Thay mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
