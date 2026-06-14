import { useEffect, useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { useTrashStore, TrashItemType } from '../stores/trashStore';
import { useDatasetStore } from '../stores/datasetStore';
import { useChartStore } from '../stores/chartStore';
import { useReportStore } from '../stores/reportStore';

const typeLabels: Record<TrashItemType, string> = {
  dataset: '数据集',
  chart: '图表',
  report: '报告',
};

const typeColors: Record<TrashItemType, string> = {
  dataset: '#3b82f6',
  chart: '#10b981',
  report: '#f59e0b',
};

export const Trash = () => {
  const { items, loading, loadTrash, restoreItem, permanentlyDelete, emptyTrash } = useTrashStore();
  const loadDatasets = useDatasetStore((state) => state.loadDatasets);
  const loadCharts = useChartStore((state) => state.loadCharts);
  const loadReports = useReportStore((state) => state.loadReports);
  const [filter, setFilter] = useState<'all' | TrashItemType>('all');

  useEffect(() => {
    void loadTrash();
  }, [loadTrash]);

  const filteredItems = filter === 'all' ? items : items.filter((item) => item.type === filter);

  const handleRestore = async (id: string, type: TrashItemType, name: string) => {
    if (confirm(`确定要恢复「${name}」吗？`)) {
      await restoreItem(id, type);
      await Promise.all([loadDatasets(), loadCharts(), loadReports()]);
    }
  };

  const handlePermanentlyDelete = async (id: string, type: TrashItemType, name: string) => {
    if (confirm(`确定要永久删除「${name}」吗？此操作不可恢复！`)) {
      await permanentlyDelete(id, type);
    }
  };

  const handleEmptyTrash = async () => {
    if (confirm(`确定要清空回收站吗？所有 ${items.length} 个项目将被永久删除，此操作不可恢复！`)) {
      await emptyTrash();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Trash</span>
          <h1>回收站</h1>
        </div>
        <div className="trash-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">全部</option>
            <option value="dataset">数据集</option>
            <option value="chart">图表</option>
            <option value="report">报告</option>
          </select>
          <button
            className="danger-action"
            onClick={handleEmptyTrash}
            disabled={items.length === 0 || loading}
          >
            清空回收站
          </button>
        </div>
      </section>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? '回收站为空' : '没有匹配的项目'}
          description={items.length === 0 ? '删除的项目会显示在这里，您可以恢复或永久删除它们。' : '切换筛选条件查看其他类型的项目。'}
        />
      ) : (
        <div className="trash-list">
          {filteredItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="trash-item">
              <div className="trash-item-icon" style={{ backgroundColor: typeColors[item.type] }}>
                {typeLabels[item.type].charAt(0)}
              </div>
              <div className="trash-item-info">
                <div className="trash-item-header">
                  <strong>{item.name}</strong>
                  <span className="trash-item-type" style={{ color: typeColors[item.type] }}>
                    {typeLabels[item.type]}
                  </span>
                </div>
                <span className="trash-item-date">删除于 {formatDate(item.deletedAt)}</span>
              </div>
              <div className="trash-item-actions">
                <button
                  className="restore-btn"
                  onClick={() => handleRestore(item.id, item.type, item.name)}
                >
                  恢复
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handlePermanentlyDelete(item.id, item.type, item.name)}
                  title="永久删除"
                >
                  永久删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};
