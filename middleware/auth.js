const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không tồn tại" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Đảm bảo role là string, loại bỏ khoảng trắng/thừa
    decoded.role = decoded.role ? decoded.role.toString().trim() : "0";
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// Phân quyền admin (role 1 hoặc 2)
const isAdmin = (req, res, next) => {
  const role = req.user.role ? req.user.role.toString().trim() : "0";
  if (role !== "1" && role !== "2") {
    return res.status(403).json({ message: "Không có quyền admin" });
  }
  next();
};

// Phân quyền super admin (chỉ role 2)
const isSuperAdmin = (req, res, next) => {
  const role = req.user.role ? req.user.role.toString().trim() : "0";
  if (role !== "2") {
    return res.status(403).json({ message: "Chỉ Super Admin mới có quyền này" });
  }
  next();
};

// Kiểm tra quyền xóa user (chỉ super admin mới xóa được admin)
const canDeleteUser = (req, res, next) => {
  const role = req.user.role ? req.user.role.toString().trim() : "0";
  // Super admin có thể xóa tất cả
  if (role === "2") {
    return next();
  }
  // Admin thường không thể xóa ai cả
  return res.status(403).json({ message: "Chỉ Super Admin mới có quyền xóa người dùng" });
};

module.exports = { verifyToken, isAdmin, isSuperAdmin, canDeleteUser };
