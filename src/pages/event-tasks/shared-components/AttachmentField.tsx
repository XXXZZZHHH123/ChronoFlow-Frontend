import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  accept?: string;
};

export function AttachmentsField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  control,
  name,
  label = "Attachments (optional)",
  helperText = "Accepted: common file types such as documents, images, and PDFs.",
  disabled,
  accept,
}: Props<TFieldValues, TName>) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const inputId = React.useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const files: File[] = (field.value as unknown as File[]) ?? [];

        const handleAppend = (picked: FileList | null) => {
          if (!picked || picked.length === 0) return;
          const incoming = Array.from(picked);
          const next = files.concat(incoming);
          field.onChange(next.length ? next : undefined);

          if (inputRef.current) inputRef.current.value = "";
        };

        const removeAt = (idx: number) => {
          const next = files.slice();
          next.splice(idx, 1); // remove only this instance
          field.onChange(next.length ? next : undefined);
        };

        return (
          <div className="grid gap-2">
            <label htmlFor={inputId} className="text-sm font-medium">
              {label}
            </label>

            {/* hidden native input; we drive it with a custom trigger */}
            <Input
              id={inputId}
              ref={inputRef}
              type="file"
              multiple
              accept={accept}
              disabled={disabled}
              onChange={(e) => handleAppend(e.currentTarget.files)}
              className="hidden"
            />

            {/* custom trigger with live summary */}
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-between font-normal"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <span>Choose Files</span>
              <span className="text-muted-foreground">
                {files.length > 0
                  ? `${files.length} file${
                      files.length > 1 ? "s" : ""
                    } selected`
                  : "No files selected"}
              </span>
            </Button>

            {/* preview list */}
            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((f, idx) => {
                  const isImage = /^image\//.test(f.type);
                  const url = isImage ? URL.createObjectURL(f) : undefined;
                  const sizeKB = Math.max(1, Math.round(f.size / 1024));

                  return (
                    <div
                      key={`${f.name}-${f.size}-${f.lastModified}-${idx}`}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
                      {isImage ? (
                        <img
                          src={url}
                          alt={f.name}
                          className="h-10 w-10 rounded object-cover"
                          onLoad={() => url && URL.revokeObjectURL(url)}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs">
                          FILE
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {f.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {sizeKB} KB
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => removeAt(idx)}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
          </div>
        );
      }}
    />
  );
}
