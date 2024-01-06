import React, { useState } from "react";
import { Helmet } from 'react-helmet';
import axios from "axios";
import { Redirect, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addUser } from "../../../actions/user.action";
import { setMessage } from "../../../actions/message.action";
import { closeMessage } from "../closeMessage";
import Message from "../Message";

export default function Login({ history }) {
   const [remember, setRemember] = useState(false);
   const [user, setUser] = useState({});
   const [errorMessage, setErrorMessage] = useState(""); // New state for error message
   const { register, handleSubmit, errors } = useForm();

   const token = localStorage.getItem("auth-token");
   const dispatch = useDispatch();

   const onSubmit = async (data, e) => {
      const { name, value, type } = e.target;

      setUser({
         ...user,
         [name]: type === "checkbox" ? setRemember(!remember) : value
      });

      try {
         const res = await axios.post("/login", data);

         if (res.data.code === 200) {
            const { token } = res.data;
            localStorage.setItem("auth-token", token);

            const { _id } = res.data.data;
            const userId = _id;
            sessionStorage.setItem("userId", userId);
            localStorage.setItem("userId", userId);

            dispatch(addUser(res.data.data));

            dispatch(setMessage({ code: 200, message: "Đăng nhập thành công" }));
            dispatch(closeMessage());

            history.push("/");
         } else {
            setErrorMessage(res.data.message);
            dispatch(setMessage({ code: res.data.code, message: res.data.message }));
            dispatch(closeMessage());
         }
      } catch (error) {
         console.error("Có lỗi khi đăng nhập:", error);
         setErrorMessage("Email hoặc mật khẩu không chính xác");
      }
   };

   return (
      <>
         <Helmet>
            <title>Đăng nhập - BkNews kênh tin tức hàng đầu Việt Nam</title>
            <meta name="description" content="BkNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
         </Helmet>
         {
            !token
               ? (
                  <div className="container">
                     <div className="row" style={{ height: "85vh" }}>
                        <form className="col-xl-6 m-auto" onSubmit={handleSubmit(onSubmit)}>
                           <Message />
                           <h1 className="mb-4">ĐĂNG NHẬP</h1>
                           <div className="form-group">
                              <input
                                 type="text"
                                 name="email"
                                 style={{ border: `${errors.password ? "1px solid red" : ""}` }}
                                 className="form-control"
                                 placeholder="Nhập địa chỉ email..."
                                 ref={register({ required: true })}
                              />
                              {errors.email && (
                                 <small className="text-danger">Bạn phải điền đầy đủ thông tin...</small>
                              )}
                           </div>
                           <div className="form-group">
                              <input
                                 type="password"
                                 name="password"
                                 style={{ border: `${errors.password ? "1px solid red" : ""}` }}
                                 className="form-control"
                                 placeholder="Nhập mật khẩu..."
                                 ref={register({ required: true })}
                              />
                              {errors.password && (
                                 <small className="text-danger">Bạn phải điền đầy đủ thông tin...</small>
                              )}
                              <div className="mt-2 d-flex justify-content-end">
                                 {/* Liên kết "Quên mật khẩu" */}
                                 <Link to="/forgot-password">Quên mật khẩu</Link>
                              </div>
                           </div>
                           {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
                           <button type="submit" className="btn btn-danger mt-3">
                              Đăng nhập
                           </button>

                           {/* Display error message if present */}


                           <div className="mt-2">
                              {/* Liên kết "Quay lại" */}
                              Nếu bạn chưa có tài khoản, hãy <Link to="/register"><i className="" aria-hidden="true"></i> tạo tài khoản</Link>
                           </div>
                        </form>
                     </div>
                  </div>
               )
               : <Redirect to="/" />
         }
      </>
   );
}
