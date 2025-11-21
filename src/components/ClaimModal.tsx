import React, { useState } from 'react';
import { LostItem } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClaimModalProps {
  item: LostItem | null;
  open: boolean;
  onClose: () => void;
}

const ClaimModal = ({ item, open, onClose }: ClaimModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.studentId || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item?.id,
          itemTitle: item?.title,
          itemImage: item?.image,
          studentName: formData.name,
          studentId: formData.studentId,
          description: formData.description,
        }),
      });
      
      if (response.ok) {
        toast.success('Claim submitted successfully! Admin will review your request.');
        setFormData({ name: '', studentId: '', description: '' });
        setIsSubmitting(false);
        onClose();
      } else {
        toast.error('Failed to submit claim. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('Failed to submit claim. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Claim Item</DialogTitle>
          <DialogDescription>
            Fill in the form below to claim this item. Please provide accurate information.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-40 object-cover rounded-lg"
          />
          <h3 className="font-semibold mt-3">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              placeholder="STU2021001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Proof of Ownership</Label>
            <Textarea
              id="description"
              placeholder="Describe how you can prove this item is yours (unique features, serial number, etc.)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimModal;