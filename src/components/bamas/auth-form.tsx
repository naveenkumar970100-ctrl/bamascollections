import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Eye, EyeOff, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { useCustomer } from './auth-context';
import image from '@/assets/ivory-saree.jpg';
export function AuthForm({mode}:{mode:'login'|'register'|'reset'}) {
 const {user,ready}=useCustomer(); const navigate=useNavigate();
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [name,setName]=useState('');
 const [show,setShow]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [message,setMessage]=useState(''); const [forgot,setForgot]=useState(false); const [recovery,setRecovery]=useState(false);
 useEffect(()=>{if(mode==='reset')setRecovery(new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery');},[mode]);
 useEffect(()=>{if(!user||mode==='reset')return; let active=true; supabase.from('profiles').select('display_name').eq('id',user.id).single().then(({data,error})=>{if(!active)return;if(error)setError(error.message);else setName(data?.display_name??'');});return()=>{active=false};},[user,mode]);
 async function submit(e:FormEvent) {
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try {
   if(mode==='reset') {if(!recovery)throw new Error('Please open the password recovery link from your email.');const {error}=await supabase.auth.updateUser({password});if(error)throw error;setMessage('Your password has been updated.');}
   else if(user) {const {error}=await supabase.from('profiles').update({display_name:name.trim()}).eq('id',user.id);if(error)throw error;setMessage('Your profile has been saved.');}
   else if(forgot) {const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});if(error)throw error;setMessage('Check your email for a password reset link.');}
   else if(mode==='register') {const {data,error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name.trim()},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session)await navigate({to:'/login'});else setMessage('Check your email to confirm your account before signing in.');}
   else {const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;setMessage('Welcome back. You are signed in.');}
  } catch(e) {setError(e instanceof Error?e.message:'Something went wrong. Please try again.');} finally {setBusy(false);}
 }
 async function google() {setBusy(true);setError('');try {const result=await lovable.auth.signInWithOAuth('google',{redirect_uri:window.location.origin});if(result.error)throw result.error;if(!('redirected' in result&&result.redirected))await navigate({to:'/login'});}catch(e){setError(e instanceof Error?e.message:'Google sign-in failed.');}finally{setBusy(false);}}
 const account=Boolean(user)&&mode!=='reset';
 const title=account?'Your Bamas account':mode==='reset'?'A fresh start':forgot?'Forgot your password?':mode==='register'?'Join the Bamas story':'Welcome back';
 return <main className="auth-page"><div className="auth-art"><img src={image} alt="Ivory saree with golden detailing"/><div><span className="eyebrow">Bamas Collection</span><h2>Elegance is<br/>always personal.</h2><p>Timeless sarees. Modern you.</p></div></div><section className="auth-content reveal"><span className="eyebrow">{account?'Your details':'A little tradition. A little you.'}</span><h1>{title}</h1><p>{account?'A space that’s yours.':forgot?'We’ll email you a link to reset your password.':mode==='register'?'Make yourself at home with Bamas Collection.':mode==='reset'?'Choose a new password for your account.':'It’s lovely to see you again.'}</p>
 {!ready&&<p>Loading your account…</p>}
 <form onSubmit={submit}>{(mode==='register'&&!forgot||account)&&<label>Full name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Your full name" maxLength={100}/></label>}{mode!=='reset'&&<label>Email address<input required type="email" value={account?user?.email??'':email} disabled={account} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com"/></label>}{!forgot&&!account&&<label>Password<div className="password-input"><input required type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} minLength={6} autoComplete={mode==='login'?'current-password':'new-password'} placeholder={mode==='login'?'Your password':'At least 6 characters'}/><Button type="button" variant="ghost" size="icon" aria-label={show?'Hide password':'Show password'} onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</Button></div></label>}{mode==='login'&&!account&&!forgot&&<Button className="forgot-button" type="button" variant="link" onClick={()=>{setForgot(true);setMessage('');setError('')}}>Forgot password?</Button>}{error&&<p role="alert" className="form-error">{error}</p>}{message&&<p role="status" className="form-success"><CheckCircle2 size={18}/>{message}</p>}<Button size="lg" className="auth-submit" disabled={busy||!ready||(mode==='reset'&&!recovery)} type="submit">{busy?<LoaderCircle className="spin"/>:account?'Save profile':forgot?'Send reset link':mode==='register'?'Create account':mode==='reset'?'Update password':'Sign in'}{!busy&&<ArrowRight/>}</Button></form>
 {!account&&mode!=='reset'&&!forgot&&<><div className="auth-divider"><span>or</span></div><Button variant="outline" size="lg" className="auth-submit" disabled={busy} onClick={google}><span className="google-mark">G</span> Continue with Google</Button><p className="auth-switch">{mode==='login'?<>New to Bamas? <Link to="/register">Create an account</Link></>:<>Already part of the story? <Link to="/login">Sign in</Link></>}</p></>}{forgot&&<Button variant="link" onClick={()=>{setForgot(false);setError('');setMessage('')}}>Back to sign in</Button>}{mode==='reset'&&<Link to="/login" className="text-link">Back to my account <ArrowRight size={16}/></Link>}</section></main>;
}
