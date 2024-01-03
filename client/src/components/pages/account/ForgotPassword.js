import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha"; // Import ReCAPTCHA
import Message from "../Message";

const ForgotPassword = () => {
  const { register, handleSubmit, errors, setValue, getValues } = useForm();
  const [message, setMessage] = useState(null);

  const onSubmit = async (data) => {
	console.log("Form submitted with data:", data); // Add this line
  
	try {
	  // Validate reCAPTCHA
	  const recaptchaValue = getValues("recaptcha");
	//   if (!recaptchaValue) {
	// 	setMessage({ code: 400, message: "Vui lòng xác minh bạn không phải là robot." });
	// 	return;
	//   }
  
	  // Continue with your existing code for forgot password
	  const res = await axios.post("/login/forgot-password", data);
  
	  if (res.data.code === 200) {
		setMessage({ code: 200, message: res.data.message });
	  } else {
		setMessage({ code: res.data.code, message: res.data.message });
	  }
	} catch (error) {
	  console.error("Có lỗi khi yêu cầu quên mật khẩu:", error);
	}
  };
  


  return (
    <>
      <Helmet>
        <title>Quên mật khẩu - BkNews</title>
        <meta name="description" content="Yêu cầu đặt lại mật khẩu cho tài khoản BkNews" />
      </Helmet>
      <div className="container">
        <div className="row" style={{ height: "85vh" }}>
          <form className="col-xl-6 m-auto" onSubmit={handleSubmit(onSubmit)}>
            <Message message={message} />
            <h1 className="mb-4">Quên Mật Khẩu</h1>
            <div className="form-group">
              <input
                type="text"
                name="email"
                className="form-control"
                placeholder="Nhập địa chỉ email của bạn..."
                ref={register({ required: true })}
              />
              {errors.email && <small className="text-danger">Vui lòng nhập địa chỉ email</small>}
            </div>
            {/* reCAPTCHA */}
            <div className="mb-3">
              <ReCAPTCHA
                sitekey="6LfkU0QpAAAAAKb5u8UEu6KQjKNGIYaV3sztuf9s"
                onChange={(value) => setValue("recaptcha", value)}
              />
            </div>
            <button type="submit" className="btn btn-danger mt-3">
              Gửi yêu cầu
            </button>
            <div className="mt-2">
              {/* Liên kết "Quay lại" */}
              <Link to="/login"><i className="fa fa-arrow-left" aria-hidden="true"></i> Quay lại</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
