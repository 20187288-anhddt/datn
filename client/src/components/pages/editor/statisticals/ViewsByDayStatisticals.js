import React from "react";
import axios from "axios";
import moment from "moment";
import { Line } from "react-chartjs-2";
import "react-datepicker/dist/react-datepicker.css";

export default function ViewsByDayStatisticals() {
  const [news, setNews] = React.useState([]);

  React.useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await axios.get("/statisticals/viewsOfDay");

        setNews(res.data.data);
      };

      fetchData();
    } catch (e) {
      console.log(e);
    }
  }, []);

  const labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];

  const countViewHour = news.reduce((newsOne, newsTwo) => {
    const hour = moment(newsTwo.date).utc().format("H");
    newsOne[hour] = (++newsOne[hour]) || 1;
    return newsOne;
  }, {});

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Views",
        bacgroundColor: "red",
        data: countViewHour
      }
    ]
  }

  return (
    <Line
      data={data}
      height={300}
      options={{
        responsive: true,
        maintainAspectRatio: false
      }} />
  );
}
