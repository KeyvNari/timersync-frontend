import { Group } from '@mantine/core';
// import { ColorSchemeToggler } from '@/components/color-scheme-toggler'; // Removed
import { StickyHeader } from '@/components/sticky-header';
import { CurrentUser } from './current-user';
import { Notifications } from './notifications';
import { EditableRoomName } from './editable-room-name';
import classes from './header.module.css';
import {  Button } from '@mantine/core';
import { IconShare, IconDownload, IconArrowRight } from '@tabler/icons-react';

export function Header() {
  const handleRoomNameSave = (newName: string) => {
    // TODO: Backend integration - save the room name
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
      
        {/* <ColorSchemeToggler /> */}
      <Button leftSection={<IconShare size={16} />} variant="default">
        Share Room
      </Button>
        {/* <Notifications /> */}
        <CurrentUser />
      
      </Group>
    </StickyHeader>
  );
}
