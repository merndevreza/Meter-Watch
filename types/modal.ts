export interface ModalPortalProps {
    children: React.ReactNode;
    setShowModal: (state:boolean) => void;
    className?: string;
}

export type BalanceUpdaterModalProps = {
    currentBalance: number;
    mongoId: string;
    onBalanceUpdate: (mongoId: string, newBalance: number) => void;
    setShowModal: (state: boolean) => void;
    modalType: "recharge" | "balance-use"
};  