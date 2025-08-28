/*
  Script tạo voucher mẫu cho testing
  Tạo 20 voucher với các loại target_audience khác nhau
  
  Usage: node scripts/seed-vouchers.js
*/

const mongoose = require('mongoose');
const voucherSchema = require('../model/schemaVoucher');

// MongoDB connection
const uri = process.env.MONGODB_URI || 'mongodb://cu:123@ac-ekia82x-shard-00-00.2ceby11.mongodb.net:27017,ac-ekia82x-shard-00-01.2ceby11.mongodb.net:27017,ac-ekia82x-shard-00-02.2ceby11.mongodb.net:27017/DATN_V3?ssl=true&replicaSet=atlas-10u8ug-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const conn = mongoose.createConnection(uri);

// Helper functions
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Tạo 20 voucher mẫu với target_audience rõ ràng
function createSampleVouchers() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Bỏ giờ phút giây
  
  return [
    // ===== VOUCHER DÀNH CHO KHÁCH HÀNG MỚI (new_customer) =====
    {
      voucher_name: 'Chào mừng khách hàng mới - Giảm 15%',
      voucher_code: 'NEW15',
      start_date: addDays(today, -1), // Bắt đầu từ hôm qua
      end_date: addDays(today, 30),   // Kết thúc sau 30 ngày
      discount_type: 'percentage',
      discount_value: 15,
      minimum_order_value: 0,
      max_discount: 200000,
      target_audience: 'new_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng mới - Giảm 20%',
      voucher_code: 'NEW20',
      start_date: addDays(today, -1),
      end_date: addDays(today, 45),
      discount_type: 'percentage',
      discount_value: 20,
      minimum_order_value: 100000,
      max_discount: 300000,
      target_audience: 'new_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng mới - Giảm 100K',
      voucher_code: 'NEW100K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 60),
      discount_type: 'fixed',
      discount_value: 100000,
      minimum_order_value: 500000,
      max_discount: null,
      target_audience: 'new_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng mới - Giảm 200K',
      voucher_code: 'NEW200K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 40),
      discount_type: 'fixed',
      discount_value: 200000,
      minimum_order_value: 1000000,
      max_discount: null,
      target_audience: 'new_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng mới - Giảm 25%',
      voucher_code: 'NEW25',
      start_date: addDays(today, 2),  // Sắp bắt đầu
      end_date: addDays(today, 35),
      discount_type: 'percentage',
      discount_value: 25,
      minimum_order_value: 500000,
      max_discount: 400000,
      target_audience: 'new_customer',
      created_at: now,
      updated_at: now
    },

    // ===== VOUCHER DÀNH CHO KHÁCH HÀNG THÂN THIẾT (loyal_customer) =====
    {
      voucher_name: 'Khách hàng thân thiết - Giảm 20%',
      voucher_code: 'LOYAL20',
      start_date: addDays(today, -1),
      end_date: addDays(today, 50),
      discount_type: 'percentage',
      discount_value: 20,
      minimum_order_value: 500000,
      max_discount: 400000,
      target_audience: 'loyal_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng thân thiết - Giảm 30%',
      voucher_code: 'LOYAL30',
      start_date: addDays(today, -1),
      end_date: addDays(today, 55),
      discount_type: 'percentage',
      discount_value: 30,
      minimum_order_value: 800000,
      max_discount: 600000,
      target_audience: 'loyal_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng thân thiết - Giảm 300K',
      voucher_code: 'LOYAL300K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 70),
      discount_type: 'fixed',
      discount_value: 300000,
      minimum_order_value: 1500000,
      max_discount: null,
      target_audience: 'loyal_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng thân thiết - Giảm 500K',
      voucher_code: 'LOYAL500K',
      start_date: addDays(today, 1),  // Sắp bắt đầu
      end_date: addDays(today, 45),
      discount_type: 'fixed',
      discount_value: 500000,
      minimum_order_value: 2000000,
      max_discount: null,
      target_audience: 'loyal_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Khách hàng thân thiết - Giảm 35%',
      voucher_code: 'LOYAL35',
      start_date: addDays(today, 3),  // Sắp bắt đầu
      end_date: addDays(today, 60),
      discount_type: 'percentage',
      discount_value: 35,
      minimum_order_value: 1200000,
      max_discount: 800000,
      target_audience: 'loyal_customer',
      created_at: now,
      updated_at: now
    },

    // ===== VOUCHER DÀNH CHO KHÁCH HÀNG VIP (vip_customer) =====
    {
      voucher_name: 'VIP - Giảm 800K',
      voucher_code: 'VIP800K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 90),
      discount_type: 'fixed',
      discount_value: 800000,
      minimum_order_value: 3000000,
      max_discount: null,
      target_audience: 'vip_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'VIP - Giảm 40%',
      voucher_code: 'VIP40',
      start_date: addDays(today, -1),
      end_date: addDays(today, 100),
      discount_type: 'percentage',
      discount_value: 40,
      minimum_order_value: 3000000,
      max_discount: 1000000,
      target_audience: 'vip_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'VIP - Giảm 1.5 triệu',
      voucher_code: 'VIP1M5',
      start_date: addDays(today, 1),  // Sắp bắt đầu
      end_date: addDays(today, 80),
      discount_type: 'fixed',
      discount_value: 1500000,
      minimum_order_value: 6000000,
      max_discount: null,
      target_audience: 'vip_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'VIP - Giảm 50%',
      voucher_code: 'VIP50',
      start_date: addDays(today, 2),  // Sắp bắt đầu
      end_date: addDays(today, 95),
      discount_type: 'percentage',
      discount_value: 50,
      minimum_order_value: 4000000,
      max_discount: 1200000,
      target_audience: 'vip_customer',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'VIP - Giảm 2 triệu',
      voucher_code: 'VIP2M',
      start_date: addDays(today, -1),
      end_date: addDays(today, 120),
      discount_type: 'fixed',
      discount_value: 2000000,
      minimum_order_value: 8000000,
      max_discount: null,
      target_audience: 'vip_customer',
      created_at: now,
      updated_at: now
    },

    // ===== VOUCHER DÀNH CHO TẤT CẢ (all) =====
    {
      voucher_name: 'Giảm giá 10% cho tất cả',
      voucher_code: 'SALE10',
      start_date: addDays(today, -1),
      end_date: addDays(today, 25),
      discount_type: 'percentage',
      discount_value: 10,
      minimum_order_value: 0,
      max_discount: 200000,
      target_audience: 'all',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Giảm giá 15% cho tất cả',
      voucher_code: 'SALE15',
      start_date: addDays(today, 1),  // Sắp bắt đầu
      end_date: addDays(today, 40),
      discount_type: 'percentage',
      discount_value: 15,
      minimum_order_value: 300000,
      max_discount: 300000,
      target_audience: 'all',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Giảm 100K cho tất cả',
      voucher_code: 'SALE100K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 35),
      discount_type: 'fixed',
      discount_value: 100000,
      minimum_order_value: 500000,
      max_discount: null,
      target_audience: 'all',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Giảm giá 20% cho tất cả',
      voucher_code: 'SALE20',
      start_date: addDays(today, 2),  // Sắp bắt đầu
      end_date: addDays(today, 50),
      discount_type: 'percentage',
      discount_value: 20,
      minimum_order_value: 600000,
      max_discount: 400000,
      target_audience: 'all',
      created_at: now,
      updated_at: now
    },
    {
      voucher_name: 'Giảm 300K cho tất cả',
      voucher_code: 'SALE300K',
      start_date: addDays(today, -1),
      end_date: addDays(today, 45),
      discount_type: 'fixed',
      discount_value: 300000,
      minimum_order_value: 1500000,
      max_discount: null,
      target_audience: 'all',
      created_at: now,
      updated_at: now
  }
  ];
}

