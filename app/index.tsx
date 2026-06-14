// File: app/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Thêm log để kiểm tra code có chạy không
      console.log("--- ĐANG KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP ---");
      
      const token = await AsyncStorage.getItem("userToken");
      console.log("Token tìm thấy:", token);

      if (token) {
        // Có token -> Vào thẳng App
        console.log("-> Chuyển hướng vào Tabs");
        router.replace("/(tabs)");
      } else {
        // Không có token -> Vào Login
        console.log("-> Chuyển hướng vào Login");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Lỗi kiểm tra:", error);
      router.replace("/login");
    }
  };

  // Chỉ cần hiển thị loading, việc chuyển hướng đã xử lý trong hàm trên
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#0d9488" />
    </View>
  );
}