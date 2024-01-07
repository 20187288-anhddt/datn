import React, { useEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import axios from "axios";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import NewsHighlight from "./NewsHighlight";
import OtherNews from "./NewsOther";
import FeaturedChannal from "../home/FeaturedChannel";
import LatestNew from "../home/LatestNew";

import { setMessage } from "../../../actions/message.action";
import { closeMessage } from "../closeMessage";
import Message from "../Message";

const Channel = ({ match }) => {
  const [following, setFollowing] = useState({});
  const [highlightNew, setHighlightNew] = useState(null);
  const [channel, setChannel] = useState(null);
  const [tags, setTags] = useState([]);
  const [newByTag, setNewByTag] = React.useState([]);
  const [nameChannel, setNameChannel] = useState([]);
  const id = match.params.id;
  const userExist = sessionStorage.getItem("userId");
  const token = localStorage.getItem("auth-token");
  const dispatch = useDispatch();

  useEffect(() => {
	const fetchData = async () => {
	  try {
		const res = await axios.get(`/users/name/${id}`);
		setChannel(res.data.data);
  
		if (res.data.data[0]) {
		  setNameChannel(res.data.data[0].username);
		}
	  } catch (error) {
		console.error("Error fetching data:", error);
	  }
	};
  
	fetchData(); // Call fetchData function immediately
  
  }, [id, userExist]);

  const checkUserIsFollowing = (userExist, id, data) => {
    if (userExist && data) {
      const checkFollowing = data.find(v => v.followBy === userExist && v.channel === id);
      return checkFollowing;
    }
  };
  useEffect(() => {
  const fetchDataNews = async () => {
	const res = await axios.get(`/news/users/${id}`);

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
	setNameChannel(res.data.data[0]._id);
};
fetchDataNews();
}, [id]);

  const handleUnFollow = async (follow, userId, userFollowingId) => {
    try {
      let decreaseFollow = follow - 1;

      const res = await axios.put(`/followers/decrease/${userId}`, {
        follow: decreaseFollow
      });

      const { code, message, data } = res.data;
      setFollowing(checkUserIsFollowing(userExist, id, data));

      dispatch(setMessage({ code, message }));
      dispatch(closeMessage({ code, message }));

      await axios.delete(`/followers/${userFollowingId}`);
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  const handleFollow = async (follow, userId) => {
    try {
      let increaseFollow = follow + 1;

      const res = await axios.put(`/followers/increase/${userId}`, {
        follow: increaseFollow
      });

      const { code, message, data } = res.data;
      setFollowing(checkUserIsFollowing(userExist, id, data));

      dispatch(setMessage({ code, message }));
      dispatch(closeMessage({ code, message }));

      await axios.post("/followers/", {
        channel: userId,
        user: userExist
      });
    } catch (error) {
      console.error("Error following:", error);
    }
  };
  return (
    <>
      <Helmet>
        <title>{channel ? `${channel.username} - BNews kênh tin tức hàng đầu Việt Nam` : "Loading..."}</title>
        <meta name="description" content="BNews kênh tin tức hàng đầu Việt Nam, thời dự, bóng đá, tin trong ngày, giải trí, bất động sản,..." />
      </Helmet>
      <React.Fragment>
        <Message />
        <div className="container">
          <div className="row mb-3" style={{ alignItems: "center" }}>
            <h1 className="mr-2">{channel ? channel.username : "Loading..."}</h1>
            <div className="mb-2">
              {userExist && token ? (
                following ? (
                following.channel === id &&
                  following.followBy === userExist ? (
                    <span
                      onClick={() => handleUnFollow(channel.follow, channel._id, following._id)}
                      className="badge badge-success cursor-pointer"
                    >
                      Đang theo dõi
                    </span>
                  ) : (
                    <span
                      onClick={() => handleFollow(channel.follow, channel._id)}
                      className="badge badge-info cursor-pointer"
                    >
                      Theo dõi
                    </span>
                  )
                ) : (
                  <span
                    onClick={() => handleFollow(channel.follow, channel._id)}
                    className="badge badge-info cursor-pointer"
                  >
                    Theo dõi
                  </span>
                )
              ) : (
                <Link to="/login" className="badge badge-info">
                  Follow
                </Link>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              <NewsHighlight highlightNew={highlightNew || null} />
              <OtherNews
                tags={tags}
                newByTag={newByTag}
                newsHighlightId={highlightNew ? highlightNew._id : null}
                highlightNew={highlightNew}
              />
            </div>
            <div className="col-lg-4">
              <FeaturedChannal />
              <div className="mt-4">
                <LatestNew />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    </>
  );
};

export default Channel;
