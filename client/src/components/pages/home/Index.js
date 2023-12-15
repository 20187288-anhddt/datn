import React from "react";
import {Helmet} from 'react-helmet'

import LatestNew from "./LatestNew";
import FeaturedNew from "./FeaturedNew";
import FeaturedChannel from "./FeaturedChannel";
import NewsOther from "./NewsOther";
import AdditionalNew from "./AdditionalNew";


export default function Home() {
  return (
    <>
      <Helmet>
        <title>BNews kênh tin tức thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,...</title>
        <meta name="description" content="BNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
      </Helmet>
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-5">
            <LatestNew />
          </div>
          <div className="col-lg-6 col-md-7 main-featured-new">
            <h3 className="mb-3 text-red font-weight">Tin tức nổi bật</h3>
            <FeaturedNew />
          </div>
          <div className="col-lg-3 col-md-12">
            <FeaturedChannel />
          </div>
        </div>
        <div className="border-secondary rounded mt-5 p-1">
          <AdditionalNew />
        </div>
        <div className="row">
          <div className="col-lg-9 main-featured-new">
            <h3 className="mb-3 mt-3 text-red font-weight">Tin khác</h3>
            <NewsOther />
          </div>
        </div>
      </div>
    </>
  );
}
