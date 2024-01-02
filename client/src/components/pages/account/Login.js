import React from "react";
import { useState } from "react";
import {Helmet} from 'react-helmet';
import axios from "axios";
import { Redirect } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addUser } from "../../../actions/user.action";
import { setMessage } from "../../../actions/message.action";
import { closeMessage } from "../closeMessage";
import Message from "../Message";

export default function Login({ history }) {
   const [remember, setRemember] = useState(false);
   const [user, setUser] = useState({});
   const { register, handleSubmit, errors } = useForm();

   const token = localStorage.getItem("auth-token");

   const dispatch = useDispatch();

   const onSubmit = async (data, e) => {
		const {name, value, type} = e.target;
		console.log("muot");
	  setUser({
		 ...user,
		 [name]: type === "checkbox" ? setRemember(!remember) : value
	  });

	  try {
		try {
			const res = await axios.post("/login", data);
		  
			if (res.data.code === 200) {
			  // Lưu token vào localStorage
			  const { token } = res.data;
			  localStorage.setItem("auth-token", token);
		  
			  // Lưu userId vào sessionStorage và localStorage
			  const { _id } = res.data.data;
			  const userId = _id;
			  sessionStorage.setItem("userId", userId);
			  localStorage.setItem("userId", userId);
		  
			  // Dispatch action để lưu thông tin người dùng vào global state
			  dispatch(addUser(res.data.data));
		  
			  // Hiển thị thông báo thành công và đóng thông báo
			  dispatch(setMessage({ code: 200, message: "Đăng nhập thành công" }));
			  dispatch(closeMessage());
		  
			  // Chuyển hướng đến trang chính
			  history.push("/");
			} else {
			  // Hiển thị thông báo lỗi và đóng thông báo
			  const { code, message } = res.data;
			  dispatch(setMessage({ code, message }));
			  dispatch(closeMessage());
			}
		  } catch (error) {
			// Xử lý lỗi nếu có
			console.error("Có lỗi khi đăng nhập:", error);
		  }
		  
	  } catch (error) {
		 if (error) console.log("Have a problem", error);
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
								 className="form-control"
								 placeholder="Enter email..."
								 ref={register({ required: true })}
							  />
							  
						   </div>
						   <div className="form-group">
							  <input
								 type="password"
								 name="password"
								 style={{ border: `${errors.password ? "1px solid red" : ""}` }}
								 className="form-control"
								 placeholder="Password..."
								 ref={register({ required: true })}
							  />
							  {errors.password && (
								 <small className="text-danger">This field is required</small>
							  )}
						   </div>
						   <button type="submit" className="btn btn-danger mt-3">
							  Đăng nhập
						   </button>
						</form>
					 </div>
				  </div>
			   )
			   : <Redirect to="/" />
		 }
	  </>
   );
}
