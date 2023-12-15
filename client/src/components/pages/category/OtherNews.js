import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";
import Loading from "../../Loading";

export default function OtherNews({ tags, newsByTag, newsHighlightId, highlightNew, categoryName }) {
	const [tagsOtherNews, setTagsOtherNews] = useState([]);
	const [newsByTagOtherNews, setNewsByTagOtherNews] = useState([]);
	const [generalNews, setGeneralNews] = useState([])

	useEffect(() => {
		// xủ lý  tin tức trùng lặp
		if (newsHighlightId && newsByTag) {
			const otherNews = newsByTag.filter(v => v._id !== newsHighlightId);
			setNewsByTagOtherNews(otherNews);
		}

		// xủ lý tin tức có tags giống với tin tức nỗi bật
		if (highlightNew && tags) {
			const highlightNewTags = highlightNew.tag;

			if (highlightNewTags) {
				let tagsOtherNews = [];
				const otherNewsTags = tags.filter((tag) => !highlightNewTags.includes(tag));
				setTagsOtherNews(otherNewsTags);
			}
		}
		setGeneralNews(newsByTagOtherNews.filter(news => news.tag && news.tag.length === 0).slice(0, 10));

	}, [tags, newsByTag, newsHighlightId, highlightNew, generalNews]);

	// just show news <= 50
	newsByTagOtherNews.length = 50;

	return (
		<React.Fragment>
			{/* <span>{JSON.stringify(newsByTagOtherNews)}</span> */}
			{
				tagsOtherNews && (
					tagsOtherNews.map((tag, index) => (
						<div className="" key={index}>
							<h3 className="mb-3 mt-3 text-red font-weight">{tag}</h3>
							{
								newsByTagOtherNews && (
									newsByTagOtherNews.map((item, index) => (
										item.tag.includes(tag) && (
											<Link to={`/${hanldeUrlPretty(item.title)}/${item._id}`} key={index} className="other-new p-3 bg-white rounded text-decoration-none" target="_blank" rel="noopener noreferrer" >
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
										)
									))
								)
							}
						</div>
					))
				)
			}
			<h3 className="mb-3 text-red font-weight pt-3">
				Tin tức tổng hợp về {categoryName}
			</h3>
			<div className="col-lg-12 pt-1">
				<div className="row">
					{generalNews ? (
						generalNews.map((item, index) => (
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

		</React.Fragment>
	)
}
