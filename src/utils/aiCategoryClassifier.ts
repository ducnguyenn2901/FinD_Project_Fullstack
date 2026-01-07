/**
 * AI-powered category classifier for transactions (TypeScript version)
 */

// ==== TYPES ====

export type Category =
  | 'Ăn uống'
  | 'Mua sắm'
  | 'Giáo dục'
  | 'Giải trí'
  | 'Di chuyển'
  | 'Y tế'
  | 'Hóa đơn'
  | 'Vay nợ'
  | 'Thu nhập'
  | 'Khác';

export interface Transaction {
  description: string;
  amount: number;
  [key: string]: unknown;
}

export interface ClassificationResult {
  category: Category;
  confidence: number;
  matchedKeywords: string[];
  method: string;
  alternatives?: { category: Category; confidence: number }[];
}

// ==== KEYWORDS ====

export const categoryKeywords: Record<Category, string[]> = {
  'Ăn uống': [
    'ăn', 'uống', 'nhà hàng', 'quán', 'cà phê', 'coffee', 'cơm', 'phở',
    'bún', 'bánh', 'trà', 'cafe', 'buffet', 'fastfood', 'mcdonald', 'kfc',
    'lotteria', 'pizza', 'burger', 'sushi', 'hotpot', 'lẩu', 'nướng', 'bbq',
    'trà sữa', 'siêu thị', 'coopmart', 'vinmart', 'big c', 'lotte mart',
    'thực phẩm', 'đồ ăn', 'thức ăn', 'món ăn', 'bữa', 'tối', 'sáng', 'trưa',
    'highland', 'starbucks', 'phúc long', 'gogi', 'kichi', 'food',
    'grab food', 'shopee food', 'baemin', 'now', 'delivery'
  ],

  'Mua sắm': [
    'mua', 'quần áo', 'giày', 'dép', 'túi xách', 'áo', 'váy', 'đầm', 'shopping',
    'thời trang', 'fashion', 'zara', 'h&m', 'uniqlo', 'adidas', 'nike',
    'chợ', 'siêu thị', 'mall', 'mỹ phẩm', 'sữa rửa mặt', 'kem dưỡng',
    'son', 'nước hoa', 'lazada', 'shopee', 'tiki', 'sendo', 'online',
    'điện thoại', 'laptop', 'máy tính', 'iphone', 'samsung', 'oppo',
    'đồ dùng', 'nội thất', 'trang trí', 'ikea', 'hasaki', 'guardian',
    'watson', 'phụ kiện', 'đồng hồ'
  ],

  'Giáo dục': [
    'học', 'sách', 'giáo trình', 'khóa học', 'course', 'lớp học', 'trường',
    'học phí', 'đào tạo', 'training', 'giáo dục', 'education', 'udemy',
    'coursera', 'skillshare', 'fahasa', 'nhà sách', 'tài liệu', 'văn phòng phẩm',
    'bút', 'vở', 'thi', 'kỳ thi', 'ielts', 'toeic', 'tiếng anh', 'đại học',
    'cao học', 'thạc sĩ', 'tiến sĩ', 'trung tâm', 'gia sư', 'dạy kèm'
  ],

  'Giải trí': [
    'phim', 'rạp', 'cinema', 'cgv', 'lotte cinema', 'galaxy', 'game', 'chơi',
    'du lịch', 'travel', 'tour', 'khách sạn', 'hotel', 'resort', 'vui chơi',
    'entertainment', 'karaoke', 'bar', 'club', 'gym', 'thể thao', 'fitness',
    'yoga', 'spa', 'massage', 'bóng đá', 'bóng rổ', 'cầu lông', 'bể bơi',
    'vé', 'ticket', 'concert', 'nhạc hội', 'sự kiện', 'event', 'show',
    'netflix', 'spotify', 'youtube premium', 'game online', 'steam', 'xbox',
    'playstation', 'công viên', 'sở thú'
  ],

  'Di chuyển': [
    'xăng', 'dầu', 'petrol', 'oil', 'xe', 'ô tô', 'car', 'motor', 'xe máy',
    'grab', 'uber', 'be', 'taxi', 'xe ôm', 'bus', 'xe buýt', 'metro', 'tàu',
    'máy bay', 'flight', 'vé máy bay', 'vietnam airlines', 'vietjet', 'bamboo',
    'bảo dưỡng', 'sửa xe', 'rửa xe', 'đỗ xe', 'gửi xe', 'parking', 'cầu đường',
    'phí đường', 'toll', 'viettel post', 'giao hàng'
  ],

  'Y tế': [
    'bệnh viện', 'phòng khám', 'khám bệnh', 'thuốc', 'pharmacy', 'nhà thuốc',
    'bác sĩ', 'doctor', 'nha khoa', 'dental', 'mắt', 'tai mũi họng', 'xét nghiệm',
    'test', 'vaccine', 'tiêm', 'chích', 'y tế', 'health', 'sức khỏe', 'điều trị',
    'chữa', 'viện phí', 'phẫu thuật', 'surgery', 'bảo hiểm y tế', 'chăm sóc'
  ],

  'Hóa đơn': [
    'điện', 'nước', 'electric', 'water', 'evn', 'internet', 'wifi', 'phone',
    'điện thoại', 'viettel', 'vinaphone', 'mobifone', 'fpt', 'vnpt', 'cáp',
    'truyền hình', 'tv', 'netflix', 'spotify', 'gas', 'ga', 'tiền nhà',
    'rent', 'thuê', 'phí', 'fee', 'dịch vụ', 'service', 'quản lý', 'chung cư'
  ],

  'Vay nợ': [
    'vay', 'nợ', 'loan', 'debt', 'trả góp', 'góp', 'installment', 'lãi suất',
    'interest', 'ngân hàng', 'bank', 'credit', 'thẻ tín dụng', 'mượn', 'cho vay',
    'home credit', 'fe credit', 'tín dụng', 'vcb', 'vietcombank', 'techcombank',
    'vietinbank', 'agribank', 'mb', 'acb', 'bidv', 'sacombank'
  ],

  'Thu nhập': [
    'lương', 'salary', 'wage', 'thưởng', 'bonus', 'thu nhập', 'income',
    'tiền công', 'được trả', 'receive', 'nhận', 'commission', 'hoa hồng',
    'dividend', 'cổ tức', 'lãi', 'profit', 'kiếm', 'earn'
  ],

  'Khác': []
};

