"use client";

import { useEffect, useRef } from "react";
import type { ManagedLink } from "@/lib/supabase/links";

type DeleteLinkDialogProps = {
  link: ManagedLink;
  isDeleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteLinkDialog({
  link,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}: DeleteLinkDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="delete-link-dialog"
      role="alertdialog"
      aria-labelledby="delete-link-heading"
      aria-describedby="delete-link-title"
      aria-busy={isDeleting}
      onCancel={(event) => {
        event.preventDefault();
        if (!isDeleting) {
          onCancel();
        }
      }}
    >
      <h2 id="delete-link-heading">링크를 삭제할까요?</h2>
      <p id="delete-link-title">{link.title}</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="link-edit-actions">
        <button
          className="link-secondary-button"
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
        >
          취소
        </button>
        <button
          className="link-secondary-button link-delete-button"
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? "삭제 중…" : "삭제"}
        </button>
      </div>
    </dialog>
  );
}
