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
		 const res = await axios.post("/login", data);

		 if (res.data.code === 200) {
			// luu token
			const tokenCode = res.data.token;
			localStorage.setItem("auth-token", tokenCode);

			// truyen user data vao global
			const { _id } = res.data.data;
			const userId = _id;
			const { code, message } = res.data;

			sessionStorage.setItem("userId", userId);
			localStorage.setItem("userId", userId);

			dispatch(addUser(res.data.data));
			dispatch(setMessage({ code, message }));
			dispatch(closeMessage({ code, message }));

			history.push("/");
		 }
		 const { code, message } = res.data;

		 dispatch(setMessage({ code, message }));
		 dispatch(closeMessage({ code, message }));
	  } catch (error) {
		 if (error) console.log("Have a problem", error);
	  }
   };

   return (
	  <>
		 <Helmet>
			<title>Đăng nhập - BNews kênh tin tức hàng đầu Việt Nam</title>
			<meta name="description" content="BNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
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
