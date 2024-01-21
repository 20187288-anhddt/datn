import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import axios from "axios";
import Message from "../Message";
import { setMessage } from "../../../actions/message.action";
import { closeMessage } from "../closeMessage";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // Lấy token từ URL
  const { register, handleSubmit, errors } = useForm();
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data);
  
    try {
      const res = await axios.post(`/login/reset-password/${token}`, data);
  
      if (res.data.code !== undefined && res.data.code !== 0) {
        dispatch(setMessage({ code: 200, message: "Đặt lại mật khẩu thành công" }));
        setErrorMessage("Đặt lại mật khẩu thành công");
        dispatch(closeMessage());
      } else {
        dispatch(setMessage({ code: res.data.code, message: "Đặt lại mật khẩu thất bại" }));
        setErrorMessage("Đặt lại mật khẩu thất bại");
        dispatch(closeMessage());
      }
    } catch (error) {
      console.error("Có lỗi khi đặt lại mật khẩu:", error);
      setErrorMessage("Đặt lại mật khẩu thất bại");
    }
  };
  

  return (
    <>
      <Helmet>
        <title>Đặt lại mật khẩu - BkNews</title>
        <meta name="description" content="Đặt lại mật khẩu cho tài khoản BkNews" />
      </Helmet>
      <div className="container">
        <div className="row" style={{ height: "85vh" }}>
          <form className="col-xl-6 m-auto" onSubmit={handleSubmit(onSubmit)}>
            <Message />
            <h1 className="mb-4">Đặt Lại Mật Khẩu</h1>
            <div className="form-group">
              <input
                type="password"
                name="newPassword"
                className="form-control"
                placeholder="Nhập mật khẩu mới..."
                ref={register({ required: true })}
              />
              {errors.newPassword && <small className="text-danger">Vui lòng nhập mật khẩu mới</small>}
            </div>
            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Xác nhận mật khẩu mới..."
                ref={register({
                  required: true,
                //   validate: (value) => value === getValues("newPassword") || "Mật khẩu xác nhận không khớp",
                })}
              />
              {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword.message}</small>}
            </div>
            {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
            <button type="submit" className="btn btn-danger mt-3">
              Đặt lại mật khẩu
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
