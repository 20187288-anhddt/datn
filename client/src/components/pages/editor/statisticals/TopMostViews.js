import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactTable from "react-table-v6";
import 'react-table-v6/react-table.css'
import { setMessage } from "../../../../actions/message.action";
import { useDispatch } from "react-redux";
import Confirm from "../Confirm";
import Message from "../../Message";
import { closeMessage } from "../../closeMessage";

export default function TopMostViews() {
    const [news, setNews] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setMessage({ message: "" }));
        const fetchNews = async () => {
          try {
            const res = await axios.get("/statisticals/topMostViewed");
            const data = res.data.data;
            setNews(data);
          } catch (error) {
            console.error("Error fetching news:", error);
            dispatch(setMessage({ message: "Error fetching news", isError: true }));
          }
        };
        fetchNews();
    }, [dispatch]);

    const columns = [
        {
          Header: "ID bài báo",
          accessor: "news",
          sortable: false,
          filterable: false,
          maxWidth: 250,
          Cell: props => {
            return (<Link to={`/details/${props.original._id}`}>{props.original._id}</Link>)
          }
        },
        {
            Header: "Tiêu đề bài báo",
            accessor: "title",
            sortable: false,
            filterable: false,
        },
        {
            Header: "Lượt xem",
            maxWidth: 100,
            accessor: "view",
            sortable: false,
            filterable: false,
            Cell: (props) => {
                return <div style={{ textAlign: "center" }}>{props.value}</div>;
              },
        },
    ];

    return (
        <div className="col-xl-12 grid-margin stretch-card">
            <ReactTable
                columns={columns}
                data={news}  // Change this line from data={data} to data={news}
                filterable
                defaultPageSize={7}
                className="table mt-3"
            />
        </div>
    );
}
