import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Loading from "../../Loading";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";
import moment from "moment";
const style = {
  borderTop: "1px solid #bbbbbb"
}


export default function AdditionalNew() {
  const [newsReel, setNewsReel] = useState([]);
  const [newsEntertainment, setNewsEntertainment] = useState([]);

  useEffect(() => {
    const fetchNewsReelData = async () => {
      const res = await axios.get("/news/newsReels", {
        params: { newsId: "5dbe935fd84e1413ac50c2bc" }
      });
      const { data } = res.data;

      setNewsReel(data);
    };

    const fetchNewsEntertainmentData = async () => {
      const res = await axios.get("/news/newsEntertainments", {
        params: { newsId: "5dd4e90432e5ba1e1770a95f" }
      });
      const { data } = res.data;

      setNewsEntertainment(data);
    };

    fetchNewsReelData();
    fetchNewsEntertainmentData();
  }, []);

  return (
    <React.Fragment>
      <h3 className="mb-3 text-red font-weight pt-3" style={style}>
        Thời sự
      </h3>
      <div className="col-lg-12 p-1">
        <div className="row">
          {newsReel ? (
            newsReel.map((item, index) => (
              <Link to={`/${hanldeUrlPretty(item.title)}/${item._id}`} key={index} className="additonal-new p-3 bg-white rounded text-decoration-none col-lg-5 m-2 text-color" target="_blank" rel="noopener noreferrer" >
                <div className="other-new__image border border-secondary">
                  <img
                    src={item.content === "" ? item.articlePicture : `/uploads/news/${item.articlePicture}`}
                    alt={item.title}
                  />
                </div>
                <div className="other-new__info">
                  <h4 className="other-new__title">{item.title}</h4>
                  <i className="mdi mdi-av-timer" /> {moment(item.dateCreate).format("DD-MM-YYYY")} -{" "}
									<i className="mdi mdi-eye" /> {item.view}
									<br></br>
									{item.source && (<span className="news-source-title"> Nguồn: {item.source}</span>)}
                </div>
              </Link>
            ))
          ) : (
            <Loading />
          )}
        </div>
      </div>
      <h3 className="mb-3 text-red font-weight pt-3" style={style}>
        Giải trí
      </h3>
      <div className="col-lg-12 p-1">
        <div className="row">
          {newsEntertainment
            ? newsEntertainment.map((item, index) => (
              <Link to={`/${hanldeUrlPretty(item.title)}/${item._id}`} key={index} className="additonal-new p-3 bg-white rounded text-decoration-none col-lg-5 m-2 text-color" target="_blank" rel="noopener noreferrer" >
                <div className="other-new__image border border-secondary">
                  <img
                    src={item.content === "" ? item.articlePicture : `/uploads/news/${item.articlePicture}`}
                    alt={item.title}
                  />
                </div>
                <div className="other-new__info">
                  <h4 className="other-new__title ">{item.title}</h4>
                  <i className="mdi mdi-av-timer" /> {moment(item.dateCreate).format("DD-MM-YYYY")} -{" "}
									<i className="mdi mdi-eye" /> {item.view}
									<br></br>
									{item.source && (<span className="news-source-title"> Nguồn: {item.source}</span>)}
                </div>
              </Link>
            ))
            : null}
        </div>
      </div>
    </React.Fragment>
  );
}
