import axios from "axios";

const setNews = (data) => ({
  type: "GET_NEWS",
  payload: data
});

const setNewsOther = (data) => ({
  type: "GET_NEWS_OTHER",
  payload: data
});

const setLatestNews = (data) => ({
  type: "GET_LATEST_NEWS",
  payload: data
});

const setTintucNew = (data) => ({
  type: "GET_TINTUC_NEWS",
  payload: data
});

const setSearchNews = (data) => ({
  type: "GET_SEARCH_NEWS",
  payload: data
});

export const getLatestNewsByCategory = (categoryId, number) => {
  return async (dispatch) => {
    try {
      dispatch(setLoading(true));

      const res = await axios.get(`/news/categories/new/${categoryId}`, { params: { number: number } });
      const data = res.data.data;

      dispatch(setLatestNewsByCategory(data));
      dispatch(setLoading(false));
    } catch (error) {
      dispatch(setLoading(false));
      dispatch(setError(`Lỗi khi lấy tin tức: ${error.message}`));
    }
  };
};

export const setLoading = (loading) => ({
  type: "SET_LOADING",
  payload: loading,
});

export const setLatestNewsByCategory = (data) => ({
  type: "SET_LATEST_NEWS_BY_CATEGORY",
  payload: data,
});

export const setError = (error) => ({
  type: "SET_ERROR",
  payload: error,
});

export const getNews = () => {
  return async dispatch => {
    const res = await axios.get("/news/featuredNews");
    const data = res.data.data;

    dispatch(setNews(data));
  };
};

export const getNewsOther = (number) => {
  return async dispatch => {
    const res = await axios.get("/news/other", { params: { number: number } });
    const data = res.data.data;

    dispatch(setNewsOther(data));
  };
};


export const getLatestNews = () => {
  return async dispatch => {
    const res = await axios.get("/news/latestNews");
    const data = res.data.data;

    dispatch(setLatestNews(data));
  };
};

export const getTintucNew = () => {
  return async dispatch => {
    const res = await axios.get("/news/latestNews");
    const data = res.data.data;

    dispatch(setTintucNew(data));
  };
};

export const getSearchNews = (textSearch) => {
  return async dispatch => {
    const res = await axios.get("/news/q", { params: { textSearch: textSearch } });
    const data = res.data.data;

    dispatch(setSearchNews(data));
  };
};
