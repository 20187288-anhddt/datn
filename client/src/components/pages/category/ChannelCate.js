import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getUsers } from "../../../actions/user.action";
import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../UrlPretty";

  
export default function ChannelCate() {
  const appState = useSelector(state => state);
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(getUsers());
    
  }, [dispatch]);

  const users = React.useMemo(() => {
    return appState.users.users;
  }, [appState.users.users]);

  return (
    <React.Fragment>
      <div>
        <center><h4 className="mb-2 text-red font-weight pt-4" style={{ fontSize: '20px' }}>Nhà báo nổi bật</h4></center>
        {users ? (
          users.slice(0,10).map((user, index) => (
            <Link
              to={`/channel/${user.username && hanldeUrlPretty(user.username)}/${user._id}`}
              key={index}
              className="channel p-1 bg-white rounded text-decoration-none text-dark"
            >
              <div className="channel__image rounded-sm" style = {{borderTop: "1px solid #bbbbbb"}}>
                <img src={`/uploads/users/${user.image}`} alt={user.username} />
              </div>
              <div className="channel__info">
                <h5 className="channel__title m-0 font-weight">
                  {user.username}
                </h5>
                <p className="channel__follow text-secondary m-0">
                  Số người theo dõi : {user.follow}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <BoxLoadingItem />
        )}
      </div>
    </React.Fragment>
  );
}