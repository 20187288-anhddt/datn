import React from "react";
import axios from "axios";
import { Helmet } from 'react-helmet'

import NewsDetail from "./NewsDetail";
import NewsSimilar from "./NewsSimilar";
import NewsOther from "../home/NewsOther";
import FeaturedChannel from "../home/FeaturedChannel.js";
import LatestNew from "../home/LatestNew.js";
import NotExistNews from "./NotExistNews";

export default function Detail({ match, location }) {
  const [datas, setDatas] = React.useState({});
  const id = match.params.id;

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/news/details/${id}`);

      setDatas(res.data.data[0]);
    };

    fetchData();
  }, [id]);
  React.useEffect(() => {
    // Check if datas.content is null or an empty string
    if (datas.content === null || datas.content === "") {
      // Open originalLink in a new tab
      window.open(datas.originalLink, "_blank");
    }
  }, [datas]);
  return !datas
    ? <NotExistNews/> : (
        <React.Fragment>
          <Helmet>
            <title>{datas.title}</title>
            <meta name="description" content="This is what you want to show as the page content in the Google SERP Listing" />
          </Helmet>
          <div className="container">
            <div className="row" style={{fontSize:'22px'}}>
              <NewsDetail datas={datas} />
              <div className="col-xl-3 col-lg-3 col-sm-12">
                <div className="mb-4">
                  <LatestNew />
                </div>
                <FeaturedChannel />
              </div>
            </div>
            <div className="row">
              <NewsSimilar id={datas.cateNews} />
            </div>
            <div className="row">
              <div className="col-lg-8 p-0 main-featured-new pt-3">
                <h3 className="mb- mt-3">Tin khác</h3>
                <NewsOther />
              </div>
            </div>
          </div>
        </React.Fragment>
      )
}
