import axios from "axios";

const setSubCategories = (data) => ({
  type: "GET_SUBCATEGORIES",
  payload: data
});

export const getSubCategories = () => {
  return async dispatch => {
    const res = await axios.get("/cateNews/subCateNews");
    const data = res.data.data;
    
    dispatch(setSubCategories(data));
  };
};
