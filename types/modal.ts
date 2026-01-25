export interface ModalPortalProps {
    children: React.ReactNode;
    setShowModal: (state:boolean) => void;
    className?: string;
}

export type RechargeMeterModalProps = {
    currentBalance: number;
    mongoId: string;
    onRechargeMeter: (mongoId: string, newBalance: number) => void;
    setShowRechargeModal: (state: boolean) => void;
};