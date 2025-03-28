import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CurrentUser, editBio } from "../server/fn/user";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function EditBioDialog({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: CurrentUser;
}) {
  const queryClient = useQueryClient();

  const [openDialog, setOpenDialog] = useState(false);
  const [bio, setBio] = useState(currentUser?.dB.bio ?? "wala");

  const handleEditBio = useMutation({
    mutationFn: async () => editBio({ data: { bio } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user", currentUser?.dB.username],
      });
      setOpenDialog(false);
      setBio("");
    },
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bio</DialogTitle>
          <DialogDescription>Your favorite moto or somethin'.</DialogDescription>
        </DialogHeader>
        <Textarea value={bio} onChange={(e) => setBio(e.currentTarget.value)} />
        <DialogFooter>
          <Button
            className={`${handleEditBio.isPending && "animate-pulse cursor-progress"}`}
            onClick={async () => {
              handleEditBio.mutate();
            }}
          >
            Edit Bio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
