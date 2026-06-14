import { create } from 'zustand';
import { Report } from '../types';
import { db } from '../utils/db';

const demoReport: Report = {
  id: 'report-demo',
  name: '表达量分析报告',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  description: '拖拽图表生成科研数据简报。',
  chartIds: ['chart-demo-yield'],
  layout: [{ chartId: 'chart-demo-yield', row: 0, col: 0, width: 2, height: 1 }],
  exportStatus: 'Draft',
};

interface ReportState {
  reports: Report[];
  activeReportId: string;
  loadReports: () => Promise<void>;
  saveReport: (report: Report) => Promise<void>;
  setActiveReport: (reportId: string) => void;
  removeReport: (reportId: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  reports: [demoReport],
  activeReportId: demoReport.id,
  loadReports: async () => {
    const persisted = await db.reports.filter((r) => !r.deletedAt).toArray();
    if (persisted.length === 0) {
      await db.reports.put(demoReport);
      return;
    }
    set({ reports: persisted, activeReportId: persisted[0].id });
  },
  saveReport: async (report) => {
    await db.reports.put(report);
    const exists = get().reports.some((candidate) => candidate.id === report.id);
    set({ reports: exists ? get().reports.map((candidate) => (candidate.id === report.id ? report : candidate)) : [report, ...get().reports] });
  },
  setActiveReport: (reportId) => set({ activeReportId: reportId }),
  removeReport: async (reportId) => {
    const report = await db.reports.get(reportId);
    if (report) {
      report.deletedAt = new Date().toISOString();
      await db.reports.put(report);
      const remaining = get().reports.filter((r) => r.id !== reportId);
      set({
        reports: remaining,
        activeReportId: remaining.length > 0 ? remaining[0].id : '',
      });
    }
  },
}));
