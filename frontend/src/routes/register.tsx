import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/bamas/auth-form';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/register')({head:()=>pageHead('Create an Account','Join Bamas Collection with your own customer account.'),component:Register});
function Register(){return <AuthForm mode="register"/>}
