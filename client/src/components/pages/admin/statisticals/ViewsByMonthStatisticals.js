import React from "react";
import axios from "axios";
import moment from "moment";
import { Bar } from "react-chartjs-2";

export default function ViewsByMonthStatisticals(props) {
    const [news, setNews] = React.useState([]);

    const monthDefault = moment().format("YYYY-MM-DD");
    const getMonth = props.month || monthDefault;

    React.useEffect(() => {
        try {
            const fetchData = async () => {
                const res = await axios.get("/statisticals/viewsOfMonth", { params: { month: getMonth } });

                setNews(res.data.data);
            };

            fetchData();
        } catch (e) {
            console.log(e);
        }
    }, [getMonth]);

    const labels = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
  
    const countViewByDayOfMonth = news.reduce((newsOne, newsTwo) => {
        const dayOfMonth = moment(newsTwo.date).utc().format("DD");
        newsOne[dayOfMonth] = (++newsOne[dayOfMonth]) || 1;
        return newsOne;
    }, {});


    const data = {
        labels: labels,
        datasets: [
            {
                label: "Views",
                data: countViewByDayOfMonth,
                backgroundColor: 'rgba(255, 99, 132, 0.6)'
            }
        ]
    }
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
    )
}