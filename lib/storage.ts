import type { AnalysisResult, Report } from "../types";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from "firebase/firestore";

const REPORTS_KEY = "investiband_reports";
const FIRESTORE_COLLECTION = "reports";

// ─── Local Storage (fast cache + offline) ───────────────────────────

export function saveReport(result: AnalysisResult): void {
  try {
    const reports = getAllReports();
    const report: Report = {
      id: result.id,
      startup_name: result.startup_name,
      investment_amount: result.investment_amount,
      risk_preference: result.risk_preference,
      verdict: result.verdict?.decision ?? null,
      confidence_score: result.verdict?.confidence_score ?? null,
      results: result,
      created_at: result.created_at,
    };
    reports.unshift(report);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports.slice(0, 50)));
  } catch (e) {
    console.warn("Failed to save report to localStorage:", e);
  }
  // Fire-and-forget save to Firestore
  saveToFirestore(result).catch((err) => console.warn("Firestore save failed:", err));
}

export function getAllReports(): Report[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

export function getReportById(id: string): Report | null {
  const reports = getAllReports();
  return reports.find((r) => r.id === id) ?? null;
}

// ─── Firestore (cross-device cloud storage) ─────────────────────────

async function saveToFirestore(result: AnalysisResult): Promise<void> {
  await addDoc(collection(db, FIRESTORE_COLLECTION), {
    id: result.id,
    startup_name: result.startup_name,
    investment_amount: result.investment_amount,
    risk_preference: result.risk_preference,
    verdict: result.verdict?.decision ?? null,
    confidence_score: result.verdict?.confidence_score ?? null,
    results: JSON.parse(JSON.stringify(result)),
    created_at: Timestamp.fromDate(new Date(result.created_at)),
  });
}

export async function fetchReportsFromFirestore(): Promise<Report[]> {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTION), orderBy("created_at", "desc"), limit(50));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: data.id,
        startup_name: data.startup_name,
        investment_amount: data.investment_amount ?? null,
        risk_preference: data.risk_preference ?? null,
        verdict: data.verdict ?? null,
        confidence_score: data.confidence_score ?? null,
        results: data.results ?? null,
        created_at:
          data.created_at instanceof Timestamp
            ? data.created_at.toDate().toISOString()
            : data.created_at ?? new Date().toISOString(),
      } as Report;
    });
  } catch (err) {
    console.warn("Failed to fetch reports from Firestore:", err);
    return [];
  }
}

export async function fetchReportFromFirestore(id: string): Promise<Report | null> {
  try {
    const q = query(collection(db, FIRESTORE_COLLECTION), orderBy("created_at", "desc"), limit(50));
    const snapshot = await getDocs(q);
    for (const d of snapshot.docs) {
      const data = d.data();
      if (data.id === id) {
        return {
          id: data.id,
          startup_name: data.startup_name,
          investment_amount: data.investment_amount ?? null,
          risk_preference: data.risk_preference ?? null,
          verdict: data.verdict ?? null,
          confidence_score: data.confidence_score ?? null,
          results: data.results ?? null,
          created_at:
            data.created_at instanceof Timestamp
              ? data.created_at.toDate().toISOString()
              : data.created_at ?? new Date().toISOString(),
        } as Report;
      }
    }
    return null;
  } catch (err) {
    console.warn("Failed to fetch report from Firestore:", err);
    return null;
  }
}
