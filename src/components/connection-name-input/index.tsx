import { useState, useEffect } from 'react';
import { TextInput, Group, Tooltip } from '@mantine/core';
import { useWebSocketContext } from '@/providers/websocket-provider';

export function ConnectionNameInput() {
  const { currentConnection, setConnectionName } = useWebSocketContext();
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentConnection?.connection_name) {
      setInputValue(currentConnection.connection_name);
    }
  }, [currentConnection?.connection_name]);

  const handleSubmit = () => {
    if (inputValue.trim() && inputValue !== currentConnection?.connection_name) {
      setConnectionName(inputValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(currentConnection?.connection_name || '');
      setIsEditing(false);
    }
  };

  return (
    <Group gap="xs" style={{ maxWidth: 200 }}>
      <Tooltip label="Click to edit your connection name" withArrow>
        <TextInput
          placeholder="Your name"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
          }}
          styles={{
            input: {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              fontSize: '14px',
              padding: '8px 12px',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
              },
              '&:focus': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
                outline: 'none',
              },
            },
          }}
        />
      </Tooltip>
    </Group>
  );
}
