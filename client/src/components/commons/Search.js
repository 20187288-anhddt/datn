import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getSearchNews } from "../../actions/new.action";
import { hanldeUrlPretty } from "../mixin/UrlPretty";

const Search = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const appState = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchText.length >= 2) {
        setLoading(true);
        dispatch(getSearchNews(searchText.trim()));
      } else {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchText, dispatch]);

  return (
    <div className="search">
      <input
        id="searchId"
        className="form-control mr-sm-2 search__input"
        type="search"
        placeholder="Nhập nội dung cần tìm kiếm..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      {loading && <div>Loading...</div>}
      {appState.news.search ? (
        appState.news.search.length > 0 ? (
          <div className="search__result w-100 p-1 rounded shadow-lg">
            {appState.news.search.map((item, index) => (
              <Link
                to={`/${item.item.title && hanldeUrlPretty(item.item.title)}/${item.item._id}`}
                key={index}
                className="search-new p-1 bg-white rounded text-decoration-none text-dark"
              >
                <div className="search-new__image">
                  <img
                    src={
                      item.item.originalLink !== ""
                        ? item.item.articlePicture
                        : `/uploads/news/${item.item.articlePicture}`
                    }
                    alt={item.item.title}
                  />
                </div>
                <div className="search-new__info">
                  <h6 className="search-new__title search__title">
                    {item.item.title}
                  </h6>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="search__result w-100 p-1 text-secondary text-center rounded shadow-lg">
            No result
          </div>
        )
      ) : null}
    </div>
  );
};

export default Search;
