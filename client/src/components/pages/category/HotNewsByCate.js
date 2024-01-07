import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { useSelector } from "react-redux";
import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";

const NewsOther = ({ match }) => {
  const [loading, setLoading] = useState(true);
  const appState = useSelector((state) => state);
  const [number, setNumber] = useState(8);
  const [newsOther, setNewsOther] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (match && match.params && match.params.id) {
          const res = await axios.get(`/news/categories/new/${match.params.id}`);
          setNewsOther(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [match]);

  return (
    <div className="position-relative">
      {loading ? (
        <BoxLoadingItem />
      ) : (
        newsOther.slice(0, 5).map((item, index) => (
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
      )}
    </div>
  );
};

export default NewsOther;
