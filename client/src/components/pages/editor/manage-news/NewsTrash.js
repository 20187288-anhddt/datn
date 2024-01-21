import React from "react";
import axios from "axios";
import ReactTable from "react-table-v6";
import { setMessage } from "../../../../actions/message.action";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import Message from "../../Message";
import { closeMessage } from "../../closeMessage";
import Confirm from "../Confirm";

export default function NewsTrash() {
  const [deleteDisplay, setDeleteDisplay] = useState(false);
  const [IdDelete,setidDelete] = useState('');
  const [news, setNews] = useState([]);
  const dispatch = useDispatch();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    dispatch(setMessage({ message: "" }));
    const fetchNews = async () => {
      const res = await axios.get(`/news/trash`);
      const data = res.data.data;
      setNews(data);
    };
    fetchNews();
  }, [dispatch, userId]);

  const cancelConfirm = () => {
    setDeleteDisplay(false)
  }

  // delete
  const hanldeDelete = async id => {
    const res = await axios.delete(`/news/${id}`);
    const { code, message, data } = res.data;
    const newsList = await data.filter(v => v.isDelete === true);
    setNews(newsList);
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
  };

  // restore
  const hanldeRestore = async id => {
    const res = await axios.put(`/news/restore/${id}`);
    const { code, message, data } = res.data;
    const newsList = await data.filter(v => v.isDelete === true);
    setNews(newsList);
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
  };

  const columns = [
    {
      Header: "TÊN BÀI VIẾT",
      accessor: "title",
      sortable: true,
      filterable: true
    },
    {
      Header: "STATUS",
      accessor: "status",
      sortable: true,
      className: "text-center",
      maxWidth: 200,
      Cell: props => {
        return (
          <span
            className="badge badge-dark"
          >
            {props.original.status}
          </span>
        )
      }
    },
    {
      Header: "ACTION",
      filterable: false,
      sortable: false,
      className: "text-center",
      maxWidth: 200,
      Cell: props => {
        return (
          <div>
            <button
              type="button"
              className="btn btn-warning btn-sm mr-1"
              title="Khôi phục lại bài viết"
              onClick={() => hanldeRestore(props.original._id)}
            >
              <i className="mdi mdi-backup-restore"></i>
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              title="Xóa bài viết vĩnh viễn"
              onClick={() => {
                setDeleteDisplay(true);
                setidDelete(props.original._id);
              }
              }
            >
              <i className="mdi mdi-delete"></i>
            </button>
          </div>
        );
      }
    }
  ];
  return (
    
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-danger text-white mr-2">
            <i className="mdi mdi-view-list" />
          </span>
          Trash
        </h3>
      
      <nav aria-label="breadcrumb">
          <ul className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              <span />
              <Link
                to={`/admin/news/add`}
                className="btn btn-warning btn-sm mr-1"
                title="Thêm mới bài báo"
              >
                <i className="mdi mdi-table-add">Thêm mới bài báo</i>
              </Link>
            </li>
          </ul>
        </nav>
        </div>
      <div className="row" style={{ padding: "0px 30px" }}>
      <div className="col-xl-12 stretch-card">
          <div className="border-bottom border-secondary text-center w-100">
          <Link to="/admin/news/trash" className="btn btn-link text-dark pl-0">
              <i className="mdi mdi-delete-variant" /> Thùng rác
              {/* <span className="badge badge-secondary ml-1">{amountTrash}</span> */}
              <span className="sr-only">unread messages</span>
          </Link>
          <Link to="/admin/news/" className="btn btn-link text-dark pl-0">
              <i className="mdi mdi-table-edit text-dark pl-0 cursor" /> Danh sách bài báo
              {/* <span className="badge badge-secondary ml-1">{amountTrash}</span> */}
              <span className="sr-only">unread messages</span>
          </Link>
          </div>
</div>
        <div className="col-xl-12">
          <Message />
        </div>
        <div className="col-xl-12 grid-margin stretch-card">
          <ReactTable
            columns={columns}
            data={news}
            filterable
            defaultPageSize={5}
            className="table mt-3"
          />
        </div>
      </div>
      {deleteDisplay && <Confirm
        callBackCancel={() => {
          cancelConfirm();
        }}
        callBackDelete={() => {
          hanldeDelete(IdDelete);
          cancelConfirm();
        }}
      />}
    </div>
  );
}
