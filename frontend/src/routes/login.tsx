import {createFileRoute} from '@tanstack/react-router';
import {AuthForm} from '@/components/bamas/auth-form';
import {pageHead} from '@/lib/page-head';
export const Route=createFileRoute('/login')({head:()=>pageHead('Login & My Account','Sign in to Bamas Collection and manage your personal customer profile.'),component:Login});
function Login(){return <AuthForm mode="login"/>}
