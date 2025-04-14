
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface DialogFooterButtonsProps {
  onCancel: () => void;
}

const DialogFooterButtons: React.FC<DialogFooterButtonsProps> = ({ onCancel }) => {
  return (
    <DialogFooter className="pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        取消
      </Button>
      <Button type="submit">保存</Button>
    </DialogFooter>
  );
};

export default DialogFooterButtons;
