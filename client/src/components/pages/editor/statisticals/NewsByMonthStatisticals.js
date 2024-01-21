import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

export default function NewsByMonthStatisticals(props) {
  const [news, setNews] = useState([]);

  const monthDefault = moment().format("YYYY-MM-DD");
  const getMonth = props.month || monthDefault;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/statisticals/newsByMonth", { params: { month: getMonth } });
        setNews(res.data.data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, [getMonth]);

  // Generate labels for each day in the month
  const labels = Array.from({ length: moment(getMonth).daysInMonth() }, (_, i) => (i + 1).toString().padStart(2, "0"));

  // Count news for each day
  const countNewsByMonthOfMonth = news.reduce((newsOne, newsTwo) => {
    const dayOfMonth = moment(newsTwo.dateCreate).utc().format("DD");
    newsOne[dayOfMonth] = (++newsOne[dayOfMonth]) || 1;
    return newsOne;
  }, {});

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Số lượng bài báo",
        data: Object.values(countNewsByMonthOfMonth), // Extract values from the object
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  return (
    <>
      <Bar
        data={data}
        height={300}
        options={{
          responsive: true,
          maintainAspectRatio: false
        }}
      />
    </>
  );
}