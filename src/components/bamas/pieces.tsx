import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { CollectionPiece } from '@/lib/collection';
export function Pieces({items}:{items:CollectionPiece[]}) {
 const [piece,setPiece]=useState<CollectionPiece|null>(null);
 return <><div className="pieces-grid">{items.map((p,i)=><article className={`piece reveal delay-${i}`} key={p.id}><button className="piece-photo" aria-label={`View ${p.name}`} onClick={()=>setPiece(p)}><img className={p.position} src={p.image} width="768" height="1024" loading="lazy" alt={p.name}/><span className="piece-view">Discover <ArrowUpRight size={18}/></span></button><div className="piece-meta"><div><span className="eyebrow">{p.category} edit</span><h3>{p.name}</h3></div><Button variant="ghost" size="icon" aria-label={`Details for ${p.name}`} onClick={()=>setPiece(p)}><ArrowUpRight/></Button></div></article>)}</div><Dialog open={Boolean(piece)} onOpenChange={v=>{if(!v)setPiece(null)}}><DialogContent className="piece-dialog">{piece&&<><img src={piece.image} className={piece.position} alt={piece.name}/><div><span className="eyebrow">{piece.category} edit</span><DialogTitle>{piece.name}</DialogTitle><DialogDescription>{piece.detail}</DialogDescription><p className="catalog-note">Collection inspiration. Product availability and pricing will be announced.</p><Button variant="outline" onClick={()=>setPiece(null)}>Continue exploring</Button></div></>}</DialogContent></Dialog></>;
}