// ==== HELPERS ====

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

function calculateCategoryScore(description: string, category: Category) {
  const normalizedDesc = normalizeText(description);
  const keywords = categoryKeywords[category] ?? [];

  let score = 0;
  const matchedKeywords: string[] = [];

  for (const keyword of keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (normalizedDesc.includes(normalizedKeyword)) {
      score += keyword.length * 2;
      matchedKeywords.push(keyword);
    }

    const descWords = normalizedDesc.split(/\s+/);
    const keywordWords = normalizedKeyword.split(/\s+/);

    for (const kw of keywordWords) {
      if (descWords.includes(kw)) score += 1;
    }
  }

  return { score, matchedKeywords };
}

// ==== MAIN FUNCTIONS ====

export function classifyTransaction(
  description: string,
  amount: number = 0
): ClassificationResult {
  if (!description || typeof description !== 'string') {
    return {
      category: 'Khác',
      confidence: 0,
      matchedKeywords: [],
      method: 'default'
    };
  }

  // Ưu tiên thu nhập nếu amount > 0
  if (amount > 0) {
    const income = calculateCategoryScore(description, 'Thu nhập');
    if (income.score > 0) {
      return {
        category: 'Thu nhập',
        confidence: Math.min(income.score * 10, 95),
        matchedKeywords: income.matchedKeywords,
        method: 'keyword-match'
      };
    }
  }

  const results: {
    category: Category;
    score: number;
    matchedKeywords: string[];
  }[] = [];

  for (const category of Object.keys(categoryKeywords) as Category[]) {
    if (amount > 0 && category === 'Thu nhập') continue;

    const r = calculateCategoryScore(description, category);
    if (r.score > 0) {
      results.push({
        category,
        score: r.score,
        matchedKeywords: r.matchedKeywords
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  if (results.length > 0) {
    const top = results[0];
    return {
      category: top.category,
      confidence: Math.min(top.score * 8, 95),
      matchedKeywords: top.matchedKeywords,
      method: 'keyword-match',
      alternatives: results.slice(1, 3).map(r => ({
        category: r.category,
        confidence: Math.min(r.score * 8, 90)
      }))
    };
  }

  return {
    category: 'Khác',
    confidence: 20,
    matchedKeywords: [],
    method: 'default'
  };
}

export function classifyBatchTransactions(
  transactions: Transaction[]
) {
  return transactions.map(t => {
    const result = classifyTransaction(t.description, 0);

    return {
      ...t,
      suggestedCategory: result.category,
      confidence: result.confidence,
      matchedKeywords: result.matchedKeywords,
      alternatives: result.alternatives
    };
  });
}

export function getSuggestions(description: string, topN = 3) {
  const result = classifyTransaction(description);

  const suggestions = [
    { category: result.category, confidence: result.confidence }
  ];

  if (result.alternatives) {
    suggestions.push(...result.alternatives);
  }

  return suggestions.slice(0, topN);
}
