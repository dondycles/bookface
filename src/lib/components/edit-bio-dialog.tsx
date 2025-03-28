import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { userQueryOptions } from "../queries/user";
import { editBio } from "../server/fn/user";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
export default function EditBioDialog({ children }: { children: React.ReactNode }) {
  const { queryClient, currentUser } = useRouteContext({ from: "__root__" });
  const { data: currentUserProfile } = useQuery(
    userQueryOptions(currentUser?.dB?.id ?? ""),
  );
  const [openDialog, setOpenDialog] = useState(false);
  const [bio, setBio] = useState(currentUserProfile?.bio ?? "");

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
