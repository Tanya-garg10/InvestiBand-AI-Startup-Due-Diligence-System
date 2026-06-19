import { useState, useCallback } from "react";
import { fetchReports, fetchReport } from "../lib/api";
import { fetchReportsFromFirestore, fetchReportFromFirestore } from "../lib/storage";
import type { Report } from "../types";

export function useReports() {
  const [reports, setReports] = useState<Report[]>(() => fetchReports());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    try {
      // Load from localStorage first (fast)
      const local = fetchReports();
      setReports(local);

      // Then try to sync from Firestore (async)
      fetchReportsFromFirestore().then((cloud) => {
        if (cloud.length > 0) {
          // Merge: prefer local first, deduplicate by id
          const existingIds = new Set(local.map((r) => r.id));
          const merged = [...local];
          for (const cr of cloud) {
            if (!existingIds.has(cr.id)) {
              merged.push(cr);
            }
          }
          merged.sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setReports(merged.slice(0, 50));
        }
      }).catch(() => {});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (id: string): Promise<Report | null> => {
    // Try local first, then Firestore
    const local = fetchReport(id);
    if (local) return local;
    return fetchReportFromFirestore(id);
  }, []);

  return { reports, loading, error, refresh: load, getReport };
}
