import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";
import Loading from "../../Loading";

export default function OtherNews({ tags, newsByTag, newsHighlightId, highlightNew, categoryName }) {
  const [tagsOtherNews, setTagsOtherNews] = useState([]);
  const [newsByTagOtherNews, setNewsByTagOtherNews] = useState([]);
  const [generalNews, setGeneralNews] = useState([]);
  const [displayedNewsCount, setDisplayedNewsCount] = useState(20);

  useEffect(() => {
    if (newsHighlightId && newsByTag) {
      const otherNews = newsByTag.filter((v) => v._id !== newsHighlightId);
      setNewsByTagOtherNews(otherNews);
      setGeneralNews(otherNews.filter((news) => news.tag && news.tag.length === 0).slice(0, displayedNewsCount));
    }

    if (highlightNew && tags) {
      const highlightNewTags = highlightNew.tag;

      if (highlightNewTags) {
        const otherNewsTags = tags.filter((tag) => !highlightNewTags.includes(tag));
        setTagsOtherNews(otherNewsTags);
      }
    }
  }, [tags, newsByTag, newsHighlightId, highlightNew, displayedNewsCount]);

  const handleScroll = () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const pageHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= pageHeight) {
      // If the user has scrolled to the bottom, increase the displayed news count
      setDisplayedNewsCount((prevCount) => prevCount + 20);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [])// Chạy chỉ một lần khi thành phần được tạo

  return (
    <React.Fragment>
      {tagsOtherNews && (
        tagsOtherNews.map((tag, index) => (
          <div className="" key={index}>
            <h3 className="mb-3 mt-3 text-red font-weight">{tag}</h3>
            {newsByTagOtherNews && (
              newsByTagOtherNews.map((item, index) => (
                item.tag.includes(tag) && (
                  <Link
                    to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
                    key={index}
                    className="other-new p-3 bg-white rounded text-decoration-none"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="other-new__image border border-secondary">
                      <img
                        src={item.source === "" ? item.articlePicture : `/uploads/news/${item.articlePicture}`}
                        alt={item.title}
                      />
                    </div>
                    <div className="other-new__info">
                      <h4 className="other-new__title">{item.title}</h4>
                      <i className="mdi mdi-av-timer" /> {moment(item.dateCreate).format("DD-MM-YYYY")} -{" "}
                      <i className="mdi mdi-eye" /> {item.view}
                      <br></br>
                      {item.source && (<span className="news-source-title"> Nguồn: {item.source}</span>)}
                      <br></br>
                      {item.sapo && (<span className="news-source-title"> {item.sapo}</span>)}
                    </div>
                  </Link>
                )
              ))
            )}
          </div>
        ))
      )}

      <h3 className="mb-3 text-red font-weight pt-3">
        Tin tức tổng hợp về {categoryName}
      </h3>

      <div className="col-lg-12 pt-1">
        <div className="row">
          {generalNews ? (
            generalNews.map((item, index) => (
              <Link
                to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
                key={index}
                className="additonal-new p-3 bg-white rounded text-decoration-none col-lg-5 m-2 text-color"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="other-new__image border border-secondary">
                  <img
                    src={item.source !== "" ? item.articlePicture : `/uploads/news/${item.articlePicture}`}
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
    </React.Fragment>
  );
}
