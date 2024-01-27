import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import LatestNew from "./LatestNew";
import FeaturedNew from "./FeaturedNew";
import FeaturedChannel from "./FeaturedChannel";
import NewsOther from "./NewsOther";
import AdditionalNew from "./AdditionalNew";
import GiaVang from "../util/giaVang";
import CoinGeckoWidget from "../util/coinGeckoWidget";
import NewsChannel from "./NewsChannel";
export default function Home() {
  useEffect(() => {
    const fixedElement = document.getElementById("fixedElementContainer");
    const originalOffset = fixedElement.offsetTop;

    const handleScroll = () => {
      const scrollTop = window.scrollY;

      if (scrollTop >= originalOffset) {
        fixedElement.classList.add("fixed-element");
      } else {
        fixedElement.classList.remove("fixed-element");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>
          BKnews kênh tin tức thời dự, bóng đá, tin trong ngày, giải trí, bất
          động sản,...
        </title>
        <meta
          name="description"
          content="BKnews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..."
        />
      </Helmet>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-5">
            <LatestNew />
          </div>
          <div className="col-lg-5 col-md-7 main-featured-new">
            <h4 className="mb-3 text-red font-weight" style={{ fontSize: '21px' }}>
              Tin tức được quan tâm nhất 24h qua 🔥
            </h4>
            <FeaturedNew />
          </div>
          <div className="col-lg-3 col-md-12">
            <FeaturedChannel />
            <NewsChannel />
          </div>
        </div>

        <div className="border-secondary rounded mt-5 p-1">
          <AdditionalNew />
        </div>

        <div
          id="fixedElementContainer"
          className="row"
          style={{
            position: "relative",
            paddingBottom: "40px", // Add padding to compensate for the fixed element
          }}
        >
          <div className="col-lg-8 main-featured-new">
            <h3 className="mb-3 text-red font-weight pt-3" style={{borderTop: "1px solid #bbbbbb",}}>Tin khác</h3>
            <NewsOther />
          </div>
          <div
            className="col-lg-4 col-md-6 main-featured-new fixed-element"
            // style={{ position: 'fixed', bottom: '0px', right: '240px', width: '380px', zIndex: '-1' }}
          >
            <h3 className="mb-3 text-red font-weight">Giá vàng hôm nay</h3>
            <GiaVang />
          </div>
        </div>
      </div>
    </>
  );
}
