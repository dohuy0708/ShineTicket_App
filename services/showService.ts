import { BASE_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Alert } from "react-native";

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

// When API fails or token missing, do not return mock/sample data.
// Show an alert to the user and return an empty `events` array.

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
      Alert.alert(
        "Lỗi",
        "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách sự kiện."
      );
      return {
        events: [],
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

    const message = err?.message ?? "Đã xảy ra lỗi khi tải sự kiện";
    Alert.alert("Lỗi tải sự kiện", message);

    return {
      events: [],
      error: message,
      hasMore: false,
    };
  }
}

// --- New: Get show overview ---
export type TicketTypeOverview = {
  name: string;
  price: number;
  quantityTotal: number;
  quantitySold: number;
  quantityCheckedIn: number;
  progressPercent?: number;
  available?: number;
};

export type ShowOverviewResult = {
  show?: {
    id: string;
    name: string;
    startTime?: string;
    endTime?: string;
  } | null;
  ticketTypes?: TicketTypeOverview[];
  totalSold?: number;
  totalCapacity?: number;
  totalCheckedIn?: number;
  notArrived?: number;
  checkedInPercent?: number;
  error?: string | null;
};

export async function getShowOverview(
  showId: string
): Promise<ShowOverviewResult> {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return { error: "Missing token" };
    }

    const url = `${BASE_URL}/shows/${showId}/overview`;
    console.log("[SHOW] Request overview", { url, showId });
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("[SHOW] Response overview", { status: resp.status, data: resp.data });

    const data = resp?.data?.data || {};

    const ticketTypes: TicketTypeOverview[] = (data.ticketTypes || []).map(
      (t: any) => {
        const quantityTotal = Number(t.quantityTotal ?? t.quantity ?? 0);
        const quantitySold = Number(t.quantitySold ?? 0);
        const quantityCheckedIn = Number(t.quantityCheckedIn ?? 0);
        const available = Math.max(quantityTotal - quantitySold, 0);
        const progressPercent =
          quantityTotal > 0 ? (quantitySold / quantityTotal) * 100 : 0;

        return {
          name: t.name || t.type || "",
          price: Number(t.price ?? 0),
          quantityTotal,
          quantitySold,
          quantityCheckedIn,
          available,
          progressPercent,
        };
      }
    );

    return {
      show: data.show || null,
      ticketTypes,
      totalSold: Number(data.totalSold ?? 0),
      totalCapacity: Number(data.totalCapacity ?? 0),
      totalCheckedIn: Number(data.totalCheckedIn ?? 0),
      notArrived: Number(data.notArrived ?? 0),
      checkedInPercent: Number(data.checkedInPercent ?? 0),
      error: null,
    };
  } catch (err: any) {
    console.log("[SHOW] Lỗi gọi API overview", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    const message = err?.response?.data?.message ?? err?.message ?? "Lỗi khi tải dữ liệu";
    Alert.alert("Lỗi tải tổng quan", message);
    return { error: message };
  }
}

// --- New: Get show checkins (paginated) ---
export type CheckinItem = {
  id: string;
  ticketId: string;
  customer: { name?: string; phone?: string };
  ticketType?: { id?: string; name?: string };
  seat?: string;
  price?: number;
  purchaseDate?: string;
  checkin?: { status?: string; time?: string };
  display?: { timeLabel?: string; priceLabel?: string };
};

export type GetCheckinsResult = {
  total: number;
  items: CheckinItem[];
  error?: string | null;
  hasMore?: boolean;
};

export async function getShowCheckins(
  showId: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: string,
  sort?: string
): Promise<GetCheckinsResult> {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      Alert.alert("Lỗi", "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      return { total: 0, items: [], error: "Missing token", hasMore: false };
    }

    const params: any = { page, limit };
    if (search) params.search = search;
    if (status) params.status = status;
    if (sort) params.sort = sort;

    const url = `${BASE_URL}/shows/${showId}/checkins`;
    console.log("[SHOW] Request checkins", { url, params });
    const resp = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });

    console.log("[SHOW] Response checkins", { status: resp.status, data: resp.data });

    const data = resp?.data?.data || {};
    const total = Number(data.total ?? 0);
    const itemsRaw = data.items || [];
    const items: CheckinItem[] = itemsRaw.map((it: any) => ({
      id: it.id || it.ticketId,
      ticketId: it.ticketId || it.id,
      customer: { name: it.customer?.name || it.owner?.fullName || "", phone: it.customer?.phone || it.owner?.phone || "" },
      ticketType: it.ticketType || { id: it.ticketType?.id, name: it.ticketType?.name || it.ticketTypeName },
      seat: it.seat,
      price: Number(it.price ?? 0),
      purchaseDate: it.purchaseDate,
      checkin: it.checkin || it.status || null,
      display: it.display || {
        timeLabel: it.checkin?.time ? new Date(it.checkin.time).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : undefined,
        priceLabel: typeof it.price === "number" ? it.price.toLocaleString("vi-VN") + "đ" : undefined,
      },
    }));

    const hasMore = page * limit < total;
    return { total, items, error: null, hasMore };
  } catch (err: any) {
    console.log("[SHOW] Lỗi gọi API checkins", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    const message = err?.response?.data?.message ?? err?.message ?? "Lỗi khi tải danh sách checkin";
    Alert.alert("Lỗi tải danh sách check-in", message);
    return { total: 0, items: [], error: message, hasMore: false };
  }
}
