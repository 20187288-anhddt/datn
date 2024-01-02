import React from "react";
import { useSelector } from "react-redux";

export default function Information() {
  const [users, setUsers] = React.useState(null);
  const appState = useSelector(state => state);

  React.useEffect(() => {
    // Chỉ cập nhật users nếu dữ liệu thay đổi
    if (appState.users.data && appState.users.data !== users) {
      setUsers(appState.users.data);
    }
  }, [appState.users.data, users]);

  return (
    <ul className="list-group shadow">
      <li className="list-group-item text-muted">
        Thông tin tài khoản : <i className="fa fa-dashboard fa-1x" />
      </li>
      {users && (
        <>
          <li className="list-group-item text-left">
            <span>
              <strong>👤 Username : </strong>
            </span>
            {users.username}
          </li>
          <li className="list-group-item text-left">
            <span>
              <strong>📧 Địa chỉ Email : </strong>
            </span>
            {users.email}
          </li>
          <li className="list-group-item text-left">
            <span>
              <strong>💼 Phân quyền : </strong>
            </span>
            {users.role}
          </li>
          <li className="list-group-item text-left">
            <span>
              <strong>🗓 Thời gian tham gia : </strong>
            </span>
            {users.dateCreated}
          </li>
        </>
      )}
    </ul>
  );
}
