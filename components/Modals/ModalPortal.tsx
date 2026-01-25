"use client";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalPortalProps } from "@/types/modal";
import { Card, CardContent } from "@/components/ui/card";


const ModalPortal = ({ children, setShowModal, className }: ModalPortalProps) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    // Sync the native <dialog> state with the React component mount/unmount
    useEffect(() => {
        const dialog = modalRef.current;
        if (dialog) {
            dialog.showModal();
        }
        document.body.style.overflow = "hidden";
        return () => {
            dialog?.close();
            document.body.style.overflow = "unset";
        };
    }, []);

    const closeModal = () => setShowModal(false);

    // Handle backdrop clicks (clicking outside the inner content div)
    const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
        if (event.target === modalRef.current) {
            closeModal();
        }
    };

    // Ensure the DOM node exists (Next.js/SSR safety)
    if (typeof window === "undefined") return null;
    const portalRoot = document.getElementById("modal-portal");
    if (!portalRoot) return null;

    return createPortal(
        <dialog
            ref={modalRef}
            onCancel={(e) => {
                e.preventDefault();
                closeModal();
            }}
            onClick={handleBackdropClick}
            className={cn(
                "backdrop:bg-black/50 backdrop:backdrop-blur-sm bg-transparent border-none p-0 m-0 h-full w-full max-h-none max-w-none flex items-center justify-center",
                className
            )}
        >
            <Card onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg "
            >
                <button
                    onClick={closeModal}
                    type="button"
                    className="absolute top-3 right-3 hover:opacity-70 transition-opacity"
                    aria-label="Close modal"
                >
                    <X size={24} className="text-muted-foreground" />
                </button>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </dialog>,
        portalRoot
    );
};

export default ModalPortal;