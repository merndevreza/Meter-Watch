import { Dictionary } from "./dictionary";

export interface ModalPortalProps {
    children: React.ReactNode;
    setShowModal: (state: boolean) => void;
    className?: string;
}
 
export type ThresholdUpdaterModalProps = {
    dictionary:Dictionary; 
    consumerNumber: string;
    currentThreshold:string;
    onThresholdUpdate: (consumerNumber: string, newThreshold: number) => void;
    setShowModal: (state: boolean) => void; 
};

export type DeleteConfirmationModalProps = {
    title: string;
    description: string;
    onClose: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
    isDone?: boolean;
}