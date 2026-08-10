const TOKYO_TIME_ZONE = "Asia/Tokyo";

/** 日本時間(Asia/Tokyo)基準の「今日」の日付を YYYY-MM-DD で返す */
export function getTodayInTokyo(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TOKYO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/** YYYY-MM-DD形式の日付同士の差分日数を返す (endDate - startDate) */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
