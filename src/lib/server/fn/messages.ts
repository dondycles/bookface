import { authMiddleware } from "@/lib/middleware/auth-guard";
import { chat, chatRoom } from "@/lib/schema";
import { createServerFn } from "@tanstack/react-start";
import { arrayContains } from "drizzle-orm";
import { db } from "../db";
import { pusher } from "../pusher";

export const createOrGetChatRoomId = createServerFn({
  method: "GET",
})
  .middleware([authMiddleware])
  .validator((data: { receiverId: string }) => data)
  .handler(async ({ data: { receiverId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    const existingRoom = await db.query.chatRoom.findFirst({
      where: (chatRoom, { eq, or }) =>
        or(
          eq(chatRoom.id, `${receiverId}${user.id}`),
          eq(chatRoom.id, `${user.id}${receiverId}`),
        ),
      columns: {
        id: true,
      },
    });
    if (existingRoom) return existingRoom.id;
    const newRoom = await db
      .insert(chatRoom)
      .values({
        id: `${receiverId}${user.id}`,
        people: [receiverId, user.id],
      })
      .returning({ id: chatRoom.id });

    return newRoom[0].id;
  });

export const getChatRoomData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { chatRoomId: string }) => data)
  .handler(async ({ data: { chatRoomId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    return await db.query.chatRoom.findFirst({
      where: (chatRoom, { eq }) => eq(chatRoom.id, chatRoomId),
    });
  });

export const getCurrentUserChatRoomsId = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    return await db.query.chatRoom.findMany({
      where: (chatRoom) => arrayContains(chatRoom.people, [user.id]),
    });
  });

export type ChatRooms = Awaited<ReturnType<typeof getCurrentUserChatRoomsId>>;

export const getChatRoomChats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((data: { chatRoomId: string }) => data)
  .handler(async ({ data: { chatRoomId }, context: { dB: user } }) => {
    if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
    if (!chatRoomId) throw new Error(`[{ "message": "No Chat Room ID." }]`);
    return await db.query.chat.findMany({
      where: (chat, { eq }) => eq(chat.roomId, chatRoomId),
      orderBy: (chat, { desc }) => [desc(chat.createdAt)],
    });
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { chatRoomId: string; receiverId: string; message: string }) => data)
  .handler(
    async ({ data: { chatRoomId, receiverId, message }, context: { dB: user } }) => {
      if (!user.id) throw new Error(`[{ "message": "No User ID." }]`);
      if (!chatRoomId) throw new Error(`[{ "message": "No Chat Room ID." }]`);
      if (!receiverId) throw new Error(`[{ "message": "No Receiver ID." }]`);
      if (message.trim().length === 0)
        throw new Error(`[{ "message": "Message Is Empty." }]`);
      await db
        .insert(chat)
        .values({ message, receiverId, roomId: chatRoomId, senderId: user.id });
      await pusher.trigger(chatRoomId, "messages", null);
    },
  );
