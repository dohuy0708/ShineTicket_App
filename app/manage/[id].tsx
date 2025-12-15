import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
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

// --- MOCK DATA ---
const EVENT_INFO = {
  id: "1",
  title: "Đại nhạc hội EDM 2025 - Light It Up",
  image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  time: "19:00",
  date: "20/12/2025",
  address: "Sân vận động Mỹ Đình, Hà Nội",
  totalTickets: 5000,
  checkedIn: 1250,
  sold: 4500,
};

const TICKET_TYPES = [
  { type: "VIP", sold: 500, total: 500, price: "2.500.000đ" },
  { type: "GA (Đứng)", sold: 2500, total: 3000, price: "900.000đ" },
  { type: "Standard (Ngồi)", sold: 1500, total: 1500, price: "1.200.000đ" },
];

const CHECKIN_HISTORY = [
  {
    id: "1",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    ticketType: "VIP",
    seat: "Row A - 01",
    price: "2.500.000đ",
    purchaseDate: "10/11/2025",
    checkInTime: "18:30 20/12/2025",
    status: "checked",
  },
  {
    id: "2",
    customerName: "Trần Thị B",
    phone: "0912345678",
    ticketType: "GA",
    seat: "Zone B",
    price: "900.000đ",
    purchaseDate: "12/11/2025",
    checkInTime: "18:45 20/12/2025",
    status: "checked",
  },
  {
    id: "3",
    customerName: "Lê Hoàng C",
    phone: "0987654321",
    ticketType: "Standard",
    seat: "Zone C - 12",
    price: "1.200.000đ",
    purchaseDate: "15/11/2025",
    checkInTime: "19:00 20/12/2025",
    status: "checked",
  },
];

export default function ManageEventScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState("overview"); 
  const [searchText, setSearchText] = useState("");

  // 2. Tính toán dữ liệu cho biểu đồ Gifted Charts
  const totalSold = EVENT_INFO.sold;
  const checkedInCount = EVENT_INFO.checkedIn;
  const notCheckedInCount = totalSold - checkedInCount;

  const percentCheckedIn = Math.round((checkedInCount / totalSold) * 100);
  const percentNotCheckedIn = 100 - percentCheckedIn;

  // Dữ liệu truyền vào biểu đồ
  const pieData = [
    {
      value: checkedInCount,
      color: "#FFBE33",
      text: `${percentCheckedIn}%`, // Hiển thị % lên hình
      textColor: "#333",
      fontWeight: 'bold'
    },
    {
      value: notCheckedInCount,
      color: "#E0E0E0",
      text: `${percentNotCheckedIn}%`, // Hiển thị % lên hình
      textColor: "#666",
      fontWeight: 'bold'
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
        {TICKET_TYPES.map((ticket, index) => (
            <View key={index} style={styles.ticketRow}>
                <View>
                    <Text style={styles.ticketType}>{ticket.type}</Text>
                    <Text style={styles.ticketPrice}>{ticket.price}</Text>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.ticketSold}>{ticket.sold} / {ticket.total}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, {width: `${(ticket.sold/ticket.total)*100}%`}]} />
                    </View>
                </View>
            </View>
        ))}
      </View>
    </ScrollView>
  );

  // --- RENDER TAB 2: CHECK-IN (Giữ nguyên) ---
  const renderCheckInTab = () => {
    const filteredList = CHECKIN_HISTORY.filter(item => 
        item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone.includes(searchText)
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
                            <Text style={styles.customerName}>{item.customerName}</Text>
                            <Text style={styles.checkInTime}>{item.checkInTime}</Text>
                        </View>
                        <View style={styles.checkInDetailRow}>
                            <Ionicons name="call-outline" size={14} color="#666" />
                            <Text style={styles.detailText}>{item.phone}</Text>
                        </View>
                        <View style={styles.ticketBadgeRow}>
                            <View style={styles.ticketBadge}>
                                <Text style={styles.badgeText}>{item.ticketType}</Text>
                            </View>
                            <Text style={styles.seatText}> • {item.seat}</Text>
                        </View>
                        <View style={styles.purchaseInfo}>
                            <Text style={styles.purchaseText}>Mua ngày: {item.purchaseDate} - {item.price}</Text>
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
                {EVENT_INFO.title}
            </Text>
            <Text style={styles.headerEventTime}>
                {EVENT_INFO.time} - {EVENT_INFO.date}
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
            onPress={() => router.push({
                pathname: `/scanner/${id}`,
                params: { title: EVENT_INFO.title, time: `${EVENT_INFO.date} - ${EVENT_INFO.time}` }
            } as any)}
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