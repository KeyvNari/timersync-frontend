import { Group } from '@mantine/core';
import { ColorSchemeToggler } from '@/components/color-scheme-toggler';
import { StickyHeader } from '@/components/sticky-header';
import { CurrentUser } from './current-user';
import { Notifications } from './notifications';
import { EditableRoomName } from './editable-room-name';
import classes from './header.module.css';

export function Header() {
  const handleRoomNameSave = (newName: string) => {
    // TODO: Backend integration - save the room name
    console.log('Room name saved:', newName);
  };

  return (
    <StickyHeader className={classes.root}>
      <div className={classes.rightContent}>
        <EditableRoomName 
          initialName="Unnamed Room..."
          onSave={handleRoomNameSave}
          maxLength={50}
        />
      </div>

      <Group>
        <ColorSchemeToggler />
        <Notifications />
        <CurrentUser />
      </Group>
    </StickyHeader>
  );
}