import { EventStatus, useMyShows } from "@/hooks/useMyShows";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

export default function EventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<EventStatus>("all");
  const [searchText, setSearchText] = useState("");
  const { events, loading, refreshing, loadMore, refresh, loadingMore } =
    useMyShows();

  const filteredEvents = React.useMemo(() => {
    const search = searchText.toLowerCase();

    const list = events.filter((event) => {
      if (!event.title.toLowerCase().includes(search)) return false;

      if (activeTab === "all") return true;
      return event.status === activeTab;
    });

    if (activeTab === "today") {
      return [...list].sort((a, b) => {
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aTime - bTime;
      });
    }

    if (activeTab === "all") {
      // Sắp xếp theo thứ tự ưu tiên trạng thái:
      // Hôm nay -> Sắp tới -> Đã qua
      const getWeight = (status: EventStatus) => {
        if (status === "today") return 0;
        if (status === "upcoming") return 1;
        if (status === "past") return 2;
        return 3;
      };

      return [...list].sort((a, b) => {
        const wa = getWeight(a.status);
        const wb = getWeight(b.status);
        if (wa !== wb) return wa - wb;

        // Nếu cùng trạng thái thì sắp xếp theo thời gian bắt đầu
        const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
        const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
        return aTime - bTime;
      });
    }

    return list;
  }, [events, activeTab, searchText]);

  const renderEventItem = ({ item }: { item: any }) => {
    const isCheckInEnabled = item.status === "today";

    // Màu hiển thị thời gian theo trạng thái
    let timeColor = "#666"; // mặc định cho "đã qua" hoặc các trạng thái khác
    if (item.status === "today") {
      timeColor = "#27AE60"; // xanh lá cho hôm nay
    } else if (item.status === "upcoming") {
      timeColor = "#007AFF"; // xanh dương cho sắp tới
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Image source={{ uri: item.image }} style={styles.eventImage} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subTitle ? (
              <Text style={styles.showTitle} numberOfLines={1}>
                {item.subTitle}
              </Text>
            ) : null}
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={14} color={timeColor} />
              <Text style={[styles.eventTime, { color: timeColor }]}>
                {item.time}
              </Text>
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
            disabled={!isCheckInEnabled}
            style={[
              styles.actionButton,
              styles.checkInBtn,
              !isCheckInEnabled && styles.checkInBtnDisabled,
            ]}
            onPress={() =>
              router.push({
                pathname: `/scanner/${item.id}`,
                // Truyền thêm dữ liệu qua params
                params: {
                  title: item.title,
                  time: item.time,
                },
              } as any)
            }
          >
            <Ionicons
              name="qr-code-outline"
              size={18}
              color="#333" // Đổi màu icon sang đen cho nổi trên nền vàng
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.checkInBtnText,
                !isCheckInEnabled && styles.checkInBtnTextDisabled,
              ]}
            >
              Check-In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
        {/* Thanh tìm kiếm nằm trên */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Hàng trạng thái nằm dưới */}
        <View style={styles.tabButtons}>
          {/* Tất cả */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeTab === "all" && styles.activeFilterBtn,
            ]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === "all" && styles.activeFilterText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          {/* Hôm nay */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              activeTab === "today" && styles.activeFilterBtn,
            ]}
            onPress={() => setActiveTab("today")}
          >
            <Text
              style={[
                styles.filterText,
                activeTab === "today" && styles.activeFilterText,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Hôm nay
            </Text>
          </TouchableOpacity>

          {/* Sắp tới */}
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
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Sắp tới
            </Text>
          </TouchableOpacity>

          {/* Đã qua */}
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
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Đã qua
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Kéo xuống để refresh
        refreshing={refreshing}
        onRefresh={refresh}
        // Lướt tới cuối để load thêm (phân trang)
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={THEME_COLOR} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={THEME_COLOR} />
            ) : (
              <Text style={styles.emptyText}>Không tìm thấy sự kiện nào</Text>
            )}
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
  searchBar: {
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
    justifyContent: "space-between",
    marginTop: 10,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 16,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  // --- CẬP NHẬT MÀU NỀN ---
  activeFilterBtn: {
    backgroundColor: THEME_COLOR, // Màu vàng #FFBE33
  },
  filterText: {
    fontSize: 12,
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
  footerLoading: {
    paddingVertical: 16,
    alignItems: "center",
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
  showTitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
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
  checkInBtnDisabled: {
    backgroundColor: "#E0E0E0",
  },
  checkInBtnTextDisabled: {
    color: "#888",
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
