import React from "react";
import axios from "axios";
import { useState } from "react";
import { setMessage } from "../../../../actions/message.action";
import { useDispatch } from "react-redux";
import ReactTable from "react-table-v6";
import 'react-table-v6/react-table.css'
import Confirm from "../Confirm";
import Message from "../../Message";

export default function CategoryTrash() {
  let [deleteDisplay, setDeleteDisplay] = useState(false);
  let [IdDelete, setidDelete] = useState('');
  const [categories, setCategories] = React.useState([]);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(setMessage({ message: "" }));
    const fetchCategories = async () => {
      const res = await axios.get("/cateNews/trash");
      const data = res.data.data;

      setCategories(data);
    };

    fetchCategories();
  }, [dispatch]);

  // delete category
  const hanldeDelete = async id => {
    const res = await axios.delete(`/cateNews/${id}`);

    const { code, message, data } = res.data;
    dispatch(setMessage({ code, message }));

    setCategories(data);
  };

  const cancelConfirm = () => {
    setDeleteDisplay(false)
  }

  // restore category
  const hanldeRestore = async id => {
    const res = await axios.put(`/cateNews/restore/${id}`);

    const { code, message, data } = res.data;
    dispatch(setMessage({ code, message }));

    setCategories(data);
  };

  const columns = [
    {
      Header: "TÊN",
      accessor: "name",
      sortable: true
    },
    {
      Header: "ACTION",
      filterable: false,
      sortable: false,
      maxWidth: 200,
      Cell: props => {
        return (
          <div>
            <button
              onClick={() => hanldeRestore(props.original._id)}
              type="button"
              className="btn btn-warning btn-sm mr-1"
              title="Restore"
            >
              <i className="mdi mdi-backup-restore"></i>
            </button>
            <button
              onClick={() => {
                setDeleteDisplay(true);
                setidDelete(props.original._id);
                // hanldeDelete(props.original._id)
              }
              }
              type="button"
              className="btn btn-danger btn-sm"
              title="Delete"
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
            <i className="mdi mdi-format-list-bulleted" />
          </span>
          Trash
        </h3>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <Message />
        </div>
        <div className="col-xl-12 grid-margin stretch-card w-100" style={{ padding: "0px 30px" }}>
          <ReactTable
            columns={columns}
            data={categories}
            filterable
            defaultPageSize={5}
            noDataText={"Please wait..."}
            className="table mt-3 text-center"
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
