
function bitapSearch(pattern, text) {
    const m = pattern.length;
    const n = text.length;
    // Khởi tạo bitmask cho mẫu
    let R = ~1;
    if (m === 0) { return [];
} else if (m > 31) {
        console.error("Mẫu quá dài, không thể xử lý.");
        return []; }
    let patternMask = 1 << (m - 1);
    let matches = [];
    for (let i = 0; i < n; i++) {
        R |= 1;
        if ((R & patternMask) !== 0) {
            if (patternMatch(i, pattern, text)) {
                matches.push(i);
            }
        }   R <<= 1;
    }
    return matches;
  }
  function patternMatch(start, pattern, text) {
    const m = pattern.length;
    let j = 0;
    while (j < m && pattern[j] === text[start + j]) {
        j++; }
    return j === m;
  }
  // Sử dụng ví dụ
//   const pattern = "world";
//   const text = "hello world, world!";
//   const matches = bitapSearch(pattern, text);
//   console.log("Các vị trí của sự phù hợp:", matches);


// Trong đoạn mã này, hàm bitapSearch sử dụng một biến R (đại diện cho bitmask) và 
// thực hiện việc so sánh theo từng ký tự bằng cách gọi hàm patternMatch. 
// Hàm patternMatch kiểm tra xem có sự phù hợp giữa mẫu và đoạn văn bản 
// bắt đầu từ vị trí start hay không.

// 1. Hàm bitapSearch(pattern, text)

// pattern: Mẫu cần tìm kiếm.

// text: Chuỗi văn bản trong đó tìm kiếm mẫu.

// R: Bitmask được sử dụng để so sánh với mẫu.

// patternMask: Bitmask đại diện cho mẫu.

// matches: Mảng lưu trữ vị trí của các sự phù hợp.

// Bắt đầu với việc khởi tạo bitmask R và kiểm tra điều kiện đặc biệt nếu độ dài mẫu là 0 hoặc quá dài.

// Sau đó, lặp qua từng ký tự trong chuỗi văn bản. Trong mỗi vòng lặp:

// R |= 1: Thiết lập bit thấp nhất của R thành 1.

// R <<= 1: Dịch trái bitmask R.

// Kiểm tra xem bit cao nhất của R và bit cao nhất của patternMask có giống nhau không. Nếu có, thì gọi hàm patternMatch để kiểm tra sự phù hợp tại vị trí hiện tại. Nếu có sự phù hợp, thêm vị trí vào mảng matches.

// 2. Hàm patternMatch(start, pattern, text)

// start: Vị trí bắt đầu trong chuỗi văn bản.

// pattern: Mẫu cần so sánh.

// text: Chuỗi văn bản.

// Hàm này kiểm tra sự phù hợp giữa mẫu và đoạn văn bản bắt đầu từ vị trí start. Nó so sánh từng ký tự của mẫu với ký tự tương ứng trong đoạn văn bản.

// Duyệt qua từng ký tự và tăng biến j cho đến khi ký tự không phù hợp hoặc hết ký tự trong mẫu.

// Nếu j đạt đến độ dài của mẫu, tức là mọi ký tự đều phù hợp, hàm trả về true, ngược lại trả về false.

// 3. Sử dụng ví dụ

// Mẫu là "world", và chuỗi văn bản là "hello world, world!".
// Kết quả là mảng các vị trí của sự phù hợp trong chuỗi văn bản.
// Kết quả của đoạn mã trên là Các vị trí của sự phù hợp: [6, 13], tức là mẫu "world" được tìm thấy ở vị trí 6 và 13 trong chuỗi văn bản.