import { Outlet } from 'react-router-dom';
import { Header } from '../header';
import classes from './root.module.css';

export function DashboardLayout() {
  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Header />

        <main className={classes.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
