import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'file' | 'select' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface AddItemModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  fields: FormField[];
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  imageFieldName?: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  title,
  description,
  fields,
  onClose,
  onSubmit,
  imageFieldName,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  const validateForm = (): boolean => {
    for (const field of fields) {
      if (field.required && !formData[field.name]) {
        setError(`${field.label} is required`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      
      for (const field of fields) {
        const value = formData[field.name];
        if (value !== undefined && value !== null && value !== '') {
          if (field.type === 'file') {
            fd.append(field.name, value);
          } else {
            fd.append(field.name, String(value));
          }
        }
      }

      await onSubmit(fd);
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setImagePreview(null);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="min-h-24"
                />
              )}

              {field.type === 'select' && (
                <Select
                  value={formData[field.name] || ''}
                  onValueChange={(value) => handleFieldChange(field.name, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === 'file' && (
                <div className="space-y-2">
                  <Input
                    id={field.name}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(field.name, e.target.files?.[0] || null)
                    }
                    className="cursor-pointer"
                  />
                  {imagePreview && field.name === imageFieldName && (
                    <div className="relative w-full max-w-xs">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-auto rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          handleFieldChange(field.name, null);
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-1"
                      >
                        <X size={16} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!['textarea', 'select', 'file'].includes(field.type) && (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
