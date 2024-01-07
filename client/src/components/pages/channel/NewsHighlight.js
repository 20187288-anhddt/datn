import React from "react";
import { Link } from "react-router-dom";

import BoxLoadingItem from "../../BoxLoadingItem";
import { hanldeUrlPretty } from "../../mixin/UrlPretty";

export default function NewsHighlight(props) {
  const [highlightNews, setHighlightNews] = React.useState([]);

  React.useEffect(() => {
    setHighlightNews(props.highlightNew);
  }, [props.highlightNew]);

  return (
    <div>
      <h3 className="mb-3">Tin tức nổi bật</h3>
      {highlightNews.length > 0 ? (
        highlightNews.map((news) => (
          <Link
            key={news._id}
            to={`/${news.title && hanldeUrlPretty(news.title)}/${news._id}`}
            className="featured-new p-3 bg-white rounded text-decoration-none"
          >
            {news.articlePicture ? (
              <div className="featured-new__image border border-secondary">
                <img
                  src={`/uploads/news/${news.articlePicture}`}
                  alt={news.title}
                />
              </div>
            ) : (
              <BoxLoadingItem />
            )}
            <div className="featured-new__info">
              <h4 className="featured-new__title">{news.title}</h4>
            </div>
          </Link>
        ))
      ) : (
        <p className="text-secondary">Không có tin tức nổi bật nào!</p>
      )}
    </div>
  );
}
