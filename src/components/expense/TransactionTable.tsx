import { useState } from 'react';
import { Pencil, Sparkles, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getSuggestions } from '../../utils/aiCategoryClassifier.ts';
import { Badge } from '../ui/badge';

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: number, newCategory: string) => void;
}

export function TransactionTable({ transactions, onUpdateTransaction }: TransactionTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ category: string; confidence: number }>>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setNewCategory(transaction.category);
    setIsDialogOpen(true);
    
    // Lấy gợi ý AI
    const suggestions = getSuggestions(transaction.description, transaction.amount);
    setAiSuggestions(suggestions);
  };

  const handleApplyAISuggestion = () => {
    if (aiSuggestions.length > 0) {
      setNewCategory(aiSuggestions[0].category);
    }
  };

  const handleSaveCategory = (id: number) => {
    onUpdateTransaction(id, newCategory);
    setIsDialogOpen(false);
    setEditingId(null);
    setAiSuggestions([]);
    
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (confidence >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Không có giao dịch nào phù hợp với bộ lọc</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ngày</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead className="text-right">Số tiền</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.date}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                  {transaction.category}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    transaction.amount > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {transaction.amount > 0 ? '+' : ''}
                  {transaction.amount.toLocaleString()} đ
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Dialog open={isDialogOpen && editingId === transaction.id} onOpenChange={(open) => {
                  if (!open) {
                    setIsDialogOpen(false);
                    setEditingId(null);
                    setAiSuggestions([]);
                    
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(transaction)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        Phân loại thông minh với AI
                      </DialogTitle>
                      <DialogDescription>
                        Sử dụng AI để phân loại giao dịch của bạn một cách chính xác và nhanh chóng.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-600 mb-1">Giao dịch:</p>
                        <p className="text-gray-900">{transaction.description}</p>
                      </div>

                      {/* AI Suggestions */}
                      {aiSuggestions.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-gray-700">Gợi ý từ AI:</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleApplyAISuggestion}
                              className="gap-2"
                            >
                              <Sparkles className="w-3 h-3" />
                              Áp dụng gợi ý
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {aiSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                  newCategory === suggestion.category
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                                onClick={() => setNewCategory(suggestion.category)}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span>{suggestion.category}</span>
                                    {newCategory === suggestion.category && (
                                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                    )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={getConfidenceColor(suggestion.confidence)}
                                  >
                                    {suggestion.confidence}% tin cậy
                                  </Badge>
                                </div>
                                {index === 0 && (
                                  <p className="text-gray-500 mt-1">
                                    ⭐ Được đề xuất
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Manual Selection */}
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Hoặc chọn thủ công:
                        </label>
                        <Select value={newCategory} onValueChange={setNewCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ăn uống">Ăn uống</SelectItem>
                            <SelectItem value="Mua sắm">Mua sắm</SelectItem>
                            <SelectItem value="Giáo dục">Giáo dục</SelectItem>
                            <SelectItem value="Giải trí">Giải trí</SelectItem>
                            <SelectItem value="Di chuyển">Di chuyển</SelectItem>
                            <SelectItem value="Y tế">Y tế</SelectItem>
                            <SelectItem value="Hóa đơn">Hóa đơn</SelectItem>
                            <SelectItem value="Vay nợ">Vay nợ</SelectItem>
                            <SelectItem value="Thu nhập">Thu nhập</SelectItem>
                            <SelectItem value="Khác">Khác</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={() => handleSaveCategory(transaction.id)}
                        className="w-full"
                      >
                        Lưu thay đổi
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
