import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TransactionTable } from '../components/expense/TransactionTable';

export function ExpenseDetails() {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleFileUpload = () => {
    // Mock file upload
    alert('Chức năng tải file sao kê sẽ được triển khai với backend');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1>Chi tiết chi tiêu</h1>
        <Button onClick={handleFileUpload} className="gap-2">
          <Upload className="w-4 h-4" />
          Tải file sao kê lên
        </Button>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 mb-2">Tháng</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Tháng 1</SelectItem>
                <SelectItem value="2">Tháng 2</SelectItem>
                <SelectItem value="3">Tháng 3</SelectItem>
                <SelectItem value="4">Tháng 4</SelectItem>
                <SelectItem value="5">Tháng 5</SelectItem>
                <SelectItem value="6">Tháng 6</SelectItem>
                <SelectItem value="7">Tháng 7</SelectItem>
                <SelectItem value="8">Tháng 8</SelectItem>
                <SelectItem value="9">Tháng 9</SelectItem>
                <SelectItem value="10">Tháng 10</SelectItem>
                <SelectItem value="11">Tháng 11</SelectItem>
                <SelectItem value="12">Tháng 12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-gray-700 mb-2">Danh mục</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="food">Ăn uống</SelectItem>
                <SelectItem value="shopping">Mua sắm</SelectItem>
                <SelectItem value="education">Giáo dục</SelectItem>
                <SelectItem value="entertainment">Giải trí</SelectItem>
                <SelectItem value="loan">Vay nợ</SelectItem>
                <SelectItem value="other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TransactionTable />
      </div>
    </div>
  );
}
