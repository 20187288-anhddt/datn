import React, { useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReactTable from "react-table-v6";
import { setMessage } from "../../../../actions/message.action";
import { useDispatch } from "react-redux";
import 'react-table-v6/react-table.css'
import { closeMessage } from "../../closeMessage";
import Message from "../../Message";
import moment from "moment";
import Confirm from "../Confirm";
import { hanldeUrlPretty } from "../../../mixin/UrlPretty";

export default function NewsManagement() {
  const [reset, setReset] = useState(true);
  const [IdDelete,setidDelete] = useState('');
  const [deleteDisplay, setDeleteDisplay] = useState(false);
  const [news, setNews] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMessage({ message: "" }));
    const fetchNews = async () => {
      const res = await axios.get("/news");
      const data = res.data.data;
      setNews(data);
    };
    fetchNews();
  }, [dispatch, reset]);

  const cancelConfirm = () => {
    setDeleteDisplay(false)
  }

  // move to trash
  const hanldeTrash = async id => {
    const res = await axios.put(`/news/trash/${id}`);
    const { code, message, data } = res.data;
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
    setReset(!reset)
  };

  const columns = [
    {
      Header: "ID",
      accessor: "_id",
      sortable: true,
      filterable: true,
      maxWidth: 250,
      Cell: props => {
        return (<a href={`/${hanldeUrlPretty(props.original.title)}/${props.original._id}`}>{props.original._id}</a>)
      }
    },
    {
      Header: "TÊN BÀI VIẾT",
      accessor: "title",
      sortable: true,
      filterable: true
    },
    {
      Header: "Thể loại",
      accessor: "cateNews.name",
      sortable: true,
      filterable: true,
      maxWidth: 150,
      Cell: props => {
        return (<div style={{textAlign:"center"}}>{props.original.cateNews ? props.original.cateNews.name: ""}</div>)
      }
    },
    {
      Header: "Thời gian tạo",
      accessor: "dateCreate",
      sortable: true,
      filterable: true,
      maxWidth: 170,
      Cell: props => {
        return (<div style={{textAlign:"center"}}>{moment(Date.parse(props.original.dateCreate)).format('YYYY-MM-DD HH:mm:ss')}</div>)
      }
    },
    {
      Header: "STATUS",
      accessor: "status",
      sortable: true,
      className: "text-center",
      maxWidth: 100,
      Cell: props => {
        return (
          <span
            className={
              props.original.status === "published"
                ? "badge badge-success"
                : "badge badge-secondary"
            }
          >
            {props.original.status}
          </span>
        );
      }
    },
    {
      Header: "ACTION",
      filterable: false,
      sortable: false,
      maxWidth: 200,
      className: "text-center",
      Cell: props => {
        return (
          <div>
            <Link
              to={`/admin/news/${props.original._id}`}
              className="btn btn-warning btn-sm mr-1"
              title="Sửa bài viết"
            >
              <i className="mdi mdi-table-edit"></i>
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              title="Xóa bài viết"
              onClick={() => {
                setDeleteDisplay(true);
                setidDelete(props.original._id);
              }}
            >
              <i className="mdi mdi-table-remove"></i>
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
          Danh sách các bài báo 
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
      <div className="row" style={{ padding:"0px 30px"}}>
        <div className="col-xl-12 stretch-card">
          <div className="border-bottom border-secondary text-center w-100">
          <Link to="/admin/news/trash" className="btn btn-link text-dark pl-0">
              <i className="mdi mdi-delete-variant" /> Trash
              {/* <span className="badge badge-secondary ml-1">{amountTrash}</span> */}
              <span className="sr-only">unread messages</span>
          </Link>
            <div className="btn" style={{padding:"0px"}}>
            <i className="mdi mdi-table-edit text-dark pl-0 cursor" /> 
            &nbsp; Danh sách các bài báo
            </div>
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
            defaultPageSize={10}
            className="table mt-3"
          />
        </div>
      </div>
      {deleteDisplay && <Confirm
        callBackCancel = {cancelConfirm}
        callBackDelete = {() => {
          hanldeTrash(IdDelete);
          cancelConfirm();
        }}
      /> }

    </div>
  );
}
