import { AnyFieldApi } from "@tanstack/react-form";

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-sm text-muted-foreground">
          {field.state.meta.errors[0].message}
        </em>
      ) : null}
    </>
  );
}
