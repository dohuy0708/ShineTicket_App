import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userEmail, setUserEmail] = useState("");

  // Lấy thông tin user khi vào màn hình
  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const info = await AsyncStorage.getItem("userInfo");
    if (info) {
      const parsedInfo = JSON.parse(info);
      setUserEmail(parsedInfo.email);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Xóa toàn bộ dữ liệu đăng nhập
            await AsyncStorage.removeItem("userToken");
            await AsyncStorage.removeItem("userInfo");

            // 2. Đá về trang login
            router.replace("/login");
          } catch (error) {
            console.error("Lỗi đăng xuất:", error);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      {/* Info Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://ui-avatars.com/api/?name=Huy+Do&background=007AFF&color=fff&size=128",
            }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>Huy Do</Text>
        <Text style={styles.email}>{userEmail || "huydo@gmail.com"}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Organizer</Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={22} color="#333" />
          <Text style={styles.menuText}>Cài đặt</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color="#333" />
          <Text style={styles.menuText}>Trợ giúp & Hỗ trợ</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
  menuSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF0F0",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
