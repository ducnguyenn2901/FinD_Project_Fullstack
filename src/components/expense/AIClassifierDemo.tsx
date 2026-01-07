import { useState } from 'react';
import { Sparkles, Play, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { classifyTransaction, type ClassificationResult } from '../../utils/aiCategoryClassifier';

export function AIClassifierDemo() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(-100000);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const exampleTransactions = [
    'Mua cà phê Starbucks',
    'Lương tháng 12',
    'Đổ xăng xe máy',
    'Xem phim CGV',
    'Mua sách Fahasa',
    'Trả góp điện thoại',
    'Khám bệnh tại bệnh viện',
    'Tiền điện tháng 12',
  ];

  const handleClassify = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const classificationResult = classifyTransaction(description, amount);
      setResult(classificationResult);
      setIsAnimating(false);
    }, 800);
  };

  const handleExampleClick = (example: string) => {
    setDescription(example);
    setResult(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
          <Sparkles className="w-5 h-5" />
          <span>AI Category Classifier Demo</span>
        </div>
        <h2 className="text-gray-700">
          Thử nghiệm công nghệ phân loại thông minh
        </h2>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">
              Mô tả giao dịch:
            </label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập mô tả giao dịch..."
              className="mb-3"
            />
            
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-600 mr-2">Ví dụ:</span>
              {exampleTransactions.map((example, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Số tiền (VNĐ):
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Nhập số tiền..."
            />
            <p className="text-gray-500 mt-1">
              Số dương = Thu nhập, Số âm = Chi tiêu
            </p>
          </div>

          <Button
            onClick={handleClassify}
            disabled={!description || isAnimating}
            className="w-full gap-2"
          >
            {isAnimating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang phân tích...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Phân loại với AI
              </>
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h3 className="text-purple-900">Kết quả phân loại</h3>
            </div>

            <div className="bg-white p-4 rounded-lg border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Danh mục được đề xuất:</span>
                <Badge
                  variant="outline"
                  className={getConfidenceColor(result.confidence)}
                >
                  {result.confidence}% tin cậy
                </Badge>
              </div>
              <div className="text-purple-900 text-xl mb-4">
                {result.category}
              </div>

              {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-2">Từ khóa được phát hiện:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="secondary">
                        #{keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {result.alternatives && result.alternatives.length > 0 && (
              <div>
                <p className="text-gray-700 mb-2">Các lựa chọn thay thế:</p>
                <div className="space-y-2">
                  {result.alternatives.map((alt, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                    >
                      <span className="text-gray-700">{alt.category}</span>
                      <Badge variant="outline" className="bg-gray-50">
                        {alt.confidence}% tin cậy
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                💡 <strong>Cách hoạt động:</strong> AI phân tích mô tả giao dịch và so sánh với 
                hàng trăm từ khóa trong cơ sở dữ liệu để tìm danh mục phù hợp nhất. 
                Độ tin cậy càng cao nghĩa là AI càng chắc chắn về kết quả.
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-gray-900 mb-3">
          ✨ Tính năng nổi bật của AI Classifier
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Phân loại thông minh dựa trên hơn 200+ từ khóa tiếng Việt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Tự động nhận diện thu nhập vs chi tiêu dựa trên số tiền</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Hiển thị độ tin cậy và các lựa chọn thay thế</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Hỗ trợ 10 danh mục: Ăn uống, Mua sắm, Giáo dục, Giải trí, Di chuyển, Y tế, Hóa đơn, Vay nợ, Thu nhập, Khác</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Có thể mở rộng và học thêm từ hành vi người dùng</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
