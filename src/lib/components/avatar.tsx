import { cn } from "../utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({
  className,
  url,
  alt,
}: {
  className?: string | undefined;
  url: string | null | undefined;
  alt: string;
}) {
  return (
    <Avatar className={cn("", className)}>
      <AvatarImage src={url ?? "favicon.ico"} alt={alt} />
      <AvatarFallback>BF</AvatarFallback>
    </Avatar>
  );
}
