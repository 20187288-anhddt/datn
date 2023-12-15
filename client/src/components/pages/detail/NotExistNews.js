import React from "react";
import Message from "../Message";
import NewsOther from "../home/NewsOther";
import FeaturedChannel from "../home/FeaturedChannel.js";
import LatestNew from "../home/LatestNew.js";

export default function NotExistNews() {
    return (
        <React.Fragment>
            <div className="container">
                <div className="row">
                    <React.Fragment>
                        <Message />
                        <div className="col-xl-9 col-lg-9 col-sm-12 p-2 bg-white rounded shadow-sm">
                            <div style={{color:"red", font: "italic", textAlign:"center"}}>Tin này không còn tồn tại</div>
                        </div>
                    </React.Fragment>
                    <div className="col-xl-3 col-lg-3 col-sm-12">
                        <div className="mb-4">
                            <LatestNew />
                        </div>
                        <FeaturedChannel />
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-8 p-0 main-featured-new">
                        <h3 className="mb-3 mt-3">Tin khác</h3>
                        <NewsOther />
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}
