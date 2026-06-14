import { loginService } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("huydo@gmail.com");
  const [password, setPassword] = useState("Aa123456");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Chuyển hàm handleLogin thành async để gọi API BE
  const handleLogin = async () => {
    console.log("[LOGIN] Bắt đầu đăng nhập", { email });
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      console.log("[LOGIN] Thiếu email hoặc mật khẩu");
      setErrorMessage("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const result = await loginService(email.trim(), password.trim());

      if (!result.success) {
        setErrorMessage(
          result.message || "Không thể kết nối tới server. Vui lòng thử lại"
        );
        return;
      }

      console.log("[LOGIN] Đăng nhập thành công, điều hướng vào tabs");
      router.replace("/(tabs)");
    } finally {
      console.log("[LOGIN] Kết thúc quá trình đăng nhập");
      setLoading(false);
    }
  };

  // ... (Phần UI giữ nguyên như cũ, không thay đổi)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* ... CODE GIAO DIỆN CŨ GIỮ NGUYÊN ... */}
      {/* Tôi xin phép rút gọn đoạn này để tập trung vào logic, bạn giữ nguyên UI cũ nhé */}
      <View style={styles.innerContainer}>
        <Image
          source={require("../assets/images/shineticket.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome to ShineTicket </Text>
        <Text style={styles.subtitle}>Organizer Centre</Text>

        {/* Input Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrorMessage("");
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Input Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage("");
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Đăng nhập</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.buttonLoadingOverlay} pointerEvents="none">
              <ActivityIndicator color="#000" />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.linkContainer}>
          <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ... Styles giữ nguyên như cũ
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 80,
  },
  logo: { width: 200, height: 200, alignSelf: "center", marginBottom: 0 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    height: 50,
    paddingHorizontal: 16,
  },
  passwordInput: { flex: 1, height: "100%", fontSize: 16 },
  eyeIcon: { marginLeft: 10 },
  errorText: { color: "red", fontSize: 13, marginTop: 6, marginLeft: 4 },
  buttonWrapper: {
    position: "relative",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#0d9488",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  linkContainer: { marginTop: 20, alignItems: "center" },
  linkText: { color: "#007AFF", fontSize: 14 },
});
