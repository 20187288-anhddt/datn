import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { setMessage } from "../../../actions/message.action";
import Message from "../Message";
import { closeMessage } from "../closeMessage";

export default function AddNew() {
    const [content, setContent] = useState(null);
    const [tag, setTag] = useState("");
    const [tagAlready, setTagAlready] = useState("");
    const [tags, setTags] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [draft, setDraft] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const { register, handleSubmit, errors } = useForm();
    const appState = useSelector((state) => state);
    const dispatch = useDispatch();
    const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    dispatch(setMessage({ message: "" }));

    const fetchCategories = async () => {
      const res = await axios.get("/cateNews");
      const data = res.data.data;

      setCategories(data);
    };

    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("/cateNews");
      const data = res.data.data;
      setCategories(data);
    };
    fetchCategories();
  }, [dispatch]);

    useEffect(() => {
        const fetchSubCategories = async () => {
          if (selectedCategory) {
            const res = await axios.get(`/cateNews/${selectedCategory}/subcategories`);
            const data = res.data.data;
            setSubCategories(data);
          }
        };
    
        fetchSubCategories();
      }, [selectedCategory]);

  const hanldChangeTag = e => {
    setTag(e.target.value);
  };

  const hanldAddTag = () => {
    if (tag === "" || tag === null) {
      setTagAlready("Bạn cần nhập tag");
    } else {
      const tagExist = tags.filter(v => v.toLowerCase() === tag.toLowerCase());
      if (tagExist.length > 0) {
        setTagAlready("Tag đã tồn tại");
      } else {
        setTags([...tags, tag]);
        setTagAlready("");
      }
    }
  };

  const hanldeRemoveTag = index => {
    const newTag = [...tags];
    newTag.splice(index, 1);

    setTags(newTag);
  };

  const hanldChangeContent = content => {
    setContent(content);
  };

  const hanldeChangeUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          dataURL: reader.result,
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const hanldeChangeDraft = e => {
    setDraft(e.target.checked);
  };
  
  useEffect(() => {
    dispatch(setMessage({ message: "" }));

    const fetchCategories = async () => {
      const res = await axios.get("/cateNews");
      const data = res.data.data;

      setCategories(data);
    };

    fetchCategories();
  }, [dispatch]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get("/cateNews");
      const data = res.data.data;
      setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedCategory) {
        const res = await axios.get(`/cateNews/${selectedCategory}/subcategories`);
        const data = res.data.data;
        setSubCategories(data);
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);





  const onSunmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("cateNews", data.category);
      formData.append("subCateNews", data.subCategory);  // Thêm subCateNews vào formData
      formData.append("content", content || "");
      formData.append("tags", JSON.stringify(tags));
      formData.append("createdBy", appState.users.data._id);
      formData.append("file", file);
      formData.append("status", data.status);
      formData.append("sapo", data.sapo || "");
      formData.append("originalLink", data.originalLink || "");

      const res = await axios.post("/news", formData);
      const { code, message } = res.data;

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
        <nav aria-label="breadcrumb">
          <ul className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              <span />
              Overview
              <i className="mdi mdi-alert-circle-outline icon-sm text-danger align-middle" />
            </li>
          </ul>
        </nav>
      </div>
      <div className="row">
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
                placeholder="Enter new title..."
                ref={register({ required: true })}
              />
              {errors.title && (
                <small className="text-danger">Bạn phải điền đầy đủ thông tin...</small>
              )}
            </div>
            <div className="form-group">
              <label>Tóm tắt bài viết (Nếu bỏ trống trường này, hệ thống sẽ tự cập nhật nội dung tóm tắt bài viết):</label>
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
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
              >
                {categories.map((category, index) => (
                  <option key={index} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Thể loại nhỏ hơn:</label>
              <select
                name="subCategory"
                className="form-control"
                style={{ border: `${errors.subCategory ? "1px solid red" : ""}` }}
              >
                {subCategories.map((subCategory, index) => (
                  <option key={index} value={subCategory._id}>
                    {subCategory.name}
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
                value={tag || ""}
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
              {tagAlready ? (
                <div>
                  <small className="text-danger">{tagAlready}</small>
                </div>
              ) : (
                ""
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
        />
        <label
          style={{ height: "calc(1.5em + 0.75rem + 0px)" }}
          className="custom-file-label bd-none bdr-none"
          htmlFor="customFile"
        >
           {selectedFile ? selectedFile.name : "Choose file"}
        </label>
      </div>
      {selectedFile && (
        <div>
          <img
            src={selectedFile.dataURL}
            alt="Uploaded"
            style={{ maxWidth: '360px', maxHeight: '360px' }}
          />
        </div>
      )}
      {errors.filename && (
        <small className="text-danger">Bạn phải điền đầy đủ thông tin...</small>
      )}
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
            <div className="form-check mb-5">
              <input
                type="checkbox"
                className="form-check-input ml-0"
                id="draft"
                name="draft"
                value={draft}
                onChange={hanldeChangeDraft}
              />
              <label className="form-check-label" htmlFor="draft">
                Đánh dấu là nháp
              </label>
            </div>
            {draft ? (
              <button type="submit" className="btn btn-danger">
                Lưu vào nháp
              </button>
            ) : (
              <button type="submit" className="btn btn-danger">
                Gửi yêu cầu phê duyệt
              </button>      
            )
            }
            {loading && (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}