// Main function
async function seedVouchers() {
  try {
    console.log('🌱 Bắt đầu tạo voucher mẫu...');
    
    const VoucherModel = conn.model('vouchers', voucherSchema);
    const vouchers = createSampleVouchers();
    
    console.log(`📋 Tạo ${vouchers.length} voucher mẫu:`);
    console.log('   - 5 voucher cho khách hàng mới (new_customer)');
    console.log('   - 5 voucher cho khách hàng thân thiết (loyal_customer)');
    console.log('   - 5 voucher cho khách hàng VIP (vip_customer)');
    console.log('   - 5 voucher cho tất cả (all)');
    
    // Xóa tất cả voucher cũ (optional)
    const deleteResult = await VoucherModel.deleteMany({});
    console.log(`🗑️  Đã xóa ${deleteResult.deletedCount} voucher cũ`);
    
    // Tạo voucher mới
    const result = await VoucherModel.insertMany(vouchers);
    console.log(`✅ Đã tạo thành công ${result.length} voucher mới!`);
    
    // Hiển thị thông tin voucher
    console.log('\n📊 Chi tiết voucher đã tạo:');
    result.forEach((voucher, index) => {
      const status = new Date() < voucher.start_date ? '🟡 Sắp bắt đầu' : 
                    new Date() > voucher.end_date ? '🔴 Hết hạn' : '🟢 Đang hoạt động';
      console.log(`   ${index + 1}. ${voucher.voucher_name} (${voucher.voucher_code})`);
      console.log(`      - Đối tượng: ${voucher.target_audience}`);
      console.log(`      - Giá trị: ${voucher.discount_type === 'percentage' ? voucher.discount_value + '%' : voucher.discount_value.toLocaleString('vi-VN') + 'đ'}`);
      console.log(`      - Thời gian: ${formatDate(voucher.start_date)} → ${formatDate(voucher.end_date)}`);
      console.log(`      - Trạng thái: ${status}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo voucher:', error);
  } finally {
    await conn.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
    process.exit(0);
  }
}

// Chạy script
seedVouchers();


