import React from "react";
import axios from "axios";
import {useForm} from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../../../../actions/message.action";
import Message from "../../Message";

export default function AddCategory() {
  const { register, handleSubmit, errors } = useForm();
  const appState = useSelector(state => state);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setMessage({ message: "" }));
  }, [dispatch]);

  const onSubmit = async data => {
    const dataCate = {
      category: data.category,
      createdBy: appState.users.data._id
    };

    try {
      const res = await axios.post('/cateNews', dataCate);
      const { code, message } = res.data;


      dispatch(setMessage({ code, message }));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-danger text-white mr-2">
            <i className="mdi mdi-format-list-bulleted" />
          </span>
          Thêm mới danh mục
        </h3>
      </div>
      <div className="row" style={{padding:"0px 30px"}}>
        <div className="col-xl-12 grid-margin stretch-card">
          <form onSubmit={handleSubmit(onSubmit)} className="w-100">
            <Message />
            <div className="form-group">
              <input
                type="text"
                name="category"
                style={{ border: `${errors.category ? "1px solid red" : ""}` }}
                className="form-control"
                placeholder="Thêm mới danh mục..."
                ref={register({ required: true })}
              />
              {errors.category && (
                <small className="text-danger">Bạn cần nhập tên danh mục</small>
              )}
            </div>
            <button type="submit" className="btn btn-danger bety-btn">
              Thêm
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
