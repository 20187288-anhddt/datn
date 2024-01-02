import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../../../actions/user.action";
import { setMessage } from "../../../actions/message.action";
import { closeMessage } from "../closeMessage";

const Information = () => {
  const [users, setUsers] = useState("");
  const [loading, setLoading] = useState(false);
  const appState = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (appState.users.data) {
      setUsers(appState.users.data);
    }
  }, [appState.users.data]);

  const hanldeChangeUpload = async (e) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const res = await axios.put(`/login/uploadAvatar/${users._id}`, formData);

      const { username, email, role, image, _id } = res.data.data;
      dispatch(addUser({ username, email, role, image, _id }));
      dispatch(setMessage({ code: res.data.code, message: res.data.message }));
      dispatch(closeMessage());
    } catch (error) {
      console.error(error);
      dispatch(setMessage({ code: 500, message: "Internal Server Error" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center shadow rounded p-1">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <img
            src={`/uploads/users/${users.image || "avatar-default.jpg"}`}
            className="avatar img-circle img-thumbnail"
            alt="avatar"
          />
          <h6>Cập nhật ảnh đại diện ... </h6>
          <div className="custom-file mb-3">
            <input
              type="file"
              className="custom-file-input"
              id="customFile"
              name="filename"
              onChange={hanldeChangeUpload}
            />
            <label className="custom-file-label" htmlFor="customFile">
              Chọn ảnh từ thiết bị ...
            </label>
          </div>
        </>
      )}
    </div>
  );
};

export default Information;
