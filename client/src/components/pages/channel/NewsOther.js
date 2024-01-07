import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Loading from "../../Loading";
import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";
import axios from "axios";

export default function OtherNews({match}) {
  const [tags, setTags] = React.useState([]);
  const [loading, setLoading] = useState(true);
  const [newsOther, setNewsOther] = useState([]);
  const [newsByTagOtherNews, setNewsByTagOtherNews] = useState([]);
  const [newByTag, setNewByTag] = React.useState([]);
  const [generalNews, setGeneralNews] = useState([]);
  const [displayedNewsCount, setDisplayedNewsCount] = useState(20);
  // React.useEffect(() => {
  //   // xủ lý  tin tức trùng lặp
  //   if (props.newsHighlightId && props.newByTag) {
  //     const newByTag = props.newByTag.filter(v => v._id !== props.newsHighlightId);
  //     const otherNews = props.newsByTag.filter((v) => v._id !== props.newsHighlightId);
  //     setNewsByTagOtherNews(otherNews);
  //     setGeneralNews(otherNews.filter((news) => news.tag && news.tag.length === 0).slice(0, displayedNewsCount));

  //     setNewByTag(newByTag);
  //   } else {
  //     setNewByTag(props.newByTag);
  //     setTags(props.tags)
  //   }
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (match && match.params && match.params.id) {
          const res = await axios.get(`/news/users/${match.params.id}`);
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
  //   // xủ lý tin tức có tags giống với tin tức nỗi bật
  //   if (props.highlightNew && props.tags) {
  //     const highlightNewTags = props.highlightNew.tag;

  //     if (highlightNewTags) {
  //       let tags = [];

  //       for (let j = 0; j < props.tags.length; j++) {
  //         for (let i = 0; i < highlightNewTags.length; i++) {
  //           if (props.tags[j] === highlightNewTags[i]) {
  //             tags.push(props.tags[j]);
  //           }
  //         }
  //       }

  //       // console.log("tags", tags);

  //       const rs = props.tags.filter(v => !tags.includes(v));

  //       setTags(rs);
  //     }
  //   }

  // }, [props.tags, props.newByTag, props.newsHighlightId, props.highlightNew]);

  // just show news <= 50
  // newByTag.length = 50;

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

  return(
    <React.Fragment>
      <h3 className="mb-3 text-red font-weight pt-3">
        <center>Tin tức tổng hợp của kênh</center>
      </h3>
      <div className="col-lg-12 pt-1">
        <div className="row">
          {newsOther ? (
            newsOther.map((item, index) => (
              <Link
                to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
                key={index}
                className="additonal-new p-3 bg-white rounded text-decoration-none custom-col-lg-5 m-2 text-color"
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
                  <i className="mdi mdi-av-timer" /> {moment(item.dateCreate).format("HH:mm DD-MM-YYYY")} -{" "}
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
  )
}