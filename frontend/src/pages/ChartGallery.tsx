import { useMemo, useState } from 'react';
import { ChartPreview } from '../components/common/ChartPreview';
import { EmptyState } from '../components/common/EmptyState';
import { useChartStore } from '../stores/chartStore';
import { useDatasetStore } from '../stores/datasetStore';

export const ChartGallery = () => {
  const [query, setQuery] = useState('');
  const charts = useChartStore((state) => state.charts);
  const datasets = useDatasetStore((state) => state.datasets);
  const removeChart = useChartStore((state) => state.removeChart);
  const visible = useMemo(() => charts.filter((chart) => chart.name.toLowerCase().includes(query.toLowerCase()) || chart.tags.some((tag) => tag.includes(query))), [charts, query]);

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <span className="eyebrow">Gallery</span>
          <h1>图表库</h1>
        </div>
        <input className="search-input" placeholder="搜索名称或标签" value={query} onChange={(event) => setQuery(event.target.value)} />
      </section>
      {visible.length === 0 ? (
        <EmptyState title="没有匹配图表" description="调整关键词，或回到编辑器保存新的图表。" />
      ) : (
        <section className="gallery-grid">
          {visible.map((chart) => (
            <article className="gallery-item" key={chart.id}>
              <ChartPreview config={chart} dataset={datasets.find((dataset) => dataset.id === chart.datasetId)} compact />
              <div className="gallery-item-info">
                <strong>{chart.name}</strong>
                <span>{chart.type} · {chart.colorScheme}</span>
              </div>
              <button
                className="delete-btn gallery-delete-btn"
                onClick={() => {
                  if (confirm(`确定要删除图表「${chart.name}」吗？删除后可在回收站中恢复。`)) {
                    void removeChart(chart.id);
                  }
                }}
                title="删除图表"
              >
                ×
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};
