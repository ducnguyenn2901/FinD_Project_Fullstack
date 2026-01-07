/**
 * Test cases for AI Category Classifier (TypeScript version)
 */

import { classifyTransaction } from './aiCategoryClassifier.ts';

interface TestTransaction {
  description: string;
  amount: number;
  expectedCategory: string;
}

interface TestResult {
  index: number;
  description: string;
  expected: string;
  predicted: string;
  confidence: number;
  isCorrect: boolean;
  matchedKeywords: string[];
}

interface CategoryStat {
  total: number;
  correct: number;
}

interface TestSummary {
  accuracy: string;
  totalTests: number;
  correctPredictions: number;
  results: TestResult[];
  categoryStats: Record<string, CategoryStat>;
}

// Test dataset
const testTransactions: TestTransaction[] = [
  // Ăn uống
  { description: 'Mua đồ ăn tại siêu thị Vinmart', amount: -350000, expectedCategory: 'Ăn uống' },
  { description: 'Ăn tối nhà hàng Kichi Kichi', amount: -680000, expectedCategory: 'Ăn uống' },
  { description: 'Starbucks coffee', amount: -120000, expectedCategory: 'Ăn uống' },
  { description: 'Grab Food - Gogi House', amount: -450000, expectedCategory: 'Ăn uống' },
  { description: 'Highland Coffee trà sữa', amount: -85000, expectedCategory: 'Ăn uống' },

  // Mua sắm
  { description: 'Mua quần áo tại Zara', amount: -850000, expectedCategory: 'Mua sắm' },
  { description: 'Shopee - iPhone 15 Pro Max', amount: -28000000, expectedCategory: 'Mua sắm' },
  { description: 'Lazada giày Nike', amount: -2500000, expectedCategory: 'Mua sắm' },
  { description: 'Mỹ phẩm Hasaki', amount: -320000, expectedCategory: 'Mua sắm' },

  // Giáo dục
  { description: 'Mua sách giáo trình đại học', amount: -480000, expectedCategory: 'Giáo dục' },
  { description: 'Học phí khóa học Udemy', amount: -399000, expectedCategory: 'Giáo dục' },
  { description: 'Trung tâm tiếng Anh ILA', amount: -5000000, expectedCategory: 'Giáo dục' },
  { description: 'Fahasa mua sách lập trình', amount: -250000, expectedCategory: 'Giáo dục' },

  // Giải trí
  { description: 'Xem phim tại rạp CGV', amount: -180000, expectedCategory: 'Giải trí' },
  { description: 'Vé concert Mỹ Tâm', amount: -1500000, expectedCategory: 'Giải trí' },
  { description: 'Netflix Premium tháng 11', amount: -260000, expectedCategory: 'Giải trí' },
  { description: 'Gym California Fitness', amount: -1200000, expectedCategory: 'Giải trí' },
  { description: 'Karaoke gia đình', amount: -350000, expectedCategory: 'Giải trí' },

  // Di chuyển
  { description: 'Đổ xăng xe máy', amount: -420000, expectedCategory: 'Di chuyển' },
  { description: 'Grab từ nhà đến sân bay', amount: -250000, expectedCategory: 'Di chuyển' },
  { description: 'Vé máy bay Vietnam Airlines', amount: -3500000, expectedCategory: 'Di chuyển' },
  { description: 'Bảo dưỡng xe ô tô', amount: -2500000, expectedCategory: 'Di chuyển' },
  { description: 'Phí đường cao tốc', amount: -85000, expectedCategory: 'Di chuyển' },

  // Y tế
  { description: 'Khám bệnh tại phòng khám', amount: -500000, expectedCategory: 'Y tế' },
  { description: 'Mua thuốc nhà thuốc An Khang', amount: -180000, expectedCategory: 'Y tế' },
  { description: 'Nha khoa răng sứ', amount: -5000000, expectedCategory: 'Y tế' },
  { description: 'Tiêm vaccine COVID-19', amount: -300000, expectedCategory: 'Y tế' },

  // Hóa đơn
  { description: 'Tiền điện tháng 11 EVN', amount: -850000, expectedCategory: 'Hóa đơn' },
  { description: 'Tiền nước', amount: -120000, expectedCategory: 'Hóa đơn' },
  { description: 'Cước internet FPT', amount: -300000, expectedCategory: 'Hóa đơn' },
  { description: 'Tiền nhà tháng 11', amount: -5000000, expectedCategory: 'Hóa đơn' },
  { description: 'Phí quản lý chung cư', amount: -500000, expectedCategory: 'Hóa đơn' },

  // Vay nợ
  { description: 'Trả góp tháng 11', amount: -1500000, expectedCategory: 'Vay nợ' },
  { description: 'Vietcombank trả nợ thẻ tín dụng', amount: -5000000, expectedCategory: 'Vay nợ' },
  { description: 'Home Credit trả góp điện thoại', amount: -2000000, expectedCategory: 'Vay nợ' },

  // Thu nhập
  { description: 'Lương tháng 11', amount: 25000000, expectedCategory: 'Thu nhập' },
  { description: 'Thưởng cuối năm công ty', amount: 50000000, expectedCategory: 'Thu nhập' },
  { description: 'Hoa hồng bán hàng', amount: 3000000, expectedCategory: 'Thu nhập' },
  { description: 'Lãi tiết kiệm ngân hàng', amount: 500000, expectedCategory: 'Thu nhập' },
];

