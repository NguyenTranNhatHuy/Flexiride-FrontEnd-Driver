export const formatCurrency = (amount) => {
  if (!amount) return "0 đ";

  // Đảm bảo amount là kiểu số
  const numericAmount = parseInt(amount, 10);

  return numericAmount
    .toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })
    .replace("₫", "đ");
};
