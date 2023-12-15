import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import { setMessage } from "../../../../actions/message.action";
import Message from "../../Message";
import { closeMessage } from "../../closeMessage";

export default function AddNews() {
  const [content, setContent] = useState(null);
  const [tag, setTag] = useState("");
  const [tagAlready, setTagAlready] = useState("");
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, errors } = useForm();
  const appState = useSelector(state => state);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMessage({ message: "" }));

    const fetchCategories = async () => {
      const res = await axios.get("/cateNews");
      const data = res.data.data;

      setCategories(data);
    };

    fetchCategories();
  }, [dispatch]);

  const hanldChangeTag = e => {
    setTag(e.target.value);
  };

  const hanldAddTag = () => {
    if (tag === "" || tag === null) {
      setTagAlready("Bạn cần nhập tag");
      return;
    }
    const tagExist = tags.filter(v => v.toLowerCase() === tag.toLowerCase());
    if (tagExist.length > 0) {
      setTagAlready("Tag đã tồn tại");
      return;
    } 
    setTags([...tags, tag]);
    setTagAlready("");
  };

  // remove tag
  const hanldeRemoveTag = index => {
    const newTag = [...tags];
    newTag.splice(index, 1);

    setTags(newTag);
  };

  const hanldChangeContent = content => {
    setContent(content);
  };

  const hanldeChangeUpload = e => {
    setFile(e.target.files[0]);
  };


  const onSunmit = async data => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("cateNews", data.category);
      formData.append("content", content || "");
      formData.append("tags", JSON.stringify(tags));
      formData.append("createdBy", appState.users.data._id);
      formData.append("file", file);
      formData.append("status", data.status);
      formData.append("sapo", data.sapo || "");
      formData.append("originalLink", data.originalLink || "");

      const res = await axios.post("/news", formData);
      const { code, message } = res.data;
      console.log(data)

      dispatch(setMessage({ code, message }));
      dispatch(closeMessage());
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
          Thêm bài báo
        </h3>
      </div>
      <div className="row" style={{ padding: "0px 30px" }}>
        <div className="col-xl-12 grid-margin">
          <form onSubmit={handleSubmit(onSunmit)} className="w-100">
            <Message />
            <div className="form-group">
              <label>Tiêu đề:</label>
              <input
                type="text"
                name="title"
                style={{ border: `${errors.email ? "1px solid red" : ""}` }}
                className="form-control"
                placeholder="Nhập tiêu đề bài báo..."
                ref={register({ required: true })}
              />
              {errors.title && (
                <small className="text-danger">This field is required</small>
              )}
            </div>
            <div className="form-group">
              <label>Sapo:</label>
              <input
                type="text"
                name="sapo"
                className="form-control"
                placeholder="Nhập Sapo"
                ref = {register()}
              />
            </div>
            <div className="form-group">
              <label>Nội dung:</label>
              <CKEditor
                className="w-100 mb-2"
                editor={ClassicEditor}
                data=""
                config={{
                  ckfinder: {
                    uploadUrl:
                      "/news/upload?command=QuickUpload&type=Files&responseType=json"
                  }
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  hanldChangeContent(data);
                }}
              />
            </div>
            <div className="form-group">
              <label>Thể loại:</label>
              <select
                name="category"
                className="form-control"
                style={{ border: `${errors.category ? "1px solid red" : ""}` }}
                ref={register({ required: true })}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tags:</label>
              <input
                type="text"
                name="tags"
                className="form-control"
                placeholder="Enter new tag..."
                value={tag || []}
                onChange={hanldChangeTag}
              />
              <div className="mt-2">
                <u className="mr-2">Tags:</u>
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <span className="badge badge-success mr-1 tag" key={index}>
                      {tag}
                      <i
                        onClick={() => hanldeRemoveTag(index)}
                        className="mdi mdi-close-circle-outline tag__close text-dangder"
                      />
                    </span>
                  ))
                ) : (
                  <small className="text-secondary">
                    Bài viết của bạn chưa có tags nào
                  </small>
                )}
              </div>
              {tagAlready && (
                <div>
                  <small className="text-danger">{tagAlready}</small>
                </div>
              )}
            </div>
            <div className="form-group">
              <button
                onClick={hanldAddTag}
                type="button"
                className="btn btn-danger btn-sm"
              >
                Thêm tag
              </button>
            </div>
            <div className="form-group">
              <label>Ảnh đại diện:</label>
              <div className="custom-file mb-3">
                <input
                  type="file"
                  className="custom-file-input"
                  style={{ border: `${errors.email ? "1px solid red" : ""}` }}
                  id="customFile"
                  name="filename"
                  onChange={hanldeChangeUpload}
                  ref={register({ required: true })}
                />
                <label
                  style={{ height: "calc(1.5em + 0.75rem + 0px)" }}
                  className="custom-file-label bd-none bdr-none"
                  htmlFor="customFile"
                >
                  Choose file
                </label>
              </div>
              {errors.filename && (
                <small className="text-danger">This field is required</small>
              )}
            </div>
            <div className="form-group">
              <label>Trạng thái:</label>
              <select
                name="status"
                className="form-control"
                ref={register()}
              >
                <option value="published">Xuất bản</option>
                <option value="unpublished">Chưa xuất bản</option>
              </select>
            </div>
            <div className="form-group">
              <label>Đường dẫn bài viết gốc (Nếu có):</label>
              <input
                type="text"
                name="originalLink"
                className="form-control"
                ref={register()}
              />
            </div>
            <button type="submit" className="btn btn-danger bety-btn">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
