// File: app/scanner/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Camera, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BASE_URL, TEST_ADMIN_TOKEN } from "../../constants/api";
// `Camera` typings sometimes resolve to a module object; alias and cast to `any`
// so it can be used safely as a JSX element in TS projects with mismatched types.
const ExpoCamera: any = Camera as any;

export default function QrScannerScreen() {
  // 1. Lấy thêm title và time từ params
  const { id, title, time } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Lấy khoảng cách tai thỏ

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", marginBottom: 20, color: "#fff" }}>
          Cần cấp quyền Camera để quét mã
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.btnPermission}
        >
          <Text style={{ color: "#333", fontWeight: "bold" }}>
            Cấp quyền ngay
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Chặn quét nhiều lần
    if (scanned || verifying) return;
    setScanned(true);

    // 1. Decode QR -> JSON
    let payload: {
      ticketId: string;
      walletAddress: string;
      timestamp: number;
      signature: string;
    };

    try {
      payload = JSON.parse(data);
    } catch (error) {
      Alert.alert("Mã QR không hợp lệ", "Không đọc được nội dung JSON từ QR.", [
        { text: "Quét lại", onPress: () => setScanned(false) },
      ]);
      return;
    }

    // 2. Kiểm tra đủ 4 field
    const { ticketId, walletAddress, timestamp, signature } = payload as any;
    if (!ticketId || !walletAddress || !timestamp || !signature) {
      Alert.alert(
        "Mã QR thiếu thông tin",
        "QR phải chứa đủ: ticketId, walletAddress, timestamp, signature.",
        [{ text: "Quét lại", onPress: () => setScanned(false) }]
      );
      return;
    }

    // 3. Lấy access token admin
    // 👉 Cách chuẩn (sau này khi có login thật):
    // const storedToken = await AsyncStorage.getItem("userToken");
    // const token = storedToken;
    // if (!token) {
    //   Alert.alert(
    //     "Chưa đăng nhập",
    //     "Không tìm thấy access token. Vui lòng đăng nhập lại.",
    //     [
    //       {
    //         text: "Đăng nhập",
    //         onPress: () => {
    //           setScanned(false);
    //           router.replace("/login");
    //         },
    //       },
    //     ]
    //   );
    //   return;
    // }

    // 👉 Hiện tại: dùng token test cố định để dễ debug
    const token = TEST_ADMIN_TOKEN;

    setVerifying(true);

    try {
      // 4. Gửi API xác thực check-in bằng axios
      const response = await axios.post(
        `${BASE_URL}/check-in/verify`,
        { ticketId, walletAddress, timestamp, signature },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const json: any = response.data;

      if (response.status === 200 && json && json.success) {
        const detail = json.data || {};
        const detailLines = [
          detail.eventName && `Sự kiện: ${detail.eventName}`,
          detail.showName && `Show: ${detail.showName}`,
          detail.ticketTypeName && `Loại vé: ${detail.ticketTypeName}`,
          detail.status && `Trạng thái: ${detail.status}`,
          detail.checkinAt && `Thời gian: ${detail.checkinAt}`,
        ]
          .filter(Boolean)
          .join("\n");

        Alert.alert(
          json.message || "✅ CHECK-IN THÀNH CÔNG!",
          detailLines || undefined,
          [
            {
              text: "Quét tiếp",
              onPress: () => {
                setScanned(false);
              },
            },
            {
              text: "Hoàn tất",
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      } else {
        const errorMessage =
          (json && json.message) || "Đã xảy ra lỗi. Vui lòng thử lại.";
        Alert.alert("Không thể check-in", errorMessage, [
          { text: "Thử lại", onPress: () => setScanned(false) },
        ]);
      }
    } catch (error) {
      console.error("Lỗi gọi API check-in", error);
      Alert.alert(
        "Lỗi kết nối",
        "Không kết nối được tới server. Vui lòng thử lại.",
        [{ text: "Thử lại", onPress: () => setScanned(false) }]
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <ExpoCamera
        style={StyleSheet.absoluteFillObject}
        type="back"
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        barCodeScannerSettings={{ barCodeTypes: ["qr"] }}
      >
        <View style={styles.overlay}>
          {/* Header mới: Hiển thị thông tin sự kiện */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              {/* Hiển thị Tên sự kiện */}
              <Text style={styles.eventName} numberOfLines={1}>
                {title || "Tên sự kiện"}
              </Text>
              {/* Hiển thị Thời gian */}
              <Text style={styles.eventTime}>
                {time || "Thời gian sự kiện"}
              </Text>
            </View>

            {/* View rỗng để cân đối layout header */}
            <View style={{ width: 36 }} />
          </View>

          {/* Các phần giao diện bên dưới giữ nguyên... */}
          <View style={[styles.darkLayer, { flex: 1 }]} />

          <View style={styles.middleContainer}>
            <View style={styles.darkLayer} />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.lineScan} />
            </View>
            <View style={styles.darkLayer} />
          </View>

          <View style={[styles.darkLayer, { flex: 2 }]}>
            <Text style={styles.instructionText}>
              Hướng Camera về phía mã QR trên vé
            </Text>
            {verifying && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <ActivityIndicator color="#FFBE33" />
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                  Đang kiểm tra vé...
                </Text>
              </View>
            )}
          </View>
        </View>
      </ExpoCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  btnPermission: {
    backgroundColor: "#FFBE33",
    padding: 12,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
  },
  // --- STYLE HEADER MỚI ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start", // Căn lề trên để icon close ngang hàng dòng đầu
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.7)", // Tăng độ tối nền header cho dễ đọc chữ
    paddingBottom: 20,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  eventName: {
    color: "#FFBE33", // Màu vàng chủ đạo cho tên sự kiện
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  eventTime: {
    color: "#fff", // Màu trắng cho thời gian
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
  backButton: {
    padding: 4,
    marginTop: -4, // Tinh chỉnh vị trí nút close
  },
  // --- CÁC STYLE CŨ GIỮ NGUYÊN ---
  darkLayer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleContainer: {
    flexDirection: "row",
    height: 280,
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderColor: "rgba(255,255,255,0.3)",
    borderWidth: 1,
    position: "relative",
    backgroundColor: "transparent",
  },
  instructionText: {
    color: "#fff",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFBE33",
    borderWidth: 4,
  },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  lineScan: {
    width: "100%",
    height: 2,
    backgroundColor: "red",
    position: "absolute",
    top: "50%",
  },
});
