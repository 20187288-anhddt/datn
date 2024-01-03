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

export default function ProhibitedWords() {
    const [reset, setReset] = useState(true);
    const [IdDelete,setidDelete] = useState('');
    const [deleteDisplay, setDeleteDisplay] = useState(false);
    const [comments, setComments] = useState([]);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setMessage({ message: "" }));
        const fetchComments = async () => {
          const res = await axios.get("/comments/allComments");
          const data = res.data.data;
          setComments(data);
        };
        fetchComments();
      }, [dispatch, reset]);
    
      const cancelConfirm = () => {
        setDeleteDisplay(false)
      }
        // move to trash
        const deleteComment = async (id) => {
          try {
            const res = await axios.delete(`/comments/${id}`);
            const { code, message, data } = res.data;
        
            // Assuming you have Redux actions like setMessage and closeMessage
            dispatch(setMessage({ code, message }));
            dispatch(closeMessage());
        
            // Assuming reset is a state and setReset is a function to update the state
            setReset((prevReset) => !prevReset);
          } catch (error) {
            // Handle errors, e.g., display an error message
            console.error('Error deleting comment:', error);
            dispatch(setMessage({ code: 500, message: 'Server error' }));
            dispatch(closeMessage());
          }
        };
    
      const columns = [
        {
          Header: "ID bài báo",
          accessor: "news",
          sortable: true,
          filterable: true,
          maxWidth: 250,
          Cell: props => {
            return (<a href={`/details/${props.original.news}`}>{props.original._id}</a>)
          }
        },
        {
            Header: "Nội dung bình luận",
            accessor: "content",
            sortable: true,
            filterable: true,
          //   Cell: props => {
          //     return (<div style={{textAlign:"center"}}>{props.original.cateNews ? props.original.cateNews.name: ""}</div>)
          //   }
          },
        {
          Header: "Tác giả bình luận",
          accessor: "createdBy.username",
          sortable: true,
          filterable: true,
          maxWidth: 150,
        },
        {
          Header: "Thời gian bình luận",
          accessor: "date",
          sortable: true,
          filterable: true,
          maxWidth: 220,
          Cell: props => {
            return (<div style={{textAlign:"center"}}>{moment(Date.parse(props.original.date)).format('YYYY-MM-DD HH:mm:ss')}</div>)
          }
        },
        {
          Header: "Hành động",
          filterable: false,
          sortable: false,
          maxWidth: 150,
          className: "text-center",
          Cell: props => {
            return (
              <div>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  title="Xóa bình luận"
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
              Danh sách các bình luận 
            </h3>
            <nav aria-label="breadcrumb">
          <ul className="breadcrumb">
            <li className="breadcrumb-item active" aria-current="page">
              <span />
              <Link
                to={`/admin/ProhibitedWords`}
                className="btn btn-warning btn-sm mr-1"
                title="Thêm mới bài báo"
              >
                <i className="mdi mdi-table-add"> Thêm mới từ cấm chat</i>
              </Link>
            </li>
          </ul>
        </nav>
          </div>
          <div className="row" style={{ padding:"0px 30px"}}>
            <div className="col-xl-12">
              <Message />
            </div>
            <div className="col-xl-12 grid-margin stretch-card">
              <ReactTable
                columns={columns}
                data={comments}
                filterable
                defaultPageSize={15}
                className="table mt-3"
              />
            </div>
          </div>
          {deleteDisplay && <Confirm
            callBackCancel = {cancelConfirm}
            callBackDelete = {() => {
            deleteComment(IdDelete);
              cancelConfirm();
            }}
          /> }
    
        </div>
      );
    }
    