import { Outlet, useSearchParams, useLocation } from 'react-router-dom';
import { Header } from '../header';
import classes from './root.module.css';

export function DashboardLayout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const roomId = searchParams.get('roomId');

  // Hide the global header when viewing a room (roomId present) or on the rooms list page
  // The room component will show its own header
  const showHeader = !roomId && location.pathname !== '/dashboard/rooms';

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
