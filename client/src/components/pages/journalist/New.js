import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";
import { setMessage } from "../../../actions/message.action";
import { useDispatch } from "react-redux";

import Message from "../Message";
import { closeMessage } from "../closeMessage";

export default function News() {
  const [news, setNews] = useState([]);
  const [amountTrash, setAmountTrash] = useState(0);
  const [total, setTotal] = useState(0);
  const [notApproved, setNotApproved] = useState(0);
  const [notPublished, setNotPublished] = useState(0);
  const [published, setPublished] = useState(0);
  const dispatch = useDispatch();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    // Clear previous messages
    dispatch(setMessage({ message: "" }));

    const fetchNews = async () => {
      if (userId) {
        try {
          const res = await axios.get(`/news/${userId}`);
          const data = res.data.data;

          function getData(property) {
            return data.filter((v) => v.status === property);
          }

          const notApproved = getData("undefined");
          const notPublished = getData("edited");
          const published = getData("published");

          setNews(data);
          setTotal(data.length);
          setNotApproved(notApproved.length);
          setNotPublished(notPublished.length);
          setPublished(published.length);
        } catch (error) {
          console.error("Error fetching news:", error);
        }
      }
    };

    const fetchTrash = async () => {
      try {
        const res = await axios.get(`/news/trash/${userId}`);
        const data = res.data.data;

        if (data) {
          setAmountTrash(data.length);
        }
      } catch (error) {
        console.error("Error fetching trash:", error);
      }
    };

    // Fetch news and trash data on component mount
    fetchNews();
    fetchTrash();
  }, [dispatch, userId]);

  // Move to trash
  const hanldeMoveToTrash = async (id) => {
    try {
      const res = await axios.put(`/news/trash/${id}`);
      const { code, message, data } = res.data;

      const news = data.filter((v) => !v.isDelete && v.createdBy._id === userId);
      const amountTrash = data.filter((v) => v.isDelete && v.createdBy._id === userId);

      setNews(news);
      setAmountTrash(amountTrash.length);
      dispatch(setMessage({ code, message }));
      dispatch(closeMessage());
    } catch (error) {
      console.error("Error moving to trash:", error);
    }
  };

  // Give up draft
  const handleGiveUpDraft = async (id) => {
    try {
      const res = await axios.put(`/news/giveUpDraft/${id}`);
      const { code, message, data } = res.data;

      const news = data.filter((v) => !v.isDelete && v.createdBy._id === userId);

      setNews(news);
      dispatch(setMessage({ code, message }));
      dispatch(closeMessage());
    } catch (error) {
      console.error("Error giving up draft:", error);
    }
  };

  // Save draft
  const handleSaveDraft = async (id) => {
    try {
      const res = await axios.put(`/news/saveDraft/${id}`);
      const { code, message, data } = res.data;

      const news = data.filter((v) => !v.isDelete && v.createdBy._id === userId);

      setNews(news);
      dispatch(setMessage({ code, message }));
      dispatch(closeMessage());
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Define columns for the ReactTable
  const columns = [
    {
      Header: "TÊN BÀI VIẾT",
      accessor: "title",
      sortable: true,
      filterable: true,
    },
    {
      Header: "STATUS",
      accessor: "status",
      sortable: true,
      maxWidth: 200,
      className: "text-center",
      Cell: (props) => {
        return (
          <>
            <span
              className={
                props.original.status === "undefined"
                  ? "badge badge-secondary"
                  : props.original.status === "edited"
                  ? "badge badge-info"
                  : props.original.status === "draft"||props.original.status === "unpublished"
                  ? "badge badge-dark"
                  : "badge badge-success"
              }
            >
              {props.original.status}
            </span>
            <br />
            {props.original.status === "draft" ? (
              <button onClick={() => handleGiveUpDraft(props.original._id)} className="btn btn-link">
                Xóa nháp
              </button>
            ) : props.original.status === "new" ? (
              <button onClick={() => handleSaveDraft(props.original._id)} className="btn btn-link">
                Lưu nháp
              </button>
            ) : null}
          </>
        );
      },
    },
    {
      Header: "ACTION",
      filterable: false,
      sortable: false,
      maxWidth: 200,
      className: "text-center",
      Cell: (props) => {
        return (
          <div>
            <Link
              to={`/admin/new/${props.original._id}`}
              className="btn btn-warning btn-sm mr-1"
              title="Sửa bài viết"
            >
              <i className="mdi mdi-table-edit"></i>
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              title="Bỏ bài viết"
              onClick={() => hanldeMoveToTrash(props.original._id)}
            >
              <i className="mdi mdi-delete"></i>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-danger text-white mr-2">
            <i className="mdi mdi-view-list" />
          </span>
          News
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
        <div className="col-xl-12">
          <Message />
        </div>
        <div className="col-xl-12 stretch-card">
          <div className="border-bottom border-secondary text-center w-100">
            <Link to="/admin/trash" className="btn btn-link text-dark pl-0">
              <i className="mdi mdi-delete-variant" /> Trash
              <span className="badge badge-dark ml-1">{amountTrash}</span>
              <span className="sr-only">unread messages</span>
            </Link>
            <button className="btn btn-link text-dark pl-0 cursor">
              Tổng tin
              <span className="badge badge-danger ml-1">{total}</span>
              <span className="sr-only">unread messages</span>
            </button>
            <button className="btn btn-link text-dark pl-0 cursor">
              Tin chưa phê duyệt
              <span className="badge badge-secondary ml-1">{notApproved}</span>
              <span className="sr-only">unread messages</span>
            </button>
            <button className="btn btn-link text-dark pl-0 cursor">
              Tin chưa pushlish
              <span className="badge badge-info ml-1">{notPublished}</span>
              <span className="sr-only">unread messages</span>
            </button>
            <button className="btn btn-link text-dark pl-0 cursor">
              Tin đã pushlish
              <span className="badge badge-success ml-1">{published}</span>
              <span className="sr-only">unread messages</span>
            </button>
          </div>
        </div>
        <div className="col-xl-12 grid-margin stretch-card">
          {/* ReactTable component */}
          <ReactTable
            columns={columns}
            data={news}
            filterable
            defaultPageSize={10}
            noDataText={"Please wait..."}
            className="table mt-3"
          />
        </div>
      </div>
    </div>
  );
}
