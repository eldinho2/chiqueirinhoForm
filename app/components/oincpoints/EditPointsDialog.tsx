'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

interface EditPointsDialogProps {
  nickname: string;
  currentPoints: number;
  onSave: (points: number) => void;
}

export default function EditPointsDialog({ nickname, currentPoints, onSave }: EditPointsDialogProps) {
  const [points, setPoints] = useState(currentPoints);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave(points);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Oinc Points</DialogTitle>
          <DialogDescription>
            Atualizando pontos de {nickname}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              className="col-span-4"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Modificacões</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}