import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function CreateGoalDialog({ open, onOpenChange, onSubmit }: CreateGoalDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    startDate: '',
    endDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      target: Number(formData.target),
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
    setFormData({ name: '', target: '', startDate: '', endDate: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo mục tiêu mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên mục tiêu</Label>
            <Input
              id="name"
              placeholder="Ví dụ: Tiết kiệm mua laptop"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Số tiền mục tiêu (đ)</Label>
            <Input
              id="target"
              type="number"
              placeholder="25000000"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Ngày bắt đầu</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Ngày kết thúc dự kiến</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Tạo mục tiêu
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
