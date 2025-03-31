import { toast } from "sonner";

export const errorHandlerWithToast = (e: Error) => {
  console.log("Error Name: ", e.name);
  console.log("Error Message: ", e.message);
  if (e.name === "PostgresError") {
    toast.error(e.message);
  }
  if (e.name === "Error") {
    toast.error(JSON.parse(e.message)[0].message as string);
  }
};

export const successHandlerWithToast = (
  type: "success" | "info" | "warning",
  message: string,
  action?: {
    label: string;
    onClick: () => void;
  },
) => {
  if (action) {
    if (type === "success")
      toast.success(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    if (type === "info")
      toast.info(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    if (type === "warning")
      toast.warning(message, {
        action: {
          label: action.label,
          onClick: () => {
            action.onClick();
          },
        },
      });
    return;
  }
  if (type === "success") {
    toast.success(message);
  }
  if (type === "info") {
    toast.info(message);
  }
  if (type === "warning") {
    toast.warning(message);
  }
};
