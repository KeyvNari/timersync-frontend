import { Group } from '@mantine/core';
import { StickyHeader } from '@/components/sticky-header';
import { CurrentUser } from './current-user';
import { Notifications } from './notifications';
import { EditableRoomName } from './editable-room-name';
import { ColorSchemeToggle } from '@/pages/dashboard/home/color-scheme-toggle';
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
        <Button leftSection={<IconShare size={16} />} variant="default">
          Share Room
        </Button>
        <ColorSchemeToggle />
        <CurrentUser />
      </Group>
    </StickyHeader>
  );
}
