import { queryOptions } from "@tanstack/react-query";
import {
  getChatRoomChats,
  getChatRoomData,
  getCurrentUserChatRoomsId,
  getLatestMessage,
} from "../server/fn/messages";

export const currentUserChatRoomIdsQueryOptions = () =>
  queryOptions({
    queryKey: ["currentUserChatRoomIds"],
    queryFn: ({ signal }) => getCurrentUserChatRoomsId({ signal }),
  });

export const chatRoomChatsQueryOptions = (chatRoomId: string) =>
  queryOptions({
    queryKey: ["chatRoomChats", chatRoomId],
    queryFn: ({ signal }) => getChatRoomChats({ signal, data: { chatRoomId } }),
  });

export const chatRoomDataQueryOptions = (chatRoomId: string) =>
  queryOptions({
    queryKey: ["chatRoom", chatRoomId],
    queryFn: ({ signal }) => getChatRoomData({ signal, data: { chatRoomId } }),
  });

export const chatRoomLatestMessageQueryOptions = (chatRoomId: string) =>
  queryOptions({
    queryKey: ["latestMessage", chatRoomId],
    queryFn: ({ signal }) => getLatestMessage({ signal, data: { chatRoomId } }),
  });
