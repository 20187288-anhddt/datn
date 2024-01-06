import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

export default function ViewsTotal(props) {
  const [news, setNews] = useState([]);
  const [labels, setLabels] = useState(Array.from({ length: 31 }, (_, i) => (i + 1).toString()));
  const [channelId, setChannelId] = useState(sessionStorage.getItem("userId"));

  const getMonth = props.month || moment().format("YYYY-MM-DD");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/statisticals/viewsOfMonthByChannel", { params: { month: getMonth, channelId: channelId } });
        setNews(res.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle the error, e.g., set an error state
      }
    };

    fetchData();
  }, [getMonth, channelId]);

  useEffect(() => {
    // Update labels based on the actual number of days in the selected month
    const daysInMonth = moment(getMonth).daysInMonth();
    setLabels(Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()));
  }, [getMonth]);

  const processData = () => {
    const arr0 = news.map(v => ({
      date: moment(v.date).format("DD"),
      views: v.views || 0
    }));

    const arr1 = arr0.reduce((prev, next) => {
      const date = next.date;
      prev[date] = (prev[date] || 0) + next.views;
      return prev;
    }, {});

    const rs = labels.map(date => ({ date, views: arr1[date] || 0 }));
    return rs;
  };

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Views",
        data: processData().map(item => item.views),
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Day of Month'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Views'
        },
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };

  return (
    <>
      <Bar
        data={data}
        height={300}
        options={options}
      />
    </>
  );
};
