import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- MÃ MÀU CHỦ ĐỀ MỚI ---
const THEME_COLOR = "#FFBE33"; 

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
  const router = useRouter();
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
       <TouchableOpacity 
            style={[styles.actionButton, styles.manageBtn]}
            onPress={() => router.push(`/manage/${item.id}`)}
        >
          <Text style={styles.manageBtnText}>Chi tiết</Text>
        </TouchableOpacity>
        
        {/* Nút Check-in màu Vàng */}
       <TouchableOpacity 
       style={[styles.actionButton, styles.checkInBtn]}
       onPress={() => router.push({
        pathname: `/scanner/${item.id}`,
        // Truyền thêm dữ liệu qua params
        params: { 
            title: item.title,
            time: item.time 
        }
        } as any)}
        >
          <Ionicons
            name="qr-code-outline"
            size={18}
            color="#333" // Đổi màu icon sang đen cho nổi trên nền vàng
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

      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

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
      </View>

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
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 2,
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
  filterSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  tabButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F5F7FA",
  },
  // --- CẬP NHẬT MÀU NỀN ---
  activeFilterBtn: {
    backgroundColor: THEME_COLOR, // Màu vàng #FFBE33
  },
  filterText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  // --- CẬP NHẬT MÀU CHỮ ---
  activeFilterText: {
    color: "#333", // Đổi sang màu đen cho dễ đọc trên nền vàng
    fontWeight: "700",
  },
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
  // --- CẬP NHẬT NÚT CHECK-IN ---
  checkInBtn: {
    backgroundColor: THEME_COLOR, // Màu vàng #FFBE33
  },
  checkInBtnText: {
    color: "#333", // Màu đen cho dễ đọc
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