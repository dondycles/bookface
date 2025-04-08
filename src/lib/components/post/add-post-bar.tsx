import { CurrentUserInfo } from "../../server/fn/user";
import { Input } from "../ui/input";
import UserAvatar from "../user/user-avatar";
import UpsertPostDialog from "./upsert-post-dialog";

export default function AddPostBar({
  currentUserInfo,
}: {
  currentUserInfo: CurrentUserInfo;
}) {
  return (
    <div hidden={!currentUserInfo}>
      <UpsertPostDialog>
        <div className="flex flex-row gap-2 flex-1 p-2 bg-muted sm:rounded-md">
          <UserAvatar
            username={currentUserInfo?.dB.username}
            url={currentUserInfo?.dB.image}
          />
          <Input
            placeholder={`What's happening, ${currentUserInfo?.dB?.username ?? currentUserInfo?.dB?.name}?`}
            className="rounded-full flex-1"
          />
        </div>
      </UpsertPostDialog>
    </div>
  );
}
