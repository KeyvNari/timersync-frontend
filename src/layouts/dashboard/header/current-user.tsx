import { useNavigate, useLocation } from 'react-router-dom';
import {
  PiChatDuotone,
  PiGearSixDuotone,
  PiHeartDuotone,
  PiPauseDuotone,
  PiSignOut,
  PiStarDuotone,
  PiTrashDuotone,
  PiUserDuotone,
  PiUserSwitchDuotone,
  PiFileCsv, 
} from 'react-icons/pi';
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
  // Navigate immediately before any state changes
  navigate(`${paths.auth.login}?r=${paths.dashboard.rooms}`, { replace: true });

  logout(
    { variables: {} },
    {
      onSettled: () => {
        setIsAuthenticated(false);
      }
    }
  );
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
          </>
        )}


        <Menu.Item leftSection={<PiSignOut size="1rem" />} onClick={handleLogout}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
