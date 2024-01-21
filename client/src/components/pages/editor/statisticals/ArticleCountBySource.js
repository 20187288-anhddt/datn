import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import axios from 'axios';

const ArticleCountBySource = () => {
  const [articleCountBySource, setArticleCountBySource] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/statisticals/articleCountBySource');
        setArticleCountBySource(res.data.data);
      } catch (e) {
        console.log(e);
      }
    };

    fetchData();
  }, []);

  const labels = articleCountBySource.map(item => item.source || 'BkNews');
  const counts = articleCountBySource.map(item => item.count);

  const data = {
    labels: labels,
    datasets: [
      {
        data: counts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  return (
    <>
      <Doughnut
        data={data}
        height={300}
        options={{
          responsive: true,
          maintainAspectRatio: false,
        }}
      />
    </>
  );
};

export default ArticleCountBySource;
