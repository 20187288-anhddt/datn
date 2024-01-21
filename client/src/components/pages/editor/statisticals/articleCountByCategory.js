// import React, { useEffect, useState } from 'react';
// import { Bar } from 'react-chartjs-2';
// import axios from 'axios';

// const ArticleCountByCategory = () => {
//   const [articleCountByCategory, setArticleCountByCategory] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get('/statisticals/articleCountByCategory');
//         setArticleCountByCategory(res.data.data);
//       } catch (e) {
//         console.log(e);
//       }
//     };

//     fetchData();
//   }, []);

//   const labels = articleCountByCategory.map(item => item.category);
//   const counts = articleCountByCategory.map(item => item.count);

//   const data = {
//     labels: labels,
//     datasets: [
//       {
//         label: 'Số lượng bài viết',
//         data: counts,
//         backgroundColor: 'rgba(255, 99, 132, 0.6)',
//       },
//     ],
//   };

//   return (
//     <>
//       <Bar
//         data={data}
//         height={300}
//         options={{
//           responsive: true,
//           maintainAspectRatio: false,
//         }}
//       />
//     </>
//   );
// };

// export default ArticleCountByCategory;
