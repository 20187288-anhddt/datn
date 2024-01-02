import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { setMessage } from "../../../../actions/message.action";
import Message from "../../Message";

export default function AddCategory() {
  const { register, handleSubmit, errors } = useForm();
  const appState = useSelector((state) => state);
  const dispatch = useDispatch();
  const createdBy = appState.users.data ? appState.users.data._id : null;
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    dispatch(setMessage({ message: "" }));
  }, [dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("/cateNews/cateNews");
      const data = res.data.data;
      setCategories(data);
    };

    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    const dataCate = {
      subCategory: data.subCategory,
      parentCategoryId: data.category,
      createdBy: createdBy,
    };

    try {
      const res = await axios.post("/cateNews/subCateNews", dataCate);
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
      <div className="row" style={{ padding: "0px 30px" }}>
        <div className="col-xl-12 grid-margin stretch-card">
          <form onSubmit={handleSubmit(onSubmit)} className="w-100">
            <Message />
            <div className="form-group">
            <label>Tên danh mục:</label>
              <input
                type="text"
                name="subCategory"
                style={{
                  border: `${errors.subCategory ? "1px solid red" : ""}`,
                }}
                className="form-control"
                placeholder="Nhập tên danh mục ..."
                ref={register({ required: true })}
              />
              {errors.subCategory && (
                <small className="text-danger">
                  Bạn cần nhập tên danh mục
                </small>
              )}
            </div>
            <div className="form-group">
              <label>Thể loại:</label>
              <select
                name="category"
                className="form-control"
                style={{
                  border: `${errors.category ? "1px solid red" : ""}`,
                }}
                ref={register({ required: true })}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              >
                <option value="" >
                  -- Chọn thể loại --
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
