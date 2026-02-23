"use client";
import { Info, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { DeleteConfirmationModalProps } from '@/types';

const DeleteConfirmationModal = ({ title, description, onClose, onDelete, isDeleting = false, isDeleted = false }: DeleteConfirmationModalProps) => {
   if (isDeleted) {
      return (
         <div className='text-center space-y-5'>
            <div className='inline-block'>
               <CheckCircle className='text-green-600' size={50} />
            </div>
            <h2 className='text-3xl'>Deleted</h2>
            <p className='max-w-95 text-lg mx-auto'>Successfully deleted</p>
         </div>
      );
   }

   if (isDeleting) {
      return (
         <div className='text-center space-y-5'>
            <div className='inline-block'>
               <div className='inline-flex items-center justify-center w-[50px] h-[50px]'>
                  <div className='animate-spin h-[50px] w-[50px] border-4 border-red-200 border-t-red-600 rounded-full'></div>
               </div>
            </div>
            <h2 className='text-3xl'>Deleting...</h2>
            <p className='max-w-95 text-lg mx-auto'>Please wait</p>
         </div>
      );
   }

   return (
      <div className='text-center space-y-5'>
         <div className='inline-block'>
            <Info className='text-red-600' size={50} />
         </div>
         <h2 className='text-3xl'>{title}</h2>
         <p className='max-w-95 text-lg mx-auto'>{description}</p>
         <div className='space-x-4'>
            <Button size='lg' className='text-[16px]' onClick={onClose} disabled={isDeleting}>Cancel</Button>
            <Button variant='destructive' className='text-[16px]' size='lg' onClick={onDelete} disabled={isDeleting}>Delete</Button>
         </div>
      </div>
   );
};

export default DeleteConfirmationModal;