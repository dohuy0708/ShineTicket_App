import type { EventItem } from "@/services/showService";
import { getMyShowsService } from "@/services/showService";
import { useEffect, useState } from "react";

export type MyShowsFilterStatus = "ongoing" | "pending" | "completed";

export function useMyShows(status: MyShowsFilterStatus = "ongoing") {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load trang đầu tiên
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setLoading(true);
      setError(null);

      try {
        const {
          events: fetchedEvents,
          error: serviceError,
          hasMore,
        } = await getMyShowsService(1, 6, status);

        if (!isMounted) return;
        setEvents(fetchedEvents);
        setError(serviceError ?? null);
        setPage(1);
        setHasMore(hasMore);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message ?? "Đã xảy ra lỗi khi tải sự kiện");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [status]);

  // Kéo để refresh
  const refresh = async () => {
    if (loading || refreshing) return;

    setRefreshing(true);
    setError(null);

    try {
      const {
        events: fetchedEvents,
        error: serviceError,
        hasMore,
      } = await getMyShowsService(1, 6, status);

      setEvents(fetchedEvents);
      setError(serviceError ?? null);
      setPage(1);
      setHasMore(hasMore);
    } catch (err: any) {
      setError(err?.message ?? "Đã xảy ra lỗi khi tải sự kiện");
    } finally {
      setRefreshing(false);
    }
  };

  // Load thêm khi scroll tới cuối danh sách
  const loadMore = async () => {
    if (loadingMore || loading || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const { events: fetchedEvents, hasMore: nextHasMore } =
        await getMyShowsService(nextPage, 6, status);

      setEvents((prev) => [...prev, ...fetchedEvents]);
      setPage(nextPage);
      setHasMore(nextHasMore);
    } catch (err) {
      // Có thể log thêm nếu cần, tạm thời chỉ dừng loadMore
      console.log("[useMyShows] Lỗi loadMore", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return {
    events,
    loading,
    error,
    refreshing,
    loadMore,
    refresh,
    loadingMore,
    hasMore,
  };
}

// Re-export types để UI có thể dùng từ hook
export type { EventItem, EventStatus } from "@/services/showService";
