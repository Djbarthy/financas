import React, { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import ImageCrop from './ImageCrop';
import { Camera } from 'lucide-react';

interface WalletFormProps {
  onClose: () => void;
  wallet?: any;
}

const WalletForm: React.FC<WalletFormProps> = ({ onClose, wallet }) => {
  const { createWallet, updateWallet, deleteWallet } = useFinancial();
  const [showImageCrop, setShowImageCrop] = useState(false);
  const [formData, setFormData] = useState({
    name: wallet?.name || '',
    description: wallet?.description || '',
    imageUrl: wallet?.imageUrl || '',
    color: wallet?.color || '#b66e6f',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    if (wallet) {
      updateWallet(wallet.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        color: formData.color,
      });
    } else {
      createWallet({
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        color: formData.color,
        balance: 0,
      });
    }
    onClose();
  };

  const handleImageCropComplete = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl: croppedImageUrl }));
    setShowImageCrop(false);
  };

  const handleDelete = () => {
    if (wallet && window.confirm('Tem certeza que deseja remover esta carteira?')) {
      deleteWallet(wallet.id);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-primary dark:text-brand-yellow-pastel">
              {wallet ? 'Editar Carteira' : 'Nova Carteira'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Carteira</Label>
              <Input
                id="name"
                placeholder="Ex: Carteira Principal"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={10}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Ex: Gastos pessoais do mês"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <Label>Imagem da Carteira (opcional)</Label>
              <div className="flex items-center space-x-4 mt-2">
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowImageCrop(true)}
                  className="flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>{formData.imageUrl ? 'Alterar Imagem' : 'Adicionar Imagem'}</span>
                </Button>
              </div>
            </div>

            <div>
              <Label>Cor da Carteira</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  '#b66e6f', // brand primary
                  '#cf8884', // brand rose earthy
                  '#f7c873', // brand yellow pastel
                  '#6f8ab6', // azul pastel
                  '#6fb68a', // verde pastel
                  '#b66fb6', // lilás pastel
                  '#f7a873', // laranja pastel
                  '#8884cf', // roxo pastel
                  '#b6b66f', // oliva pastel
                  '#6fb6b6', // ciano pastel
                ].map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none ${formData.color === color ? 'border-brand-primary ring-2 ring-brand-primary' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    aria-label={`Selecionar cor ${color}`}
                  >
                    {formData.color === color && (
                      <span className="block w-3 h-3 rounded-full bg-white border border-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              {wallet && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Remover
                </Button>
              )}
              <Button 
                type="submit" 
                className="bg-brand-primary hover:bg-brand-rose-earthy"
              >
                {wallet ? 'Salvar' : 'Criar Carteira'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {showImageCrop && (
        <ImageCrop
          onCropComplete={handleImageCropComplete}
          onClose={() => setShowImageCrop(false)}
        />
      )}
    </>
  );
};

export default WalletForm;
