import { useState } from 'react';
import { Sparkles, Wand2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { classifyBatchTransactions, type Transaction as ClassifierTransaction } from '../../utils/aiCategoryClassifier';

type Transaction = ClassifierTransaction & {
  id: number;
  date: string;
  category: string;
};

interface AutoClassifyButtonProps {
  transactions: Transaction[];
  onApplyClassification: (updatedTransactions: Transaction[]) => void;
}

export function AutoClassifyButton({ transactions, onApplyClassification }: AutoClassifyButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [classifiedTransactions, setClassifiedTransactions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAutoClassify = () => {
    setIsProcessing(true);
    
    // Simulate processing delay for better UX
    setTimeout(() => {
      const classified = classifyBatchTransactions(transactions);
      setClassifiedTransactions(classified);
      setIsProcessing(false);
    }, 500);
  };

  const handleApply = () => {
    const updatedTransactions = classifiedTransactions.map((t) => ({
      id: t.id,
      date: t.date,
      description: t.description,
      category: t.suggestedCategory || t.category,
      amount: t.amount,
    }));
    
    onApplyClassification(updatedTransactions);
    setIsOpen(false);
  };

  const changesCount = classifiedTransactions.filter(
    (t) => t.suggestedCategory !== t.category
  ).length;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100 text-green-800';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleAutoClassify}
        >
          <Wand2 className="w-4 h-4" />
          Tự động phân loại với AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Phân loại tự động với AI
          </DialogTitle>
          <DialogDescription>
            AI đã phân tích {classifiedTransactions.length} giao dịch và đề xuất {changesCount} thay đổi
          </DialogDescription>
        </DialogHeader>

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600">Đang phân tích giao dịch với AI...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">
                  Tìm thấy {changesCount} giao dịch có thể tối ưu phân loại
                </span>
              </div>
            </div>

            <ScrollArea className="h-[250px] pr-3">
              <div className="space-y-3">
                {classifiedTransactions.map((transaction) => {
                  const hasChange = transaction.suggestedCategory !== transaction.category;
                  
                  return (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-lg border-2 ${
                        hasChange
                          ? 'border-purple-200 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-1">
                            {transaction.description}
                          </p>
                          <p className="text-gray-500">
                            {transaction.date} • {transaction.amount.toLocaleString()} đ
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={getConfidenceColor(transaction.confidence)}
                        >
                          {transaction.confidence}% tin cậy
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Hiện tại:</span>
                          <Badge variant="outline" className="bg-gray-100">
                            {transaction.category}
                          </Badge>
                        </div>
                        
                        {hasChange && (
                          <>
                            <span className="text-gray-400">→</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">AI đề xuất:</span>
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                {transaction.suggestedCategory}
                              </Badge>
                            </div>
                          </>
                        )}
                        
                        {!hasChange && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Đã chính xác</span>
                          </div>
                        )}
                      </div>

                      {transaction.matchedKeywords && transaction.matchedKeywords.length > 0 && (
                        <div className="mt-2 text-gray-500">
                          <span className="mr-2">Từ khóa:</span>
                          {transaction.matchedKeywords.slice(0, 3).map((keyword: string, idx: number) => (
                            <span key={idx} className="inline-block mr-2 text-purple-600">
                              #{keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                onClick={handleApply}
                className="flex-1 gap-2"
                disabled={changesCount === 0}
              >
                <CheckCircle className="w-4 h-4" />
                Áp dụng {changesCount} thay đổi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
