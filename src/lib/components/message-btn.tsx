import { useRouter } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { createOrGetChatRoomId } from "../server/fn/messages";
import { cn } from "../utils";
import { Button } from "./ui/button";

export default function MessageBtn({
  className,
  variant,
  targetedUserId,
  children,
}: {
  className?: string;
  variant:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  targetedUserId: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const handleOnClick = async () => {
    const chatRoomId = await createOrGetChatRoomId({
      data: { receiverId: targetedUserId },
    });

    if (chatRoomId) router.navigate({ to: "/m/$id", params: { id: chatRoomId } });
  };
  return (
    <Button onClick={handleOnClick} variant={variant} className={cn("", className)}>
      {children ?? (
        <>
          <MessageCircle /> Message
        </>
      )}
    </Button>
  );
}
