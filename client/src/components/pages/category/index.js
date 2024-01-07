import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet';
import axios from "axios";

import HighlightNews from "./HighlightNews";
import OtherNews from "./OtherNews";
import FeaturedChannel from "../home/FeaturedChannel";
import LatestNew from "../home/LatestNew";
import ChannelCate from "./ChannelCate";
import HotNewsByCate from "./HotNewsByCate";


export default function Category({ match }) {
	const [highlightNew, setHighlightNew] = useState({});
	const [categoryName, setCategoryName] = useState("");
	const [tags, setTags] = useState([]);
	const [newByTag, setNewByTag] = useState([]);
	const id = match.params.id;

	useEffect(() => {
		const fetchData = async () => {
			const res = await axios.get(`/news/categories/${id}`);

			function getTags() {
				let tagArr = [];

				res.data.data.map(item => tagArr.push(item.tag));

				const newTagArr = tagArr.flat(1);

				const result = [...new Set(newTagArr)];
				return result;
			}

			function getDataByView(view) {
				return res.data.data.find(item => item.view >= view);
			}

			const highlightNew = getDataByView(1);

			setTags(getTags());
			setHighlightNew(highlightNew);
			setNewByTag(res.data.data)

			if (res.data.data[0])
				setCategoryName(res.data.data[0].cateNews.name);
		};
		fetchData();
	}, [id]);

	return (
		<>
			<Helmet>
				<title>{` ${categoryName ? categoryName + ' - BNews kênh tin tức hàng đầu Việt Nam' : "Loading..."} `}</title>
				<meta name="description" content="BNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
			</Helmet>
			<React.Fragment>
				<div className="container">
					<div className="row">
						<div className="col-xl-9 col-lg-9 col-sm-12">
													<HotNewsByCate />
							{/* <HighlightNews news={highlightNew} /> */}
							{
								highlightNew
									? 
									<OtherNews 
										tags={tags} 
										newsByTag={newByTag} 
										newsHighlightId={highlightNew._id} 
										highlightNew={highlightNew} 
										categoryName={categoryName}
										/>
									: 
									null
							}
						</div>
						<div className="col-xl-3 col-lg-3 col-sm-12">
							<div className="mb-4">
							</div>
							<LatestNew />
							<ChannelCate />
							<FeaturedChannel />
							
						</div>
					</div>
				</div>
			</React.Fragment>
		</>
	);
}
