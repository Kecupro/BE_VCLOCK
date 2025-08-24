/*
  Seed a large set of realistic vouchers for testing.
  Usage:
    node scripts/seed-vouchers.js                     # default 15 vouchers
    VCOUNT=30 node scripts/seed-vouchers.js
    node scripts/seed-vouchers.js --count=50
    node scripts/seed-vouchers.js --uri="<MONGO_URI>" --count=100

  Env:
    MONGODB_URI=mongodb://localhost:27017/datn
*/

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const voucherSchema = require('../model/schemaVoucher');

function getArg(name) {
  const prefix = `--${name}=`;
  const found = process.argv.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : undefined;
}

const cliUri = getArg('uri');
const uri = (cliUri || process.env.MONGODB_URI || '').trim();
if (!uri) {
  console.error('❌ Mongo URI is missing. Provide it via --uri, MONGODB_URI env, or .env file next to serverNode_datn.');
  process.exit(1);
}

const conn = mongoose.createConnection(uri);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function buildCode(prefix, idx) {
  return `${prefix}${pad(idx)}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

function buildNameWithDiscount(isPercent, value, idx) {
  if (isPercent) {
    return `Voucher Giảm ${value}% #${idx}`;
  }
  const k = Math.round(value / 1000);
  return `Voucher Giảm ${k}K #${idx}`;
}

// Curated vouchers matching client-side eligibility rules (covers segments)
function curatedVouchers(now) {
  const startActive = addDays(now, -1);
  const endActive = addDays(now, 15);
  const startUpcoming = addDays(now, 2);
  const endUpcoming = addDays(now, 20);
  const startExpired = addDays(now, -20);
  const endExpired = addDays(now, -5);
  return [
    // New user only (client config)
    { voucher_name: 'New User 10% Off', voucher_code: 'NEW10', start_date: startActive, end_date: endActive, discount_type: 'percentage', discount_value: 10, minimum_order_value: 0, max_discount: 500000 },
    { voucher_name: 'New User 20% Off', voucher_code: 'NEW20', start_date: startActive, end_date: endActive, discount_type: 'percentage', discount_value: 20, minimum_order_value: 0, max_discount: 1000000 },
    // Loyal users (client config minOrders)
    { voucher_name: 'Loyal Customer 20%', voucher_code: 'LOYAL20', start_date: startActive, end_date: endActive, discount_type: 'percentage', discount_value: 20, minimum_order_value: 5000000, max_discount: 1500000 },
    { voucher_name: 'Loyal Customer 30%', voucher_code: 'LOYAL30', start_date: startActive, end_date: endActive, discount_type: 'percentage', discount_value: 30, minimum_order_value: 8000000, max_discount: 2000000 },
    // VIP (high discount)
    { voucher_name: 'VIP 2M Off', voucher_code: 'VIP50', start_date: startActive, end_date: endActive, discount_type: 'fixed', discount_value: 2000000, minimum_order_value: 15000000, max_discount: null },
    // All users
    { voucher_name: 'Freeship 100K', voucher_code: 'FREESHIP', start_date: startActive, end_date: endActive, discount_type: 'fixed', discount_value: 100000, minimum_order_value: 2000000, max_discount: null },
    { voucher_name: 'Sale 10%', voucher_code: 'SALE10', start_date: startActive, end_date: endActive, discount_type: 'percentage', discount_value: 10, minimum_order_value: 0, max_discount: 500000 },
    { voucher_name: 'Sale 20% Upcoming', voucher_code: 'SALE20', start_date: startUpcoming, end_date: endUpcoming, discount_type: 'percentage', discount_value: 20, minimum_order_value: 3000000, max_discount: 1000000 },
    { voucher_name: 'Flash - Đã hết hạn', voucher_code: 'FLASHOLD', start_date: startExpired, end_date: endExpired, discount_type: 'fixed', discount_value: 500000, minimum_order_value: 3000000, max_discount: null },
  ];
}

function generateRandomVouchers(count, now) {
  const vouchers = [];
  for (let i = 1; i <= count; i++) {
    const type = pick(['fixed', 'percentage']);
    const phase = pick(['active', 'upcoming', 'expired']);
    let start;
    let end;
    if (phase === 'active') {
      start = addDays(now, -randomInt(1, 10));
      end = addDays(now, randomInt(5, 30));
    } else if (phase === 'upcoming') {
      start = addDays(now, randomInt(1, 10));
      end = addDays(start, randomInt(5, 30));
    } else {
      end = addDays(now, -randomInt(1, 10));
      start = addDays(end, -randomInt(10, 30));
    }

    const isPercent = type === 'percentage';
    const discount = isPercent ? pick([10, 12, 15, 20, 25, 30, 35]) : pick([200000, 300000, 500000, 700000, 1000000, 1500000, 2000000]);
    const minOrder = pick([0, 2000000, 3000000, 5000000, 8000000, 10000000, 15000000]);
    const maxDisc = isPercent ? pick([500000, 1000000, 1500000, 2000000, 3000000]) : null;

    const codePrefix = isPercent ? 'PERC' : 'FIX';
    const voucher_code = buildCode(codePrefix, i);
    const voucher_name = buildNameWithDiscount(isPercent, discount, i);

    vouchers.push({
      voucher_name,
      voucher_code,
      start_date: start,
      end_date: end,
      discount_type: type,
      discount_value: discount,
      minimum_order_value: minOrder,
      max_discount: maxDisc,
      created_at: now,
      updated_at: now,
    });
  }
  return vouchers;
}

(async () => {
  try {
    const VoucherModel = conn.model('vouchers', voucherSchema);
    const totalRequested = parseInt(getArg('count') || process.env.VCOUNT || '15', 10);
    const now = new Date();

    const curated = curatedVouchers(now);
    const remaining = Math.max(0, totalRequested - curated.length);
    const randoms = generateRandomVouchers(remaining, now);
    const docs = [...curated, ...randoms];

    // Insert ignoring duplicates (unique voucher_code, voucher_name)
    const ops = docs.map((doc) => ({
      updateOne: {
        filter: { voucher_code: doc.voucher_code },
        update: { $setOnInsert: doc },
        upsert: true,
      },
    }));

    const result = await VoucherModel.bulkWrite(ops, { ordered: false });
    console.log('✅ Seeded vouchers:', {
      upserts: result.upsertedCount,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      totalInsertedOrUpserted: docs.length,
    });
  } catch (err) {
    console.error('❌ Error seeding vouchers:', err);
  } finally {
    await conn.close();
    process.exit(0);
  }
})();


