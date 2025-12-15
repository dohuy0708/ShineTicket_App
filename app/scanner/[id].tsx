// File: app/scanner/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Import thêm cái này

export default function QrScannerScreen() {
  // 1. Lấy thêm title và time từ params
  const { id, title, time } = useLocalSearchParams(); 
  const router = useRouter();
  const insets = useSafeAreaInsets(); // Lấy khoảng cách tai thỏ
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: '#fff' }}>
          Cần cấp quyền Camera để quét mã
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btnPermission}>
            <Text style={{color: '#333', fontWeight: 'bold'}}>Cấp quyền ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    // ... Logic xử lý quét mã giữ nguyên như cũ ...
    const isSuccess = Math.random() > 0.3;
    if (isSuccess) {
        Alert.alert("Thành công", `Vé: ${data}`, [{ text: "OK", onPress: () => router.back() }]);
    } else {
        Alert.alert("Thất bại", "Vé lỗi", [{ text: "Thử lại", onPress: () => setScanned(false) }]);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      >
        <View style={styles.overlay}>
            
            {/* Header mới: Hiển thị thông tin sự kiện */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
                <View style={{width: 36}} /> 
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
          </View>

        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  btnPermission: {
      backgroundColor: '#FFBE33',
      padding: 12,
      borderRadius: 8
  },
  overlay: {
      flex: 1,
  },
  // --- STYLE HEADER MỚI ---
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // Căn lề trên để icon close ngang hàng dòng đầu
      paddingHorizontal: 16,
      backgroundColor: 'rgba(0,0,0,0.7)', // Tăng độ tối nền header cho dễ đọc chữ
      paddingBottom: 20
  },
  headerInfo: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 10,
  },
  eventName: {
      color: '#FFBE33', // Màu vàng chủ đạo cho tên sự kiện
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 4,
  },
  eventTime: {
      color: '#fff', // Màu trắng cho thời gian
      fontSize: 14,
      textAlign: 'center',
      opacity: 0.9
  },
  backButton: {
      padding: 4,
      marginTop: -4 // Tinh chỉnh vị trí nút close
  },
  // --- CÁC STYLE CŨ GIỮ NGUYÊN ---
  darkLayer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center'
  },
  middleContainer: {
      flexDirection: 'row',
      height: 280,
  },
  scanFrame: {
      width: 280,
      height: 280,
      borderColor: 'rgba(255,255,255,0.3)',
      borderWidth: 1,
      position: 'relative',
      backgroundColor: 'transparent'
  },
  instructionText: {
      color: '#fff',
      marginTop: 20,
      fontSize: 16,
      textAlign: 'center'
  },
  corner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: '#FFBE33',
      borderWidth: 4
  },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0 },
  lineScan: {
      width: '100%',
      height: 2,
      backgroundColor: 'red',
      position: 'absolute',
      top: '50%'
  }
});