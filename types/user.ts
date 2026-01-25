export type User = {
   id: string;
   email: string;
   emailVerified: Date | null;
   name?: string;
   image?: string;
}