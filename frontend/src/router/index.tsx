import { Navigate, NavLink, Outlet, createBrowserRouter } from 'react-router-dom';
import { ChartEditor } from '../pages/ChartEditor';
import { ChartGallery } from '../pages/ChartGallery';
import { ReportBuilder } from '../pages/ReportBuilder';
import { Statistics } from '../pages/Statistics';
import { Workspace } from '../pages/Workspace';
import { Trash } from '../pages/Trash';
import { useThemeStore } from '../stores/themeStore';
import { useTrashStore } from '../stores/trashStore';
import { useEffect } from 'react';

const AppShell = () => {
  const mode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const trashCount = useTrashStore((state) => state.getTrashCount());
  const loadTrash = useTrashStore((state) => state.loadTrash);

  useEffect(() => {
    void loadTrash();
  }, [loadTrash]);

  return (
    <div className="app-shell" data-theme={mode}>
      <nav className="main-nav">
        <strong>LabVista</strong>
        <NavLink to="/workspace">工作台</NavLink>
        <NavLink to="/chart-editor">编辑器</NavLink>
        <NavLink to="/report-builder">报告</NavLink>
        <NavLink to="/statistics">统计</NavLink>
        <NavLink to="/charts">图表库</NavLink>
        <NavLink to="/trash" className="trash-nav-link">
          回收站
          {trashCount > 0 && <span className="trash-badge">{trashCount}</span>}
        </NavLink>
        <button type="button" onClick={toggleTheme}>{mode === 'dark' ? '浅色' : '深色'}</button>
      </nav>
      <Outlet />
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/workspace" replace /> },
      { path: 'workspace', element: <Workspace /> },
      { path: 'chart-editor', element: <ChartEditor /> },
      { path: 'report-builder', element: <ReportBuilder /> },
      { path: 'statistics', element: <Statistics /> },
      { path: 'charts', element: <ChartGallery /> },
      { path: 'trash', element: <Trash /> },
    ],
  },
]);
