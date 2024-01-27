const initialState = { data: null };

export default function channelReducer(state = initialState, action) {
  switch (action.type) {
    case "GET_NEWS_CHANNEL":
      return { ...state, data: action.payload };
    default:
      return state;
  }
}
