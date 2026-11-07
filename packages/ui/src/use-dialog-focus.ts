import { useEffect, useRef } from 'react';
/** Keyboard containment and return focus for modal editors and resource previews. */
export function useDialogFocus<T extends HTMLElement>(open:boolean,onClose:()=>void) {
 const ref=useRef<T>(null);
 useEffect(()=>{
  if(!open || !ref.current) return undefined;
  const root=ref.current;
  const previous=document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const focusable=()=>Array.from(root.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')).filter(element=>element.getClientRects().length>0 && !element.closest('[inert]'));
  (focusable()[0] ?? root).focus();
  const handle=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();}
   if(event.key==='Tab'){
    const items=focusable();const first=items[0];const last=items[items.length-1];
    if(!first){event.preventDefault();root.focus();}
    else if(event.shiftKey && (document.activeElement===first || document.activeElement===root)){event.preventDefault();last?.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
   }
  };
  root.addEventListener('keydown',handle);
  return ()=>{root.removeEventListener('keydown',handle);if(previous?.isConnected)previous.focus();};
 },[open,onClose]);
 return ref;
}
