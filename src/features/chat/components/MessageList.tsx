import React, { useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import type { Message } from '../types/Message';
import { MessageBubble } from './MessageBubble';

export const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const ref = useRef<FlatList<Message>>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const handle = setTimeout(() => {
      if (mountedRef.current) ref.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(handle);
  }, [messages.length]);

  return (
    <FlatList<Message>
      ref={ref}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={{ padding: 12 }}
    />
  );
};
