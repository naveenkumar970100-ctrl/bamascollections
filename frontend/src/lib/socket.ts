import { io, Socket } from 'socket.io-client';

const BACKEND_URL =
  (import.meta as any).env?.VITE_BACKEND_URL ||
  (import.meta as any).env?.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

let socket: Socket | null = null;

/**
 * Get or initialize singleton Socket.IO connection
 */
export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    return null as any;
  }

  if (!socket) {
    const token = localStorage.getItem('bamas_token');

    socket = io(BACKEND_URL, {
      auth: {
        token: token || '',
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('⚡ [WebSocket Connected]: Connected to Bamas Realtime Engine ->', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 [WebSocket Disconnected]:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [WebSocket Connection Notice]:', err.message);
    });

    // 🔔 System Notifications
    socket.on('notification:new', (notification) => {
      console.log('🔔 [WebSocket]: New notification received ->', notification.title);
      window.dispatchEvent(
        new CustomEvent('bamas_notification_received', { detail: notification })
      );
    });

    // 🛍️ Bookings & Orders
    socket.on('order:new', (order) => {
      console.log('🛍️ [WebSocket]: New order created ->', order._id);
      window.dispatchEvent(new CustomEvent('bamas_order_created', { detail: order }));
    });

    socket.on('order:updated', (order) => {
      console.log('🛍️ [WebSocket]: Order updated ->', order._id, order.status);
      window.dispatchEvent(new CustomEvent('bamas_order_updated', { detail: order }));
    });

    socket.on('order:deleted', (data) => {
      console.log('🛍️ [WebSocket]: Order deleted ->', data.id);
      window.dispatchEvent(new CustomEvent('bamas_order_deleted', { detail: data }));
    });

    // 💬 Inquiries & Direct Messages
    socket.on('inquiry:new', (inquiry) => {
      console.log('💬 [WebSocket]: New inquiry received ->', inquiry._id);
      window.dispatchEvent(new CustomEvent('bamas_inquiry_created', { detail: inquiry }));
    });

    socket.on('inquiry:updated', (inquiry) => {
      console.log('💬 [WebSocket]: Inquiry updated ->', inquiry._id);
      window.dispatchEvent(new CustomEvent('bamas_inquiry_updated', { detail: inquiry }));
    });

    socket.on('inquiry:status_updated', (inquiry) => {
      console.log('💬 [WebSocket]: Inquiry status changed ->', inquiry._id, inquiry.status);
      window.dispatchEvent(new CustomEvent('bamas_inquiry_status_updated', { detail: inquiry }));
    });

    socket.on('message:new', (payload) => {
      console.log('💬 [WebSocket]: Direct message received ->', payload);
      window.dispatchEvent(new CustomEvent('bamas_message_received', { detail: payload }));
      // Also notify general inquiry update
      if (payload?.inquiry) {
        window.dispatchEvent(new CustomEvent('bamas_inquiry_updated', { detail: payload.inquiry }));
      }
    });

    // ⭐ Reviews
    socket.on('review:new', (data) => {
      console.log('⭐ [WebSocket]: Review posted ->', data);
      window.dispatchEvent(new CustomEvent('bamas_review_created', { detail: data }));
    });

    socket.on('review:deleted', (data) => {
      console.log('⭐ [WebSocket]: Review deleted ->', data);
      window.dispatchEvent(new CustomEvent('bamas_review_deleted', { detail: data }));
    });

    // 👗 Products & Inventory Real-Time Sync
    socket.on('product:created', (product) => {
      console.log('👗 [WebSocket]: Product created ->', product?.name);
      window.dispatchEvent(new CustomEvent('bamas_product_created', { detail: product }));
    });

    socket.on('product:updated', (product) => {
      console.log('👗 [WebSocket]: Product updated ->', product?.name, 'Price:', product?.price, 'Stock:', product?.countInStock);
      window.dispatchEvent(new CustomEvent('bamas_product_updated', { detail: product }));
    });

    socket.on('product:deleted', (data) => {
      console.log('👗 [WebSocket]: Product deleted ->', data);
      window.dispatchEvent(new CustomEvent('bamas_product_deleted', { detail: data }));
    });
  }

  return socket;
}

/**
 * Re-authenticate socket when user logs in or out
 */
export function refreshSocketAuth() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('bamas_token');
  if (socket) {
    socket.auth = { token: token || '' };
    socket.disconnect().connect();
  } else {
    getSocket();
  }
}

/**
 * Join specific chat/inquiry room for real-time conversation
 */
export function joinChatRoom(chatId: string) {
  const s = getSocket();
  if (s && chatId) {
    s.emit('join_chat', chatId);
  }
}

/**
 * Leave specific chat/inquiry room
 */
export function leaveChatRoom(chatId: string) {
  const s = getSocket();
  if (s && chatId) {
    s.emit('leave_chat', chatId);
  }
}

/**
 * Emit typing indicator
 */
export function sendTyping(chatId: string, senderName: string) {
  const s = getSocket();
  if (s && chatId) {
    s.emit('typing', { chatId, senderName });
  }
}

/**
 * Stop typing indicator
 */
export function stopTyping(chatId: string) {
  const s = getSocket();
  if (s && chatId) {
    s.emit('stop_typing', { chatId });
  }
}
