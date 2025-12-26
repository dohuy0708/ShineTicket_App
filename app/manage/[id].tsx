import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
// 1. Import thư viện mới (Nhớ xóa react-native-chart-kit đi)
import { PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CheckinItem,
  getShowCheckins,
  getShowOverview,
  TicketTypeOverview,
} from "../../services/showService";

// State will be populated from BE
const INITIAL_EVENT = null;

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState("overview"); 
  const [searchText, setSearchText] = useState("");
  const [eventInfo, setEventInfo] = useState<any>(INITIAL_EVENT);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeOverview[]>([]);
  const [checkinHistory, setCheckinHistory] = useState<CheckinItem[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  useEffect(() => {
    if (!id) return;
    const sid = String(id);
    fetchOverview(sid);
    fetchCheckins(sid);
  }, [id]);

  function formatDateRange(start?: string, end?: string) {
    try {
      if (!start && !end) return "";
      const opts: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      };
      if (start && end) {
        return `${new Date(start).toLocaleString("vi-VN", opts)} - ${new Date(end).toLocaleString(
          "vi-VN",
          opts
        )}`;
      }
      return new Date(start || end!).toLocaleString("vi-VN", opts);
    } catch {
      return "";
    }
  }

  async function fetchOverview(sid: string) {
    try {
      setLoadingOverview(true);
      console.log("[MANAGE] fetchOverview start", sid);
      const res = await getShowOverview(sid);
      console.log("[MANAGE] fetchOverview result", res);
      if (!res.error) {
        setEventInfo(res);
        setTicketTypes(res.ticketTypes || []);
      }
    } finally {
      setLoadingOverview(false);
    }
  }

  async function fetchCheckins(sid: string) {
    try {
      setLoadingCheckins(true);
      console.log("[MANAGE] fetchCheckins start", sid);
      const res = await getShowCheckins(sid, 1, 100);
      console.log("[MANAGE] fetchCheckins result", res);
      if (!res.error) {
        setCheckinHistory(res.items || []);
      }
    } finally {
      setLoadingCheckins(false);
    }
  }

  // 2. Tính toán dữ liệu cho biểu đồ Gifted Charts (từ BE)
  const totalSold = eventInfo?.totalSold ?? 0;
  const checkedInCount = eventInfo?.totalCheckedIn ?? 0;
  const totalCapacity = eventInfo?.totalCapacity ?? 0;
  const notCheckedInCount = Math.max(totalSold - checkedInCount, 0);

  const percentCheckedIn = totalSold > 0 ? Math.round((checkedInCount / totalSold) * 100) : 0;
  const percentNotCheckedIn = 100 - percentCheckedIn;

  // Dữ liệu truyền vào biểu đồ
  const pieData = [
    {
      value: checkedInCount,
      color: "#FFBE33",
      text: `${percentCheckedIn}%`,
      textColor: "#333",
      fontWeight: "bold",
    },
    {
      value: notCheckedInCount,
      color: "#E0E0E0",
      text: `${percentNotCheckedIn}%`,
      textColor: "#666",
      fontWeight: "bold",
    },
  ];

  // Component Custom Legend (Tự code chú thích)
  const renderLegendComponent = () => {
    return (
      <View style={{ justifyContent: 'center', paddingLeft: 20 }}>
        {/* Dòng 1: Đã Check-in */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#FFBE33', marginRight: 8 }} />
          <View>
            <Text style={{ fontSize: 14, color: '#666' }}>Đã Check-in</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{checkedInCount}</Text>
          </View>
        </View>
        
        {/* Dòng 2: Chưa đến */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ height: 12, width: 12, borderRadius: 6, backgroundColor: '#E0E0E0', marginRight: 8 }} />
          <View>
            <Text style={{ fontSize: 14, color: '#666' }}>Chưa đến</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{notCheckedInCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  // --- RENDER TAB 1: TỔNG QUAN ---
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      
      {/* Section 2: Biểu đồ & Thống kê */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Tiến độ Check-in</Text>
        
        {/* Container chứa Biểu đồ (Trái) và Chú thích (Phải) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
            <View style={{ alignItems: 'center' }}>
                <PieChart
                    data={pieData}
                    donut // Dùng dạng Donut cho đẹp (hoặc bỏ đi nếu thích hình tròn đặc)
                    showText
                    textColor="black"
                    radius={70}
                    innerRadius={30} // Bán kính lỗ tròn bên trong
                    textSize={14}
                    focusOnPress
                />
            </View>

            {/* Hiển thị chú thích bên phải */}
            {renderLegendComponent()}
        </View>

        {/* Tổng kết nhỏ ở dưới */}
        <View style={styles.summaryRow}>
             <Text style={styles.summaryText}>Tổng vé bán: <Text style={{fontWeight: 'bold'}}>{totalSold}</Text></Text>
        </View>
      </View>

      <View style={[styles.sectionCard, {marginBottom: 100}]}>
        <Text style={styles.sectionTitle}>Chi tiết vé bán</Text>
        {ticketTypes.map((ticket, index) => (
          <View key={index} style={styles.ticketRow}>
            <View>
              <Text style={styles.ticketType}>{ticket.name}</Text>
              <Text style={styles.ticketPrice}>{(ticket.price || 0).toLocaleString('vi-VN')}đ</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.ticketSold}>{ticket.quantitySold} / {ticket.quantityTotal}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {width: `${Math.round(ticket.progressPercent|| (ticket.quantityTotal? (ticket.quantitySold/ticket.quantityTotal)*100:0))}%`}]} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // --- RENDER TAB 2: CHECK-IN (Giữ nguyên) ---
  const renderCheckInTab = () => {
    const filteredList = checkinHistory.filter(item =>
      (item.customer?.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
      (item.customer?.phone || "").includes(searchText)
    );

    return (
        <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Tìm tên hoặc SĐT..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            <FlatList 
                data={filteredList}
                keyExtractor={item => item.id}
                contentContainerStyle={{paddingBottom: 100}}
                renderItem={({item}) => (
                    <View style={styles.checkInItem}>
                        <View style={styles.checkInHeader}>
                      <Text style={styles.customerName}>{item.customer?.name}</Text>
                      <Text style={styles.checkInTime}>{item.display?.timeLabel}</Text>
                        </View>
                        <View style={styles.checkInDetailRow}>
                            <Ionicons name="call-outline" size={14} color="#666" />
                      <Text style={styles.detailText}>{item.customer?.phone}</Text>
                        </View>
                        <View style={styles.ticketBadgeRow}>
                            <View style={styles.ticketBadge}>
                        <Text style={styles.badgeText}>{item.ticketType?.name}</Text>
                            </View>
                            <Text style={styles.seatText}> • {item.seat}</Text>
                        </View>
                        <View style={styles.purchaseInfo}>
                      <Text style={styles.purchaseText}>Mua ngày: {item.purchaseDate || ""} - {item.display?.priceLabel || (item.price? item.price.toLocaleString('vi-VN') + 'đ' : '')}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerEventTitle} numberOfLines={1}>
            {eventInfo?.show?.name ?? "Tên sự kiện"}
          </Text>
          <Text style={styles.headerEventTime}>
            {formatDateRange(eventInfo?.show?.startTime, eventInfo?.show?.endTime)}
          </Text>
        </View>
        
        <View style={{width: 24}} />
      </View>

      <View style={styles.tabSwitcher}>
        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
        >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Tổng quan</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'checkin' && styles.activeTab]}
            onPress={() => setActiveTab('checkin')}
        >
            <Text style={[styles.tabText, activeTab === 'checkin' && styles.activeTabText]}>Check-in</Text>
        </TouchableOpacity>
      </View>

      <View style={{flex: 1, backgroundColor: '#F5F7FA'}}>
          {activeTab === 'overview' ? renderOverviewTab() : renderCheckInTab()}
      </View>

      {/* FLOATING ACTION BUTTON */}
      <View style={[styles.floatingContainer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() =>
              router.push({
                pathname: `/scanner/${id}`,
                params: {
                  title: eventInfo?.show?.name ?? "",
                  time: formatDateRange(eventInfo?.show?.startTime, eventInfo?.show?.endTime),
                },
              } as any)
            }
        >
            <Ionicons name="qr-code-outline" size={24} color="#333" style={{marginRight: 8}}/>
            <Text style={styles.floatingBtnText}>CHECK-IN</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 16,
  },
  headerEventTitle: { 
      fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center'
  },
  headerEventTime: {
      fontSize: 12, color: '#666', marginTop: 2, textAlign: 'center'
  },
  backBtn: {},
  
  // Tabs
  tabSwitcher: {
      flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff'
  },
  tabButton: {
      flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent'
  },
  activeTab: { borderBottomColor: '#FFBE33' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#999' },
  activeTabText: { color: '#FFBE33', fontWeight: 'bold' },
  tabContent: { flex: 1, padding: 12 },

  // Overview Styles
  sectionCard: {
      backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
      shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  sectionTitle: {
      fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12
  },
  summaryRow: {
      marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5', alignItems: 'center'
  },
  summaryText: { fontSize: 14, color: '#666' },

  // Ticket list
  ticketRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  ticketType: { fontWeight: '600', fontSize: 14, color: '#333' },
  ticketPrice: { fontSize: 12, color: '#999' },
  ticketSold: { fontSize: 13, color: '#333', fontWeight: '500', marginBottom: 4 },
  progressBarBg: { width: 100, height: 6, backgroundColor: '#eee', borderRadius: 3 },
  progressBarFill: { height: 6, backgroundColor: '#FFBE33', borderRadius: 3 },

  // Check-in Tab
  searchContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
      paddingHorizontal: 12, borderRadius: 8, height: 44, marginBottom: 8,
      borderWidth: 1, borderColor: '#eee'
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  checkInItem: {
      backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12,
      shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  checkInHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  checkInTime: { fontSize: 12, color: '#27AE60', fontWeight: '500' },
  checkInDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  detailText: { marginLeft: 6, color: '#666', fontSize: 14 },
  ticketBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  ticketBadge: { backgroundColor: '#FFF8E1', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FFE082' },
  badgeText: { fontSize: 12, color: '#FF8F00', fontWeight: 'bold' },
  seatText: { fontSize: 14, color: '#333', fontWeight: '500' },
  purchaseInfo: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  purchaseText: { fontSize: 12, color: '#999' },

  // Floating Button
  floatingContainer: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingHorizontal: 16, paddingTop: 10,
      backgroundColor: 'transparent', elevation: 0,
  },
  floatingBtn: {
      backgroundColor: '#FFBE33', flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
      height: 50, borderRadius: 12,
      shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5
  },
  floatingBtnText: { fontSize: 16, fontWeight: 'bold', color: '#333' }
});