import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Loading from "../../Loading";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";
import moment from "moment";
import GiaNgoaiTe from "../util/ngoaiTe";
import CoinGeckoWidget from "../util/coinGeckoWidget";
const style = {
  borderTop: "1px solid #bbbbbb",
};

export default function AdditionalNew() {
  const [newsReel, setNewsReel] = useState([]);
  const [newsEntertainment, setNewsEntertainment] = useState([]);
  const [newsEconomic, setNewsEconomic] = useState([]);

  useEffect(() => {
    const fetchNewsReelData = async () => {
      const res = await axios.get("/news/newsReels", {
        params: { newsId: "5dbe935fd84e1413ac50c2bc" },
      });
      const { data } = res.data;

      setNewsReel(data);
    };

    const fetchNewsEntertainmentData = async () => {
      const res = await axios.get("/news/newsEntertainments", {
        params: { newsId: "5dd4e90432e5ba1e1770a95f" },
      });
      const { data } = res.data;

      setNewsEntertainment(data);
    };
    const fetchNewsEconomicData = async () => {
      const res = await axios.get("/news/newsEntertainments", {
        params: { newsId: "5df236197e9b891e9a040b35" },
      });
      const { data } = res.data;

      setNewsEconomic(data);
    };

    fetchNewsReelData();
    fetchNewsEntertainmentData();
    fetchNewsEconomicData();
  }, []);

  return (
    <React.Fragment>
      <Link to={`/category/giai-tri/5dbe935fd84e1413ac50c2bc`}>
        <h3 className="mb-3 text-red font-weight pt-3" style={style}>
        <i className="fas fa-rss-square mr-4"></i>Thời sự</h3>
      </Link>
      <div className="col-lg-12 p-1">
  <div className="row">
    {newsReel ? (
      newsReel.map((item, index) => (
        <div key={index} className="col-lg-6 p-2">
          <Link
            to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
            className="additonal-new p-3 bg-white rounded text-decoration-none text-color"
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
              <i className="mdi mdi-av-timer" />{" "}
              {moment(item.dateCreate).format("HH:mm DD-MM-YYYY")} -{" "}
              <i className="mdi mdi-eye" /> {item.view}
              <br />
              {item.source && (
                <span className="news-source-title">
                  {" "}
                  Nguồn: {item.source}
                </span>
              )}
            </div>
          </Link>
        </div>
      ))
    ) : (
      <Loading />
    )}
  </div>
</div>
<Link to={`/category/giai-tri/5df236197e9b891e9a040b35`}>
      <h3 className="mb-3 text-red font-weight pt-3" style={style}>
      <i className="fas fa-chart-area mr-4"> </i>Kinh Doanh
      </h3></Link>
      <div className="row">
        <div className="col-lg-12 col-md-6 main-featured-new">
        <coingecko-coin-price-marquee-widget  coin-ids="bitcoin,eos,ethereum,litecoin,ripple,binancecoin,venus-ltc,lunar-2,solana,adapad,dogecoin" currency="vnd" background-color="#ffffff" locale="vi"></coingecko-coin-price-marquee-widget>
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4 col-md-6 main-featured-new">
              <GiaNgoaiTe />
        </div>
        <div className="col-lg-8 col-md-6 main-featured-new">
      <div className="row" style={{ marginLeft: '-20px',marginRight: '-10px' }}>
        {newsEconomic
          ? newsEconomic.slice(0, 6).map((item, index) => (
              <div key={index} className="col-lg-6 col-md-6 p-2">
                <Link
                  to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
                  className="additonal-new p-3 bg-white rounded text-decoration-none text-color"
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
                    <i className="mdi mdi-av-timer" />{" "}
                    {moment(item.dateCreate).format("HH:mm DD-MM-YYYY")} -{" "}
                    <i className="mdi mdi-eye" /> {item.view}
                    <br />
                    {item.source && (
                      <span className="news-source-title">
                        {" "}
                        Nguồn: {item.source}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))
          : null}
      </div>
    </div>
      </div><Link to={`/category/giai-tri/5dd4e90432e5ba1e1770a95f`}>
      <h3 className="mb-3 text-red font-weight pt-3" style={style}>
      <i className="fas fa-photo-video mr-4"></i>Giải trí
      </h3></Link>
      <div className="col-lg-12 p-1">
        <div className="row">
          {newsEntertainment
            ? newsEntertainment.map((item, index) => (
              <div key={index} className="col-lg-4 p-2">
                <Link
                  to={`/${hanldeUrlPretty(item.title)}/${item._id}`}
                  key={index}
                  className="additonal-new p-3 bg-white rounded text-decoration-none  text-color"
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
                    <h4 className="other-new__title ">{item.title.length > 84
                      ? `${item.title.substring(0, 84)}`
                      : item.title}</h4>
                    <i className="mdi mdi-av-timer" />{" "}
                    {moment(item.dateCreate).format("HH:mm DD-MM-YYYY")} -{" "}
                    <i className="mdi mdi-eye" /> {item.view}
                    <br></br>
                    {item.source && (
                      <span className="news-source-title">
                        {" "}
                        Nguồn: {item.source}
                      </span>
                    )}
                  </div>
                </Link>
                </div>
              ))
            : null}
        </div>
      </div>
    </React.Fragment>
  );
}
