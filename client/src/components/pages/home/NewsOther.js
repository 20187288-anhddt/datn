import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

import { useDispatch, useSelector } from "react-redux";
import { getNewsOther } from "../../../actions/new.action";
import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";

export default function NewsOther() {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const appState = useSelector((state) => state);
  let number = 0;

  useEffect(() => {
    dispatch(getNewsOther(8));
  }, [dispatch]);

  const hanldeLoadMore = () => {
    if (appState.news.other) {
      loadMore();

      // xử lý ẩn/hiện khi click vào load more
      async function loadMore() {
        if (appState.news.other.length >= number) {
          setLoading(true);
          number = (await appState.news.other.length) + 5;
          await dispatch(getNewsOther(number));

          loadMore();
        } else {
          setLoading(false);
        }
      }
    }
  };

  const other = React.useMemo(() => {
    return appState.news.other;
  }, [appState.news.other]);

  return (
    <React.Fragment>
      <div className="position-relative">
        {other ? (
          other.map((item, index) => (
            <Link
              to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
              key={index}
              className="other-new p-3 bg-white rounded text-decoration-none"
              rel="noopener noreferrer"
            >
              <div className="other-new__image border border-secondary">
                <img
                  src={
                    item.originalLink !== ""
                      ? item.articlePicture
                      : `/uploads/news/${item.articlePicture}`
                  }
                  alt={item.title}
                />
              </div>
              <div className="other-new__info">
                <h4 className="other-new__title">{item.title}</h4>
                <p className="other-new__createby text-secondary">
                  <i className="mdi mdi-av-timer" />{" "}
                  {moment(item.dateCreate).format("HH:mm DD-MM-YYYY")} -{" "}
                  <i className="mdi mdi-eye" /> {item.view}
                  {item.source && (
                    <span className="news-source-title">
                      {" "}
                      Nguồn: {item.source}
                    </span>
                  )}
                  
                </p>
                {item.sapo && (
                  <span className="mx-auto">
                    {item.sapo.length > 180
                      ? `${item.sapo.substring(0, 200)}...`
                      : item.sapo}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <BoxLoadingItem />
        )}
        <div className="text-center">
          <button className="btn btn-light text-dark border" onClick={hanldeLoadMore}>
            Xem thêm{" "}
            {loading ? <i className="mdi mdi-loading mdi-spin" /> : null}
          </button>

          {/* <button className="btn btn-light text-dark font-weight-bold border">
  Xem thêm {loading ? <i className="mdi mdi-loading mdi-spin" /> : null}
</button> */}

        </div>
      </div>
    </React.Fragment>
  );
}
