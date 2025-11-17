import { useNavigate, useLocation } from 'react-router-dom';
import {
  PiGearSixDuotone,
  PiSignOut,
  PiFileCsv, 
  PiArrowCircleRightThin 
} from 'react-icons/pi';
import {
  IconBolt,
} from '@tabler/icons-react';
import { Avatar, AvatarProps, ElementProps, Menu } from '@mantine/core';
import { useAuth, useGetAccountInfo, useLogout } from '@/hooks';
import { paths } from '@/routes';
import { IconUser } from '@tabler/icons-react';
type CurrentUserProps = Omit<AvatarProps, 'src' | 'alt'> & ElementProps<'div', keyof AvatarProps>;

export function CurrentUser(props: CurrentUserProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate: logout } = useLogout();
  const { setIsAuthenticated } = useAuth();
  const { data: user } = useGetAccountInfo();

  const isRoomsPage = location.pathname === '/dashboard/rooms';

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => {
        setIsAuthenticated(false);
        // Navigate after logout completes
        navigate(`${paths.auth.login}?r=${paths.dashboard.rooms}`, { replace: true });
      }
    });
  };

  const handleGoBackToRooms = () => {
    navigate(paths.dashboard.rooms);
  };

  return (
    <Menu>
      <Menu.Target>
        
        <Avatar
          src={user?.profile_image_url}
          alt={user?.name ?? 'Current user'}
          {...props}
          style={{ cursor: 'pointer', ...props.style }}
        >
          <IconUser size="1.5rem" />
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>
         {user?.email}
        </Menu.Item>
   
    
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item leftSection={<PiGearSixDuotone size="1rem" />}>Account settings</Menu.Item>
        <Menu.Item leftSection={<IconBolt size="1rem" />}>Upgrade plan</Menu.Item>

        <Menu.Divider />

        {/* <Menu.Label>Danger zone</Menu.Label> */}
        {/* <Menu.Item leftSection={<PiPauseDuotone size="1rem" />}>Pause subscription</Menu.Item> */}
        {/* <Menu.Item color="red" leftSection={<PiTrashDuotone size="1rem" />}>
          Delete account
        </Menu.Item> */}

        {/* <Menu.Label>Manager</Menu.Label> */}
        {!isRoomsPage && (
          <>
            <Menu.Item leftSection={<PiFileCsv size="1rem" />}>Download timers as csv</Menu.Item>
            <Menu.Divider />
            <Menu.Item leftSection={<PiArrowCircleRightThin size="1rem" />} onClick={handleGoBackToRooms}>
              Go back to rooms
            </Menu.Item>
          </>
        )}
        <Menu.Item leftSection={<PiSignOut size="1rem" />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
