import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { getNews } from "../../../actions/new.action";
import moment from "moment";
import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";


export default function FeaturedNew() {
  const dispatch = useDispatch();
  const appState = useSelector(state => state);

  React.useEffect(() => {
    dispatch(getNews());
  }, [dispatch]);

  const featured = useMemo(() => {
    return appState.news.data;
  }, [appState.news.data]);

  return (
    <React.Fragment>
      {featured
        ? featured.map((item, index) => (
          <Link to={`/${hanldeUrlPretty(item.title)}/${item._id}`} key={index} className="featured-new p-3 bg-white rounded text-decoration-none" target="_blank" rel="noopener noreferrer" >
            <div className="featured-new__image border border-secondary">
              <img
                src={item.content === "" ? item.articlePicture : `/uploads/news/${item.articlePicture}`}
                alt={item.title}
              />
            </div>
            <div className="featured-new__info">
              <h4 className="featured-new__title">{item.title}</h4>
              <i className="mdi mdi-av-timer" /> {moment(item.dateCreate).format("DD-MM-YYYY")} -{" "}
              <i className="mdi mdi-eye" /> {item.view}
              <br></br>
              {item.source && (<span className="news-source-title"> Nguồn: {item.source}</span>)}
            </div>
          </Link>
        ))
        : (<BoxLoadingItem />)}
    </React.Fragment>
  );
}
