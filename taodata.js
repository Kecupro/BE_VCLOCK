const mongoose = require("mongoose");
const conn = mongoose.createConnection("mongodb://localhost:27017/datn");
const newsSchema = require("./model/schemaNews");
const categoryNewsSchema = require("./model/schemaCategoryNews");
const userSchema = require("./model/schemaUser");
const voucherSchema = require("./model/schemaVoucher");
const brandSchema = require("./model/schemaBrand");
const productSchema = require("./model/schemaProduct");
const productImageSchema = require("./model/schemaProductImages");
const productCategoriesSchema = require("./model/schemaproductCategories");
const categorySchema = require("./model/schemaCategory");
const orderSchema = require("./model/schemaOrder");
const orderDetailSchema = require("./model/schemaOrderDetail");
const reviewsSchema = require("./model/schemaReviews");
const wishlistSchema = require("./model/schemaWishlist");
const addressSchema = require("./model/schemaAddress");
const paymentMethodSchema = require("./model/schemaPaymentMethods");
const data = require("./model/data");

let {
  news,
  category_news,
  users,
  vouchers,
  brands,
  products,
  product_images,
  product_categories,
  categories,
  orders,
  order_details,
  reviews,
  wishlists,
  address,
  payment_methods,
} = data;

const chen_news = async () => {
  const NewsModel = await conn.model("news", newsSchema);
  await NewsModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " tin tức")
  );
  for (let i = 0; i < news.length; i++) {
    let newss = new NewsModel(news[i]);
    await newss.save();
  }
};

const chen_category_news = async () => {
  const CategoryNewsModel = await conn.model(
    "category_news",
    categoryNewsSchema
  );
  await CategoryNewsModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " danh mục tin tức")
  );
  for (let i = 0; i < category_news.length; i++) {
    let category_newss = new CategoryNewsModel(category_news[i]);
    await category_newss.save();
  }
};

const chen_user = async () => {
  const UserModel = await conn.model("users", userSchema);
  await UserModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " người dùng")
  );
  for (let i = 0; i < users.length; i++) {
    let user = new UserModel(users[i]);
    await user.save();
  }
};

const chen_voucher = async () => {
  const VoucherModel = await conn.model("vouchers", voucherSchema);
  await VoucherModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " voucher")
  );
  for (let i = 0; i < vouchers.length; i++) {
    let voucher = new VoucherModel(vouchers[i]);
    await voucher.save();
  }
};

const chen_brand = async () => {
  const BrandModel = await conn.model("brands", brandSchema);
  await BrandModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " nhãn hàng")
  );
  for (let i = 0; i < brands.length; i++) {
    let brand = new BrandModel(brands[i]);
    await brand.save();
  }
};

const chen_product = async () => {
  const ProductModel = await conn.model("products", productSchema);
  await ProductModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " sản phẩm")
  );
  for (let i = 0; i < products.length; i++) {
    let product = new ProductModel(products[i]);
    await product.save();
  }
};

const chen_product_image = async () => {
  const ProductImageModel = await conn.model(
    "product_images",
    productImageSchema
  );
  await ProductImageModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " hình ảnh sản phẩm")
  );
  for (let i = 0; i < product_images.length; i++) {
    let product_image = new ProductImageModel(product_images[i]);
    await product_image.save();
  }
};

const chen_product_category = async () => {
  const ProductCategoryModel = await conn.model(
    "product_categories",
    productCategoriesSchema
  );
  await ProductCategoryModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " danh mục sản phẩm")
  );
  for (let i = 0; i < product_categories.length; i++) {
    let product_category = new ProductCategoryModel(product_categories[i]);
    await product_category.save();
  }
};

const chen_category = async () => {
  const CategoryModel = await conn.model("categories", categorySchema);
  await CategoryModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " danh mục")
  );
  for (let i = 0; i < categories.length; i++) {
    let category = new CategoryModel(categories[i]);
    await category.save();
  }
};

const chen_order = async () => {
  const OrderModel = await conn.model("orders", orderSchema);
  await OrderModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " đơn hàng")
  );
  for (let i = 0; i < orders.length; i++) {
    let order = new OrderModel(orders[i]);
    await order.save();
  }
};

const chen_order_detail = async () => {
  const OrderDetailModel = await conn.model("order_details", orderDetailSchema);
  await OrderDetailModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " chi tiết đơn hàng")
  );
  for (let i = 0; i < order_details.length; i++) {
    let order_detail = new OrderDetailModel(order_details[i]);
    await order_detail.save();
  }
};

const chen_review = async () => {
  const ReviewModel = await conn.model("reviews", reviewsSchema);
  await ReviewModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " đánh giá")
  );
  for (let i = 0; i < reviews.length; i++) {
    let review = new ReviewModel(reviews[i]);
    await review.save();
  }
};

const chen_wishlist = async () => {
  const WishlistModel = await conn.model("wishlists", wishlistSchema);
  await WishlistModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " danh sách yêu thích")
  );
  for (let i = 0; i < wishlists.length; i++) {
    let wishlist = new WishlistModel(wishlists[i]);
    await wishlist.save();
  }
};

const chen_address = async () => {
  const AddressModel = await conn.model("address", addressSchema);
  await AddressModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " địa chỉ")
  );
  for (let i = 0; i < address.length; i++) {
    let addr = new AddressModel(address[i]);
    await addr.save();
  }
};

const chen_payment_method = async () => {
  const PaymentMethodModel = await conn.model(
    "payment_methods",
    paymentMethodSchema
  );
  await PaymentMethodModel.deleteMany({}).then((obj) =>
    console.log("Đã xóa ", obj.deletedCount, " phương thức thanh toán")
  );
  for (let i = 0; i < payment_methods.length; i++) {
    let pm = new PaymentMethodModel(payment_methods[i]);
    await pm.save();
  }
};

(async () => {
  await chen_news();
  await chen_category_news();
  await chen_user();
  await chen_voucher();
  await chen_brand();
  await chen_product();
  await chen_product_image();
  await chen_product_category();
  await chen_category();
  await chen_order();
  await chen_order_detail();
  await chen_review();
  await chen_wishlist();
  await chen_address();
  await chen_payment_method();
  process.exit();
})();