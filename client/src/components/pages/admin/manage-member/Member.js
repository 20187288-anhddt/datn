import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactTable from "react-table-v6"
import 'react-table-v6/react-table.css'

import { setMessage } from "../../../../actions/message.action";
import { useDispatch } from "react-redux";

import Message from "../../Message";
import { closeMessage } from "../../closeMessage";

export default function Member() {
  const [users, setUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setMessage({ message: "" }));
    const fetchUsers = async () => {
      const res = await axios.get("/users");
      const datas = res.data.data;
      setUsers(datas);
      setUsersData(datas);
    };

    fetchUsers();
  }, [dispatch]);

  const handleChangeRole = async (id, value) => {
    const userExist = users.find(item => item._id === id);
    if (!userExist)
      return
    const res = await axios.put(`/users/updateRole/${id}`, { role: value });
    const { code, message, data } = res.data;
    setUsers(data);
    setUsersData(data);
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
  };

  // locked user
  const handleLockUser = async (id, isDelete) => {
    const userExist = users.find(item => item._id === id);
    if (!userExist)
      return
    const res = await axios.post(`/users/locked/${id}`, {
      isDelete: !isDelete
    });
    const { code, message, data } = res.data;
    setUsers(data);
    setUsersData(data);
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
  };

  // delete user
  const handleDeleteUser = async (id) => {
    const userExist = users.find(item => item._id === id);
    if (!userExist)
      return
    const res = await axios.delete(`/users/${id}`);
    const { code, message, data } = res.data;
    setUsers(data);
    setUsersData(data);
    dispatch(setMessage({ code, message }));
    dispatch(closeMessage());
  }

  // filter ROLE
  const hanldeFilterRole = (e) => {
    const role = e.target.value;
    if (role === "all") {
      setUsersData(users);
    } else {
      const rs = users.filter(user => user.role === role);
      setUsersData(rs);
    }
  };

  const columns = [
    {
      Header: "AVATAR",
      accessor: "image",
      sortable: false,
      filterable: false,
      maxWidth: 100,
      maxHeight: 100,
      Cell: props => {
        return (
          <div
            style={{
              maxHeight: "100px",
              width: "100%",
              overflow: "hidden"
            }}
          >
            <img
              src={`/uploads/users/${props.original.image}`}
              style={{ maxWidth: "100%", transform: "scale(1.5)" }}
              alt="avatar"
            />
          </div>
        );
      }
    },
    {
      Header: "TÊN",
      accessor: "username",
      sortable: true
    },
    {
      Header: "EMAIL",
      accessor: "email",
      sortable: true
    },
    {
      Header: "ROLE",
      filterable: false,
      sortable: true,
      Cell: props => {
        return (
          <React.Fragment>
            <div className="form-group">
              <span className="d-inline-block">
                <select
                  name="role"
                  className="form-control"
                  onChange={e =>
                    handleChangeRole(props.original._id, e.target.value)
                  }
                  value={props.original.role}
                >
                  <option value="admin">admin</option>
                  <option value="customer">customer</option>
                </select>
              </span>
              {props.original.isDelete ? (
                <i className="mdi mdi-account-off text-danger"></i>
              ) : (
                <i className="mdi mdi-account-check text-success"></i>
              )}
            </div>
          </React.Fragment>
        );
      }
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
              onClick={() =>
                handleLockUser(props.original._id, props.original.isDelete)
              }
              type="button"
              className={
                props.original.isDelete
                  ? "btn btn-success btn-sm mr-1"
                  : "btn btn-warning btn-sm mr-1"
              }
              title={
                props.original.isDelete ? "Mở khóa tài khoản" : "Khóa tài khoản"
              }
            >
              {props.original.isDelete ? (
                <i className="mdi mdi-account-check"></i>
              ) : (
                <i className="mdi mdi-account-off"></i>
              )}
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              title="Xóa tài khoản"
              onClick={handleDeleteUser}
            >
              <i className="mdi mdi-account-remove"></i>
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
            <i className="mdi mdi-account" />
          </span>
          Quản lý người dùng
        </h3>
      </div>
      <div className="row">
        <div className="col-xl-12 stretch-card" style={{ padding: "0px 30px" }}>
          <div className="form-group w-100" >
            <label>Lọc người dùng:</label>
            <select onClick={hanldeFilterRole} className="form-control form-control-sm">
              <option value="all">All</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
        <div className="col-xl-12">
          <Message />
        </div>
        <div className="col-xl-12 grid-margin stretch-card" style={{ padding: "0px 30px" }}>
          <ReactTable
            columns={columns}
            data={usersData}
            filterable
            defaultPageSize={10}
            className="table mt-3 text-center"
          />
        </div>
      </div>
    </div>
  );
}
