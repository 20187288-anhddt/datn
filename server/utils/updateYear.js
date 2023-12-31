// Test thay đổi năm bài viết, lưu ý không nên sử dụng


const MongoClient = require('mongodb').MongoClient;

// Kết nối đến MongoDB
const url = 'mongodb+srv://damh-news:dhbkhn@cluster0.2giq1.mongodb.net/damh?retryWrites=true&w=majority';
const dbName = 'damh';

MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }

  const db = client.db(dbName);
  const collection = db.collection('news');

  try {
    // Xóa các documents có trường dateCreate là Object
    const result = await collection.deleteMany({
      dateCreate: { $type: 3 } // Kiểu dữ liệu của Object trong MongoDB là số 3
    });

    console.log('Number of documents deleted:', result.deletedCount);
  } catch (error) {
    console.error('Error deleting documents:', error);
  } finally {
    // Đóng kết nối
    client.close();
  }
});