"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function defaultNameFromFile(file) {
  if (!file?.name) return "";
  return file.name.replace(/\.json$/i, "").trim();
}

export default function IngestUploadDialog({
  open,
  onOpenChange,
  onSubmit,
  submitPending = false,
  submitError = null,
}) {
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    if (!open) {
      setName("");
      setFile(null);
      setNameError(null);
      setFileError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    let valid = true;

    if (!trimmedName) {
      setNameError("Group name is required");
      valid = false;
    } else {
      setNameError(null);
    }

    if (!file) {
      setFileError("A JSON file is required");
      valid = false;
    } else {
      setFileError(null);
    }

    if (!valid) return;

    const ok = await onSubmit({ name: trimmedName, file });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (submitPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md" showCloseButton={!submitPending}>
        <DialogHeader>
          <DialogTitle>Upload businesses JSON</DialogTitle>
          <DialogDescription>
            Name this ingest group, then choose the scrape JSON file to process.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="ingest-group-name">Group name</Label>
            <Input
              id="ingest-group-name"
              value={name}
              disabled={submitPending}
              placeholder="e.g. Texas batch 1"
              autoFocus
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
            />
            {nameError ? (
              <p className="text-xs text-destructive">{nameError}</p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="ingest-group-file">JSON file</Label>
            <input
              id="ingest-group-file"
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              disabled={submitPending}
              className="flex h-7 w-full min-w-0 cursor-pointer rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm file:mr-2 file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                if (fileError) setFileError(null);
                if (nextFile && !name.trim()) {
                  setName(defaultNameFromFile(nextFile));
                }
              }}
            />
            {file ? (
              <p className="truncate text-xs text-muted-foreground">
                {file.name}
              </p>
            ) : null}
            {fileError ? (
              <p className="text-xs text-destructive">{fileError}</p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive">{submitError}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitPending}>
              {submitPending ? "Uploading…" : "Upload & start"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
