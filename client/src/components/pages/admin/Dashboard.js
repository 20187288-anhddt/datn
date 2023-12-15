import React from "react";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ViewsByDayStatisticals from "./statisticals/ViewsByDayStatisticals";
import ViewsByMonthStatisticals from "./statisticals/ViewsByMonthStatisticals";

export default function Dashboard() {
  const [month, setMonth] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date());

  const handleChangeMonth = (date) => {
    const month = moment(date).utc().format("YYYY-MM-DD");
    setMonth(month);
    setStartDate(date)
  };

  return (
    <div className="content-wrapper" >
      <div className="page-header">
        <h3 className="page-title">
          <span className="page-title-icon bg-gradient-danger text-white mr-2">
            <i className="mdi mdi-home" />
          </span>
          Dashboard
        </h3>
      </div>
      <div className="row" style={{ padding: "0px 30px 30px 30px" }}>
        <div className="col-xl-12 grid-margin stretch-card font-weight-bold">Lượt xem trong ngày:</div>
        <div className="col-xl-12 grid-margin stretch-card" >
          <ViewsByDayStatisticals/>
        </div>
      </div>
      <div className="row" style={{ padding: "0px 30px 30px 30px" }}>
        <div style={{ alignItems: "center", marginBottom:"20px" }} className="col-xl-12 grid-margin stretch-card font-weight-bold">
          <div style={{display:"inline-block", minWidth:"200px", marginLeft:"20px"}}>
            Lượt xem theo tháng: 
          </div>
          <DatePicker
            selected={startDate}
            onChange={date => handleChangeMonth(date)}
            dateFormat="yyyy/MM"
            showMonthYearPicker
            className="border border-white rounded-pill ml-1 p-1"
          />
        </div>
        <div className="col-xl-12 grid-margin stretch-card" >
          <ViewsByMonthStatisticals month={month} />
        </div>
      </div>
    </div>
  );
}
