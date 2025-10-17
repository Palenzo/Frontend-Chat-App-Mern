# 🎯 WebRTC Calling Issues - Solutions

## Issue #1: "Please provide all required fields"

### Root Cause:
The backend controller expects `chatId`, `receiverId`, and `callType`, but one or more of these values might be undefined or null when the call is initiated.

### Solution:

#### 1. Add validation in CallButtons component:

```javascript
const handleVoiceCall = () => {
  const otherUser = getOtherUser();
  
  // Validation
  if (!chatId) {
    console.error('ChatId is missing');
    return;
  }
  
  if (!otherUser || !otherUser._id) {
    console.error('Receiver not found');
    return;
  }
  
  console.log('Initiating voice call:', {
    chatId,
    receiverId: otherUser._id,
    callType: 'audio',
    receiverName: otherUser.name
  });
  
  initiateCall(chatId, otherUser._id, 'audio', otherUser.name);
  handleMenuClose();
};
```

#### 2. Update CallContext to handle errors better:

```javascript
const initiateCall = async (chatId, receiverId, type, receiverName) => {
  try {
    // Validation
    if (!chatId || !receiverId || !type) {
      toast.error('Missing required information for call');
      console.error('Missing call data:', { chatId, receiverId, type });
      return;
    }
    
    setCallType(type);
    setOtherUser({ _id: receiverId, name: receiverName });

    console.log('Sending call initiation request:', {
      chatId,
      receiverId,
      callType: type
    });

    // Call API to create call record
    const { data } = await axios.post(
      `${server}/api/v1/call/initiate`,
      { chatId, receiverId, callType: type },
      { withCredentials: true }
    );

    // ... rest of the code
  } catch (error) {
    console.error('Error initiating call:', error);
    console.error('Error response:', error?.response?.data);
    toast.error(error?.response?.data?.message || 'Failed to initiate call');
    cleanupCall();
  }
};
```

---

## Issue #2: UI Looking Bizarre

### Problems:
1. Incoming call dialog may not be styled properly
2. Active call dialog might have layout issues
3. Call buttons might not be visible or properly aligned

### Solutions:

#### Fix 1: Ensure CallContext is wrapped around App

In `App.jsx` or `main.jsx`:

```javascript
import { CallProvider } from './context/CallContext';

function App() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <CallProvider user={user}>
      {/* Your app routes */}
    </CallProvider>
  );
}
```

#### Fix 2: Make sure dialogs are rendered in AppLayout

In `AppLayout.jsx`:

```javascript
import IncomingCallDialog from '../dialogs/IncomingCallDialog';
import ActiveCallDialog from '../dialogs/ActiveCallDialog';

const AppLayout = () => {
  return (
    <>
      {/* Your layout */}
      
      {/* Call Dialogs */}
      <IncomingCallDialog />
      <ActiveCallDialog />
    </>
  );
};
```

#### Fix 3: Verify ChatHeader is receiving correct props

In `Chat.jsx`:

```javascript
<ChatHeader 
  chat={chatDetails?.data?.chat} 
  members={members} 
  user={user} 
  onlineUsers={onlineUsers}
/>
```

---

## Issue #3: Backend Not Detecting User

### Problem:
Socket authentication or user context might be missing

### Solution:

Check in `app.js` that socket authentication is working:

```javascript
io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  
  if (!user) {
    console.error('User not authenticated in socket');
    return;
  }
  
  console.log('User connected:', user.name);
  userSocketIDs.set(user._id.toString(), socket.id);
  
  // ... rest of socket handlers
});
```

---

## Testing Checklist

### Before testing:
- [ ] Backend server is running
- [ ] Frontend dev server is running
- [ ] MongoDB is connected
- [ ] User is logged in
- [ ] Chat exists between two users

### Test Flow:
1. Open two browser windows
2. Log in as different users in each
3. Open a chat between them
4. Click video/audio call button
5. Check browser console for errors
6. Check backend console for logs
7. Verify incoming call appears
8. Accept the call
9. Check if WebRTC connects

### Debug Commands:

```javascript
// In browser console (Frontend):
console.log('Current User:', user);
console.log('Chat ID:', chatId);
console.log('Members:', members);
console.log('Socket Connected:', socket.connected);

// Check if CallContext is loaded:
const { isCallActive, initiateCall } = useCall();
console.log('CallContext loaded:', !!initiateCall);
```

---

## Common Issues & Fixes

### Issue: Call button not visible
**Fix**: Make sure chat is not a group chat and has exactly 2 members

### Issue: Permission denied
**Fix**: Allow camera/microphone permissions in browser

### Issue: Socket not connecting
**Fix**: Check if Socket.io client is connected before making calls

### Issue: Video not showing
**Fix**: Check if `localVideoRef` and `remoteVideoRef` are properly set

---

## Production Checklist

- [ ] Add TURN servers for NAT traversal
- [ ] Implement call notifications
- [ ] Add call recording capability
- [ ] Implement call quality indicators
- [ ] Add reconnection logic
- [ ] Handle network disconnections
- [ ] Add call analytics
- [ ] Implement call encryption
- [ ] Add call waiting/hold feature
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test behind firewall

---

## Next Steps

1. Fix the validation in CallButtons
2. Add proper error logging
3. Test the complete flow
4. Deploy and test in production
5. Add advanced features (screen sharing, group calls, etc.)
