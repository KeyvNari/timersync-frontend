import { Outlet, useSearchParams } from 'react-router-dom';
import { Header } from '../header';
import classes from './root.module.css';

export function DashboardLayout() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get('roomId');

  // Hide the global header when viewing a room (roomId present)
  // The room component will show its own header
  const showHeader = !roomId;

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        {showHeader && <Header />}

        <main className={classes.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
