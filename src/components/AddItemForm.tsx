import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Upload, Package } from 'lucide-react';
import { ItemCategory } from '@/types';
import { toast } from 'sonner';

interface AddItemFormProps {
  onItemAdded: () => void;
}

const AddItemForm = ({ onItemAdded }: AddItemFormProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('other');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
            setImage(file);
            setImagePreview(URL.createObjectURL(blob));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      stopCamera();
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !location || !image) {
      toast.error('Please fill in all required fields and capture/upload an image');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('title', title);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('description', description);
      formData.append('dateFound', new Date().toISOString().split('T')[0]);
      
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        toast.success('Item added successfully!');
        // Reset form
        setTitle('');
        setCategory('other');
        setLocation('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        onItemAdded();
      } else {
        toast.error('Failed to add item. Please try again.');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Capture Image</h3>
          
          {/* Camera Preview */}
          <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                {!streamRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="h-12 w-12 mb-2" />
                    <p>Camera feed will appear here</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Camera Controls */}
          <div className="flex gap-2">
            {!streamRef.current && !imagePreview && (
              <Button 
                type="button" 
                onClick={startCamera}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            )}
            
            {streamRef.current && (
              <Button 
                type="button" 
                onClick={captureImage}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            )}
            
            {(streamRef.current || imagePreview) && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  stopCamera();
                  setImagePreview(null);
                  setImage(null);
                }}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Form Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Item Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Black Wallet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ItemCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="bottle">Bottle</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="bag">Bag</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location Found *</Label>
              <Input
                id="location"
                placeholder="e.g., Library - 2nd Floor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the item and any distinguishing features"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting || !image}
              className="w-full"
            >
              <Package className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Adding Item...' : 'Add Item to Lost & Found'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemForm;