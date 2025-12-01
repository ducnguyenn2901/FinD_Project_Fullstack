import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const mockTransactions = [
  {
    id: 1,
    date: '2024-11-24',
    description: 'Mua đồ ăn tại siêu thị',
    category: 'Ăn uống',
    amount: -350000,
  },
  {
    id: 2,
    date: '2024-11-23',
    description: 'Lương tháng 11',
    category: 'Thu nhập',
    amount: 25000000,
  },
  {
    id: 3,
    date: '2024-11-22',
    description: 'Mua sách giáo trình',
    category: 'Giáo dục',
    amount: -480000,
  },
  {
    id: 4,
    date: '2024-11-21',
    description: 'Xem phim tại rạp',
    category: 'Giải trí',
    amount: -180000,
  },
  {
    id: 5,
    date: '2024-11-20',
    description: 'Mua quần áo',
    category: 'Mua sắm',
    amount: -850000,
  },
  {
    id: 6,
    date: '2024-11-19',
    description: 'Ăn tối nhà hàng',
    category: 'Ăn uống',
    amount: -680000,
  },
  {
    id: 7,
    date: '2024-11-18',
    description: 'Trả góp tháng 11',
    category: 'Vay nợ',
    amount: -1500000,
  },
  {
    id: 8,
    date: '2024-11-17',
    description: 'Đổ xăng xe',
    category: 'Khác',
    amount: -420000,
  },
];

export function TransactionTable() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');

  const handleSaveCategory = (id: number) => {
    setTransactions(
      transactions.map((t) =>
        t.id === id ? { ...t, category: newCategory } : t
      )
    );
    setEditingId(null);
  };

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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(transaction.id);
                        setNewCategory(transaction.category);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chỉnh sửa danh mục</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <p className="text-gray-600 mb-2">Giao dịch:</p>
                        <p>{transaction.description}</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Danh mục mới
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
