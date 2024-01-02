import React from "react";
import { Link, useHistory } from "react-router-dom";

export default function NotFound() {
  const history = useHistory();

  const goBack = () => {
    history.goBack();
  };

  return (
    <div className="page-wrap d-flex flex-row align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-12 text-center">
            <span className="display-1 d-block">404</span>
            <div className="mb-4 lead">
              Bài viết bạn đang truy cập không tồn tại hoặc có thể đã bị xóa
            </div>
            <button className="btn btn-link" onClick={goBack}>
            🔙 Quay lại trang trước 
            </button>
            {/* hoặc sử dụng <Link> để quay lại trang trước */}
            {/* <Link to="/" className="btn btn-link">
              Back to Home
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
}