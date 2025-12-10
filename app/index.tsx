// Trong file app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Sửa dòng này để test màn hình Login
  return <Redirect href="/login" />; 
}