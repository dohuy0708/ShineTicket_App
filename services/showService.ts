import { BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export type EventStatus = "all" | "today" | "upcoming" | "past";

export type EventItem = {
  id: string;
  title: string; // Tên sự kiện
  subTitle?: string; // Tên suất diễn
  time: string;
  startTime?: string;
  status: EventStatus;
  image: string;
};

// Dữ liệu mock fallback khi gọi API lỗi
const MOCK_EVENTS: EventItem[] = [
  {
    id: "1",
    title: "Đại nhạc hội EDM 2025",
    time: "20:00 - 25/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
  },
  {
    id: "2",
    title: "Sunrise Concert",
    time: "08:00 - 25/12/2025",
    status: "today",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80",
  },
  {
    id: "3",
    title: "Workshop: AI & Future",
    time: "14:00 - 28/12/2025",
    status: "upcoming",
    image:
      "https://images.unsplash.com/photo-1519671482538-581aca198e32?w=500&q=80",
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

function getEventStatus(startTime?: string): EventStatus {
  try {
    if (!startTime) return "upcoming";

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const start = new Date(startTime);
    const startDate = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    if (startDate.getTime() === today.getTime()) return "today";
    if (startDate.getTime() > today.getTime()) return "upcoming";
    return "past";
  } catch {
    return "upcoming";
  }
}

function formatShowTime(startTime?: string, endTime?: string): string {
  try {
    if (!startTime && !endTime) return "";

    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const startStr = start.toLocaleString("vi-VN", opts);
      const endStr = end.toLocaleString("vi-VN", opts);
      return `${startStr} - ${endStr}`;
    }

    const only = new Date(startTime || endTime!);
    return only.toLocaleString("vi-VN", opts);
  } catch {
    return "";
  }
}

export type MyShowsResult = {
  events: EventItem[];
  error?: string | null;
  hasMore: boolean;
};

// Service chính để lấy dữ liệu "my-shows" (hỗ trợ phân trang)
export async function getMyShowsService(
  page: number = 1,
  limit: number = 6
): Promise<MyShowsResult> {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      console.log("[HOME] Không tìm thấy token, không thể load shows");
      // Không có token: trả về mock để UI vẫn hiển thị được
      return {
        events: MOCK_EVENTS,
        error: "Missing token",
        hasMore: false,
      };
    }

    console.log(
      "[HOME] Gọi API my-shows",
      `${BASE_URL}/staff-permissions/my-shows`
    );

    const response = await axios.get(`${BASE_URL}/staff-permissions/my-shows`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data;
    console.log("[HOME] Response my-shows", data);

    const shows: any[] = data?.shows || [];
    const events: EventItem[] = shows.map((show) => {
      const status = getEventStatus(show.startTime);
      return {
        id: show.showId || show.id || String(Math.random()),
        title: show.eventName || "",
        subTitle: show.showName || "",
        time: formatShowTime(show.startTime),
        startTime: show.startTime,
        status,
        image:
          show.eventBannerImageUrl ||
          "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80",
      };
    });

    // Nếu số lượng item trả về ít hơn limit => khả năng đã hết trang
    const hasMore = shows.length === limit;

    return { events, error: null, hasMore };
  } catch (err: any) {
    console.log("[HOME] Lỗi gọi API my-shows", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });

    return {
      events: MOCK_EVENTS,
      error: err?.message ?? "Đã xảy ra lỗi khi tải sự kiện",
      hasMore: false,
    };
  }
}
