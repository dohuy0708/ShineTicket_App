import { BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginSuccessData = {
  accessToken: string;
  refreshToken?: string | null;
  user?: any;
};

export type LoginResult = {
  success: boolean;
  data?: LoginSuccessData;
  message?: string;
};

export async function loginService(
  email: string,
  password: string
): Promise<LoginResult> {
  console.log("[authService] Bắt đầu login", { email });

  try {
    console.log("[authService] Gọi API", `${BASE_URL}/auth/staff-login`);

    const response = await axios.post(`${BASE_URL}/auth/staff-login`, {
      email,
      password,
    });

    console.log("[authService] Status:", response.status);
    const data = response.data;
    console.log("[authService] Response body:", data);

    const accessToken: string | undefined = data?.accessToken;
    const refreshToken: string | undefined | null = data?.privyToken;
    const user: any = data?.user;

    if (!accessToken) {
      console.log("[authService] Không có accessToken trong response");
      return {
        success: false,
        message: "Không nhận được token từ server",
      };
    }

    try {
      await AsyncStorage.setItem("userToken", accessToken);

      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
      }

      if (user) {
        await AsyncStorage.setItem("userInfo", JSON.stringify(user));
      } else {
        await AsyncStorage.setItem("userInfo", JSON.stringify({ email }));
      }

      console.log(
        "[authService] Đã lưu accessToken, refreshToken (nếu có) và userInfo"
      );

      return {
        success: true,
        data: {
          accessToken,
          refreshToken: refreshToken ?? null,
          user,
        },
      };
    } catch (storageError: any) {
      console.error("[authService] Lỗi lưu data", storageError);
      return {
        success: false,
        message: "Có lỗi xảy ra khi lưu thông tin đăng nhập",
      };
    }
  } catch (error: any) {
    console.log("[authService] Lỗi gọi API đăng nhập", {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });

    let message = "Không thể kết nối tới server. Vui lòng thử lại";

    if (error?.response?.status === 404) {
      message = "API đăng nhập không tồn tại (404) - kiểm tra lại URL backend";
    } else if (error?.response?.status === 401) {
      message = "Email hoặc mật khẩu không đúng";
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    }

    return {
      success: false,
      message,
    };
  }
}
