import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
// ĐỔI MÀU Ở ĐÂY
        tabBarActiveTintColor: '#0d9488', // <--- Màu teal
        tabBarInactiveTintColor: '#999',

        // --- CẤU HÌNH MỚI TẠI ĐÂY ---
        // 1. Chuyển layout sang ngang (Icon bên cạnh Text)
        tabBarLabelPosition: "beside-icon",

        // 2. Chỉnh style cho thanh Tab (Màu trắng, bỏ màu đen)
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          height: Platform.OS === "ios" ? 88 : 60, // Tăng chiều cao một chút cho thoáng
          paddingBottom: Platform.OS === "ios" ? 28 : 8, // Căn chỉnh padding dưới
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "600",
          marginLeft: 4, // Khoảng cách giữa icon và text
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Sự kiện",
          tabBarIcon: ({ color }) => (
            <Ionicons name="calendar" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
