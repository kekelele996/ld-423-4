import { DraggableGrid } from '../components/common/DraggableGrid';
import { useChartStore } from '../stores/chartStore';
import { useReportStore } from '../stores/reportStore';

export const ReportBuilder = () => {
  const charts = useChartStore((state) => state.charts);
  const reports = useReportStore((state) => state.reports);
  const activeReportId = useReportStore((state) => state.activeReportId);
  const saveReport = useReportStore((state) => state.saveReport);
  const setActiveReport = useReportStore((state) => state.setActiveReport);
  const removeReport = useReportStore((state) => state.removeReport);
  const report = reports.find((candidate) => candidate.id === activeReportId) ?? reports[0];

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Report</span>
          <h1>报告组装</h1>
        </div>
        <div className="report-actions">
          <div className="report-selector">
            <label>
              <span>选择报告</span>
              <select value={report?.id} onChange={(e) => setActiveReport(e.target.value)}>
                {reports.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <button
              className="delete-btn"
              onClick={() => {
                if (confirm(`确定要删除报告「${report.name}」吗？删除后可在回收站中恢复。`)) {
                  void removeReport(report.id);
                }
              }}
              title="删除报告"
            >
              ×
            </button>
          </div>
          <button className="primary-action" onClick={() => saveReport({ ...report, exportStatus: 'Ready', updatedAt: new Date().toISOString() })}>标记可导出</button>
        </div>
      </section>
      {report ? (
        <DraggableGrid
          report={report}
          charts={charts}
          onAddChart={(chartId) => {
            if (report.chartIds.includes(chartId)) return;
            void saveReport({ ...report, chartIds: [...report.chartIds, chartId], updatedAt: new Date().toISOString() });
          }}
        />
      ) : null}
    </main>
  );
};
