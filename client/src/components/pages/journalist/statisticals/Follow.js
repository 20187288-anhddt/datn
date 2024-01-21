import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Follow() {
  const [channels, setChannels] = useState({});
  const channelId = sessionStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`/users/name/${channelId}`, {
          params: { channelId: channelId },
        });
        const { data } = res.data;
        setChannels(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Xử lý lỗi ở đây, ví dụ: hiển thị một thông báo cho người dùng
        // hoặc thực hiện một hành động phù hợp với ứng dụng của bạn.
      }
    };

    fetchData();
  }, [channelId]);

  return (
    <>
      {channels && channels.follow !== undefined && (
        <span className="badge badge-danger ml-1">{channels.follow}</span>
      )}
    </>
  );
}
