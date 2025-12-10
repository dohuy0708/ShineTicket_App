import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Import hook này để lấy khoảng cách an toàn (tránh tai thỏ)
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- CẬP NHẬT: THÊM DỮ LIỆU ĐỂ TEST SCROLL ---
const MOCK_EVENTS = [
  {
    id: "1",
    title: "Đại nhạc hội EDM 2025",
    time: "19:00 - 20/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  },
  {
    id: "2",
    title: "Hội thảo Tech Summit",
    time: "08:00 - 25/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
  },
  {
    id: "3",
    title: "Workshop: AI & Future",
    time: "14:00 - 28/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&q=80",
  },
  {
    id: "4",
    title: "Gala Dinner Doanh Nhân",
    time: "18:30 - 30/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1519671482538-581aca198e32?w=500&q=80",
  },
  {
    id: "5",
    title: "Lễ hội Ẩm thực Đường phố",
    time: "09:00 - 01/01/2026",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80",
  },
  {
    id: "6",
    title: "Triển lãm tranh nghệ thuật",
    time: "09:00 - 10/11/2025",
    status: "past",
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=500&q=80",
  },
  {
    id: "7",
    title: "Họp mặt CLB Startup",
    time: "08:00 - 05/11/2025",
    status: "past",
    image:
      "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=500&q=80",
  },
  {
    id: "8",
    title: "Music Show: Mùa Thu",
    time: "20:00 - 01/10/2025",
    status: "past",
    image:
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80",
  },
];

export default function EventScreen() {
  // Lấy thông số safe area
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchText, setSearchText] = useState("");

  const filteredEvents = MOCK_EVENTS.filter(
    (event) =>
      event.status === activeTab &&
      event.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderEventItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Image source={{ uri: item.image }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.eventTime}>{item.time}</Text>
          </View>
        </View>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardBottom}>
        <TouchableOpacity style={[styles.actionButton, styles.manageBtn]}>
          <Text style={styles.manageBtnText}>Quản lý</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.checkInBtn]}>
          <Ionicons
            name="qr-code-outline"
            size={18}
            color="#fff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.checkInBtnText}>Check-In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/shineticket.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Organizer Center</Text>
        </View>
      </View>

      {/* --- SEARCH & FILTER --- */}
      <View style={styles.filterSection}>
        {/* Thanh Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm sự kiện..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeTab === "upcoming" && styles.activeFilterBtn,
            ]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === "upcoming" && styles.activeFilterText,
              ]}
            >
              Sắp tới
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeTab === "past" && styles.activeFilterBtn,
            ]}
            onPress={() => setActiveTab("past")}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === "past" && styles.activeFilterText,
              ]}
            >
              Đã qua
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- DANH SÁCH --- */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy sự kiện nào</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // --- SỬA LỖI Ở ĐÂY ---
    // Đổi màu nền chính từ #fff sang #F5F7FA (xám) để khớp với nền của list
    // Điều này sẽ làm mất vệt trắng ở dưới đáy
    backgroundColor: "#F5F7FA",
  },
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  headerLogo: {
    width: 42,
    height: 42,
    marginRight: 12,
  },
  headerTextContainer: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.5,
  },

  // Search & Filter Styles
  filterSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  tabButtons: {
    flexDirection: "row",
    gap: 12,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
  },
  activeFilterBtn: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "700",
  },

  // List & Card Styles
  listContent: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: "#F5F7FA",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardTop: {
    flexDirection: "row",
    padding: 10,
  },
  eventImage: {
    width: 120,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  eventInfo: {
    flex: 1,
    marginLeft: 8,
    justifyContent: "center",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    lineHeight: 24,
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eventTime: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f5f5f5",
    marginHorizontal: 16,
  },
  cardBottom: {
    flexDirection: "row",
    padding: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  manageBtn: {
    backgroundColor: "#F5F7FA",
  },
  manageBtnText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 14,
  },
  checkInBtn: {
    backgroundColor: "#007AFF",
  },
  checkInBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
