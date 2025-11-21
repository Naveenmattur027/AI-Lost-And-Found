export type UserRole = 'student' | 'admin';

export type ItemCategory = 'phone' | 'book' | 'bottle' | 'wallet' | 'bag' | 'electronics' | 'accessories' | 'other';

export interface LostItem {
  id: string;
  title: string;
  category: ItemCategory;
  image: string;
  location: string;
  dateFound: string;
  description: string;
  status: 'available' | 'claimed' | 'pending';
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  studentName: string;
  studentId: string;
  description: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
