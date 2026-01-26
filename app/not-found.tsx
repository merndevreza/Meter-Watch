import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='bg-background text-foreground w-full h-screen flex justify-center items-center'> 
      <div className="text-center px-67.5 rounded-4xl border border-light-grey pt-19.5 pb-18">
        <p className="text-[26px] font-medium mb-6">Page not found</p>
        <div className='border-t border-b border-warning-red pt-7 px-8 pb-11 mt-1 mb-15 '>
          <p className="text-[19px] font-bold">ERROR</p>
          <h1 className=" text-[191px] leading-none font-medium flex justify-center mb-6">
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </h1>
          <Link href="/login">
          <Button>
            Login
          </Button>
          </Link>
        </div> 
      </div> 
    </main>
  )
}