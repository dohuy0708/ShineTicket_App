import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Kiểm tra xem trong bộ nhớ có key 'userToken' không
      const token = await AsyncStorage.getItem("userToken");

      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Lỗi kiểm tra đăng nhập:", error);
      setIsLoggedIn(false);
    } finally {
      // Dù kết quả thế nào thì cũng tắt loading
      setIsLoading(false);
    }
  };

  // 1. Nếu đang kiểm tra (load app), hiện vòng quay loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // 2. Nếu đã đăng nhập -> Vào thẳng Tabs
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }

  // 3. Nếu chưa -> Về trang Login
  return <Redirect href="/login" />;
}