/**
 * Run comprehensive tests on the AI classifier
 */
export function runClassifierTests(): TestSummary {
  console.log('🤖 Testing AI Category Classifier...\n');

  let correctCount = 0;
  const totalCount = testTransactions.length;

  const results: TestResult[] = [];

  testTransactions.forEach((test, index) => {
    const result = classifyTransaction(test.description, test.amount);
    const isCorrect = result.category === test.expectedCategory;

    if (isCorrect) correctCount++;

    results.push({
      index: index + 1,
      description: test.description,
      expected: test.expectedCategory,
      predicted: result.category,
      confidence: result.confidence,
      isCorrect,
      matchedKeywords: result.matchedKeywords
    });

    const icon = isCorrect ? '✅' : '❌';
    console.log(`${icon} Test ${index + 1}/${totalCount}`);
    console.log(`   Mô tả: "${test.description}"`);
    console.log(`   Dự kiến: ${test.expectedCategory} | AI: ${result.category} (${result.confidence}% tin cậy)`);

    if (!isCorrect) {
      console.log(`   ⚠️  Sai! Keywords: ${result.matchedKeywords.join(', ')}`);
    }
    console.log('');
  });

  const accuracy = (correctCount / totalCount * 100).toFixed(2);
  console.log(`📊 KẾT QUAN: ${accuracy}%`);

  const categoryStats: Record<string, CategoryStat> = {};

  results.forEach(r => {
    if (!categoryStats[r.expected]) {
      categoryStats[r.expected] = { total: 0, correct: 0 };
    }
    categoryStats[r.expected].total++;
    if (r.isCorrect) categoryStats[r.expected].correct++;
  });

  return {
    accuracy,
    totalTests: totalCount,
    correctPredictions: correctCount,
    results,
    categoryStats
  };
}

/**
 * Test a single transaction
 */
export function testSingleTransaction(description: string, amount: number) {
  console.log(`\n🧪 Testing: "${description}"\n`);

  const result = classifyTransaction(description, amount);

  console.log('📊 KẾT QUẢ:');
  console.log(`   Danh mục: ${result.category}`);
  console.log(`   Độ tin cậy: ${result.confidence}%`);
  console.log(`   Từ khóa khớp: ${result.matchedKeywords.join(', ') || 'Không có'}`);

  if (result.alternatives && result.alternatives.length > 0) {
    console.log('\n   Các lựa chọn khác:');
    result.alternatives.forEach((alt, idx) => {
      console.log(`   ${idx + 1}. ${alt.category} (${alt.confidence}%)`);
    });
  }

  return result;
}
