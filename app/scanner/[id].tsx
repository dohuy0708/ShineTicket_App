// File: app/scanner/[id].tsx
import { Ionicons } from "@expo/vector-icons";
// 1. IMPORT CHUẨN CHO EXPO CAMERA V17+
import { CameraView, useCameraPermissions } from "expo-camera";
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

export default function QrScannerScreen() {
  const { showId, eventName, showName, datetime,  } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Compose header values: prefer explicit params, fall back to old names or placeholders
  const headerEvent = (eventName as string) || "Tên sự kiện";
  const headerShow = (showName as string) || "Tên suất diễn";
  const headerDateTime = (datetime as string) || "Ngày, giờ";
  const headerShowId = (showId as string) || "ID suất diễn";

  // 2. Hook xin quyền mới
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

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    // Chặn quét liên tục
    if (scanned || verifying) return;
    setScanned(true);

    // --- LOGIC XỬ LÝ API CỦA BẠN (GIỮ NGUYÊN) ---
    console.log("Đã quét:", data);
    
    // Demo flow:
    // 1. Parse JSON
    // 2. Call API verify
    // ... (Paste lại logic API verify của bạn vào đây nếu cần) ...

    // Tạm thời alert để test UI trước:
    Alert.alert("Kết quả quét", data, [
      { text: "Quét tiếp", onPress: () => setScanned(false) },
      { text: "Thoát", onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* 3. SỬ DỤNG CAMERAVIEW (Thay thế hoàn toàn Camera cũ) */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back" // V17 dùng 'facing', không dùng 'type'
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.eventName} numberOfLines={1}>
                {headerEvent}
              </Text>
              <Text style={styles.eventTime} numberOfLines={1}>
                {headerShow} - {headerDateTime}
              </Text>
            </View>

            <View style={{ width: 36 }} />
          </View>

          {/* Layout Khung Quét */}
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
      </CameraView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingBottom: 20,
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  eventName: {
    color: "#FFBE33",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  eventTime: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
  backButton: {
    padding: 4,
    marginTop: -4,
  },
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