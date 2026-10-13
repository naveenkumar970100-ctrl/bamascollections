import { Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Menu, X, UserRound, ArrowUpRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomer } from './auth-context';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/bamas-logo.asset.json';
const nav = [{to:'/', label:'Home'}, {to:'/products',label:'Collection'}, {to:'/about',label:'Our story'}, {to:'/faq',label:'FAQs'}] as const;
export function SiteHeader() {
  const [open,setOpen] = useState(false);
  const {user} = useCustomer();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    await supabase.auth.signOut(); await navigate({to:'/login',replace:true});
  }
  return <><div className="announcement">Timeless sarees. Modern you. <span className="announcement-star">✧</span> The Bamas Collection</div>
    <header className="site-header"><div className="header-inner">
      <Link to="/" className="wordmark" aria-label="Bamas Collection home"><img src={logo.url} alt="" width="46" height="46"/><span>BAMAS<small>COLLECTION</small></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{nav.map(n=><Link key={n.to} to={n.to} activeOptions={{exact:true}} activeProps={{className:'nav-active'}}>{n.label}</Link>)}</nav>
      <div className="header-actions"><Button asChild variant="ghost" size="icon" title={user?'My account':'Log in'}><Link to="/login" aria-label={user?'My account':'Log in'}><UserRound/></Link></Button>{user?<Button variant="ghost" size="icon" title="Sign out" onClick={signOut}><LogOut/></Button>:<Button asChild variant="outline" className="register-link"><Link to="/register">Join Bamas <ArrowUpRight/></Link></Button>}<Button variant="ghost" size="icon" className="mobile-menu-toggle" aria-label={open?'Close menu':'Open menu'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</Button></div>
    </div>{open&&<nav className="mobile-nav" aria-label="Mobile navigation">{nav.map(n=><Link key={n.to} to={n.to} onClick={()=>setOpen(false)}>{n.label}</Link>)}<Link to="/register" onClick={()=>setOpen(false)}>Join Bamas</Link></nav>}</header></>;
}
export function SiteFooter() {
 return <footer className="site-footer"><div className="footer-inner"><div><Link to="/" className="footer-wordmark">BAMAS <span>COLLECTION</span></Link><p>Timeless Sarees. Modern You.</p></div><nav aria-label="Footer navigation">{nav.slice(1).map(n=><Link key={n.to} to={n.to}>{n.label}</Link>)}<Link to="/login">My account</Link></nav><div className="footer-note">Rooted in tradition.<br/>Made for your story.</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Bamas Collection</span><span>Elegance, in every thread.</span></div></footer>;
}
