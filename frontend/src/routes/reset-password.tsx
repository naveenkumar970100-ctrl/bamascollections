import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/bamas/auth-form';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset Your Password','Securely set a new password for your Bamas Collection account.'),component:Reset});
function Reset(){return <AuthForm mode="reset"/>}
