import { create } from 'zustand';
import { ChartConfig, Dataset, Report } from '../types';
import { db } from '../utils/db';

export type TrashItemType = 'dataset' | 'chart' | 'report';

export interface TrashItem {
  id: string;
  type: TrashItemType;
  name: string;
  deletedAt: string;
  original: Dataset | ChartConfig | Report;
}

interface TrashState {
  items: TrashItem[];
  loading: boolean;
  loadTrash: () => Promise<void>;
  restoreItem: (id: string, type: TrashItemType) => Promise<void>;
  permanentlyDelete: (id: string, type: TrashItemType) => Promise<void>;
  emptyTrash: () => Promise<void>;
  getTrashCount: () => number;
}

export const useTrashStore = create<TrashState>((set, get) => ({
  items: [],
  loading: false,
  loadTrash: async () => {
    set({ loading: true });
    try {
      const [allDatasets, allCharts, allReports] = await Promise.all([
        db.datasets.toArray(),
        db.charts.toArray(),
        db.reports.toArray(),
      ]);
      const datasets = allDatasets.filter((d) => d.deletedAt);
      const charts = allCharts.filter((c) => c.deletedAt);
      const reports = allReports.filter((r) => r.deletedAt);

      const items: TrashItem[] = [
        ...datasets.map((d) => ({
          id: d.id,
          type: 'dataset' as TrashItemType,
          name: d.name,
          deletedAt: d.deletedAt!,
          original: d,
        })),
        ...charts.map((c) => ({
          id: c.id,
          type: 'chart' as TrashItemType,
          name: c.name,
          deletedAt: c.deletedAt!,
          original: c,
        })),
        ...reports.map((r) => ({
          id: r.id,
          type: 'report' as TrashItemType,
          name: r.name,
          deletedAt: r.deletedAt!,
          original: r,
        })),
      ].sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

      set({ items });
    } finally {
      set({ loading: false });
    }
  },
  restoreItem: async (id, type) => {
    if (type === 'dataset') {
      const item = await db.datasets.get(id);
      if (item) {
        const { deletedAt, ...rest } = item;
        await db.datasets.put(rest);
      }
    } else if (type === 'chart') {
      const item = await db.charts.get(id);
      if (item) {
        const { deletedAt, ...rest } = item;
        await db.charts.put(rest);
      }
    } else {
      const item = await db.reports.get(id);
      if (item) {
        const { deletedAt, ...rest } = item;
        await db.reports.put(rest);
      }
    }
    set({ items: get().items.filter((i) => !(i.id === id && i.type === type)) });
  },
  permanentlyDelete: async (id, type) => {
    const table = type === 'dataset' ? db.datasets : type === 'chart' ? db.charts : db.reports;
    await table.delete(id);
    set({ items: get().items.filter((i) => !(i.id === id && i.type === type)) });
  },
  emptyTrash: async () => {
    const items = get().items;
    for (const item of items) {
      const table = item.type === 'dataset' ? db.datasets : item.type === 'chart' ? db.charts : db.reports;
      await table.delete(item.id);
    }
    set({ items: [] });
  },
  getTrashCount: () => get().items.length,
}));
