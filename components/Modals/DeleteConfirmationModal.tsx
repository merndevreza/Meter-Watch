"use client";
import { Info } from 'lucide-react';
import { Button } from '../ui/button';
import { DeleteConfirmationModalProps } from '@/types/modal';

const DeleteConfirmationModal = ({ title, description, onClose, onDelete }: DeleteConfirmationModalProps) => {
   return (
      <div className='text-center space-y-5'>
         <div className='inline-block'>
            <Info className='text-red-600' size={50} />
         </div>
         <h2 className='text-3xl'>{title}</h2>
         <p className='max-w-95 text-lg mx-auto'>{description}</p>
         <div className='space-x-4'>
            <Button size='lg' className='text-[16px]' onClick={onClose}>Cancel</Button>
            <Button variant='destructive' className='text-[16px]' size='lg' onClick={onDelete}>Delete</Button>
         </div>
      </div>
   );
};

export default DeleteConfirmationModal;