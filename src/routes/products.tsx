import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pieces } from '@/components/bamas/pieces';
import { collection } from '@/lib/collection';
import { pageHead } from '@/lib/page-head';
export const Route=createFileRoute('/products')({head:()=>pageHead('The Collection','Explore the Bamas Collection saree edits, from festive emerald and wine to soft rose and ivory.'),component:Products});
function Products(){const [category,setCategory]=useState('All');const items=collection.filter(p=>category==='All'||p.category===category);return <main><div className="page-title reveal"><span className="eyebrow">A story in every drape</span><h1>The Bamas Collection</h1><p>Heritage-inspired details. A modern sensibility.<br/>Discover the edit that feels like you.</p></div><section className="section-wrap"><div className="catalog-toolbar"><div className="category-tabs" aria-label="Collection filters">{['All','Silk','Festive','Everyday'].map(c=><Button variant={category===c?'default':'ghost'} key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c==='All'?'All sarees':c}</Button>)}</div><span>{items.length} collection {items.length===1?'piece':'pieces'}</span></div><Pieces items={items}/><p className="catalog-note">Preview collection · Availability and pricing coming soon.</p></section></main>}
