import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Paper } from '@mantine/core';
import { Logo } from '@/components/logo';
import { Header } from '../header';
import { Sidebar } from '../sidebar';
import classes from './root.module.css';

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Default to collapsed

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={classes.root}>
      <Paper 
        className={`${classes.sidebarWrapper} ${sidebarCollapsed ? classes.sidebarCollapsed : ''}`} 
        withBorder
      >
        <div className={classes.logoWrapper}>
          <Logo w={sidebarCollapsed ? "2rem" : "3rem"} />
        </div>
        <div className={classes.sidebarContent}>
          <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
        </div>
      </Paper>
      <div className={`${classes.content} ${sidebarCollapsed ? classes.contentExpanded : ''}`}>
        <Header />

        <main className={classes.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}