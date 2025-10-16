# Message System Implementation

## Overview
The message system has been fully integrated with the WebSocket provider. Messages are now synchronized in real-time across all connected clients through WebSocket events.

## Backend Integration

### WebSocket Events

#### 1. **MESSAGE_ADD**
Adds a new message to the room.

```typescript
// Frontend sends:
{
  "type": "message_add",
  "message_data": {
    "date": "2025-10-16T15:00:00.000Z",
    "content": "Your message here",
    "color": "#FF5733",
    "is_focused": false,
    "is_flashing": false,
    "source": "user",
    "asker": "John Doe",
    "is_showing": true
  }
}

// Server responds with: messages_list event
```

#### 2. **MESSAGE_UPDATE**
Updates an existing message.

```typescript
// Frontend sends:
{
  "type": "message_update",
  "message_id": "550e8400-e29b-41d4-a716-446655440000",
  "update_data": {
    "content": "Updated message content",
    "is_focused": true
  }
}

// Server responds with: messages_list event
```

#### 3. **MESSAGE_DELETE**
Deletes a message from the room.

```typescript
// Frontend sends:
{
  "type": "message_delete",
  "message_id": "550e8400-e29b-41d4-a716-446655440000"
}

// Server responds with: messages_list event
```

#### 4. **MESSAGES_LIST** (Received from server)
Server broadcasts the current message list after any CRUD operation.

```typescript
// Server sends:
{
  "type": "messages_list",
  "messages": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "date": "2025-10-16T15:00:00.000Z",
      "content": "Sample message",
      "color": "#FF5733",
      "is_focused": false,
      "is_flashing": false,
      "source": "user",
      "asker": "John Doe",
      "is_showing": true
    }
  ],
  "timestamp": "2025-10-16T15:00:00.000Z"
}
```

## Frontend Implementation

### 1. WebSocket Service (`src/services/websocket.ts`)

Added `MessageData` interface and methods:

```typescript
export interface MessageData {
  id: string;
  date: string;
  content: string;
  color?: string | null;
  is_focused?: boolean;
  is_flashing?: boolean;
  source?: string | null;
  asker?: string | null;
  is_showing: boolean;
}

// Methods added to SimpleWebSocketService class:
addMessage(messageData: Omit<MessageData, 'id'>): void
updateMessage(messageId: string, updateData: Partial<MessageData>): void
deleteMessage(messageId: string): void
```

### 2. WebSocket Provider (`src/providers/websocket-provider.tsx`)

Added message state and handlers:

```typescript
// State
const [messages, setMessages] = useState<MessageData[]>([]);

// Event handler
wsService.on('messages_list', (message: any) => {
  if (message.messages && Array.isArray(message.messages)) {
    setMessages(message.messages);
  }
});

// Methods
const addMessage = useCallback((messageData: Omit<MessageData, 'id'>) => {
  wsServiceRef.current?.addMessage(messageData);
}, []);

const updateMessage = useCallback((messageId: string, updateData: Partial<MessageData>) => {
  wsServiceRef.current?.updateMessage(messageId, updateData);
}, []);

const deleteMessage = useCallback((messageId: string) => {
  wsServiceRef.current?.deleteMessage(messageId);
}, []);

// Context exports messages and methods
```

### 3. Messages Component (`src/components/messages/index.tsx`)

Updated to use WebSocket context by default:

```typescript
export function Messages({
  messages: propMessages,
  onMessagesChange,
  useLocalState = false  // Set to true for standalone/testing
}: MessagesProps) {
  const wsContext = useWebSocketContext();

  // Uses WebSocket messages by default
  const messages = useLocalState ? localMessages : (wsContext?.messages || []);

  // CRUD operations automatically sync via WebSocket
  const handleAddMessage = () => {
    const newMessage = {
      date: new Date().toISOString(),
      content: 'New message',
      color: '#FFFFFF',
      is_focused: false,
      is_flashing: false,
      source: 'user',
      asker: undefined,
      is_showing: true,
    };

    addMessageFn(newMessage);  // Sends via WebSocket
  };
}
```

## Usage in Room Controller

The Messages component now works automatically without props:

```tsx
// In src/components/room/index.tsx (line 278)
<Messages />

// No need to pass messages prop - it uses WebSocket context automatically
// The messages prop is now optional and only used for local state mode
```

## Permissions

- Only connections with `"access_level": "full"` can add/update/delete messages
- Room owners automatically have full access
- Messages are included in the initial connection data

## Validation

The backend validates:
- `content`: 1-2000 characters
- `color`: Hex format (`#RGB` or `#RRGGBB`) or CSS color names
- `source`, `asker`: max 100 characters

## Real-time Synchronization

1. When a user adds/updates/deletes a message, it sends a WebSocket message
2. Backend validates and updates the database
3. Backend broadcasts `messages_list` to all connected clients
4. All clients receive the updated message list and UI updates automatically

## Error Handling

Server sends error messages for validation failures:

```typescript
{
  "type": "error",
  "message": "Invalid message data: content too long",
  "error_code": "VALIDATION_ERROR"
}
```

## Example: Adding a Message Programmatically

```typescript
import { useWebSocketContext } from '@/providers/websocket-provider';

function MyComponent() {
  const { addMessage } = useWebSocketContext();

  const handleAddCustomMessage = () => {
    addMessage({
      date: new Date().toISOString(),
      content: "Custom message from code",
      color: "#4CAF50",
      is_focused: false,
      is_flashing: true,
      source: "system",
      asker: null,
      is_showing: true
    });
  };

  return <button onClick={handleAddCustomMessage}>Add Message</button>;
}
```

## Testing

To test the Messages component in standalone mode:

```tsx
<Messages useLocalState={true} messages={[]} onMessagesChange={(msgs) => console.log(msgs)} />
```

## Summary

- ✅ Message types added to WebSocket service
- ✅ Message event handlers added to WebSocket provider
- ✅ Message CRUD methods exposed through context
- ✅ Messages component integrated with WebSocket
- ✅ Real-time synchronization across all clients
- ✅ Permission-based access control
- ✅ Validation and error handling
- ✅ Initial message loading on connection

The message system is now fully functional and integrated with the existing WebSocket infrastructure!
