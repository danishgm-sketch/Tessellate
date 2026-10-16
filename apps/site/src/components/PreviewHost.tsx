import React, { useEffect, useState, useRef } from 'react';
import {
  isParentToPreviewMessage,
  type PreviewTheme,
  type PreviewDevice,
  type PreviewReadyMessage,
  type PreviewResizeMessage,
  type PreviewErrorMessage,
} from '@tessellate/catalog/protocol';
import { NodeRenderer } from '@tessellate/renderer';

const resourceManifests=import.meta.glob<{default:{preview:{defaultProps?:Record<string,unknown>}}}>('../../../../resources/**/manifest.json');
const resourceModules=import.meta.glob<Record<string,unknown>>('../../../../resources/**/index.tsx');
function isResourceComponent(value:unknown):value is React.ComponentType<Record<string,unknown>> {return typeof value==='function' || (typeof value==='object' && value!==null && '$$typeof' in value && (value.$$typeof===Symbol.for('react.forward_ref') || value.$$typeof===Symbol.for('react.memo')));}

export default function PreviewHost() {
  const [resourceId, setResourceId] = useState<string>(()=>typeof window!=='undefined' ? new URLSearchParams(window.location.search).get('resource') ?? 'button' : 'button');
  const [component,setComponent]=useState<React.ComponentType<Record<string,unknown>>|null>(null);
  const [loadError,setLoadError]=useState('');
  const [variant, setVariant] = useState<string>('expressive');
  const [theme, setTheme] = useState<PreviewTheme>('light');
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [actionStatus,setActionStatus]=useState('');
  const [props, setProps] = useState<Record<string, unknown>>({});
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    let disposed=false;setComponent(null);setLoadError('');
    const loader=Object.entries(resourceModules).find(([path])=>path.endsWith(`/${resourceId}/index.tsx`))?.[1];
    if(!loader){setLoadError(`Unknown resource: ${resourceId}`);return undefined;}
    const metadataLoader=Object.entries(resourceManifests).find(([path])=>path.endsWith(`/${resourceId}/manifest.json`))?.[1];
    Promise.all([loader(),metadataLoader?.()]).then(([module,metadata])=>{
      if(!disposed)setProps(metadata?.default.preview.defaultProps??{});
      const exported=Object.entries(module).find(([name,value])=>/^[A-Z]/.test(name) && isResourceComponent(value))?.[1];
      if(!isResourceComponent(exported))throw new Error('Resource has no valid React component export.');
      if(!disposed)setComponent(()=>exported);
    }).catch(cause=>{if(!disposed)setLoadError(String(cause));});
    return ()=>{disposed=true;};
  },[resourceId]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const res = params.get('resource');
    if (res) setResourceId(res);
    const v = params.get('variant');
    if (v) setVariant(v);
    const th = params.get('theme') as PreviewTheme;
    if (th === 'light' || th === 'dark') setTheme(th);
    const dev = params.get('device') as PreviewDevice;
    if (dev === 'desktop' || dev === 'tablet' || dev === 'mobile') setDevice(dev);
    const rm = params.get('reducedMotion');
    if (rm === 'true') setReducedMotion(true);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.source!==window.parent || !document.referrer || event.origin!==new URL(document.referrer).origin || !isParentToPreviewMessage(event.data)) {
        return;
      }

      const msg = event.data;
      if (msg.type === 'TESSELLATE_PREVIEW_INIT') {
        if (msg.resourceId) setResourceId(msg.resourceId);
        if (msg.variant) setVariant(msg.variant);
        if (msg.theme) setTheme(msg.theme);
        if (msg.device) setDevice(msg.device);
        if (msg.props) setProps(msg.props);
        if (typeof msg.reducedMotion === 'boolean') setReducedMotion(msg.reducedMotion);
      } else if (msg.type === 'TESSELLATE_PREVIEW_UPDATE') {
        if (msg.variant) setVariant(msg.variant);
        if (msg.theme) setTheme(msg.theme);
        if (msg.device) setDevice(msg.device);
        if (msg.props) setProps((prev) => ({ ...prev, ...msg.props }));
        if (typeof msg.reducedMotion === 'boolean') setReducedMotion(msg.reducedMotion);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const readyMsg: PreviewReadyMessage = {
      type: 'TESSELLATE_PREVIEW_READY',
      resourceId,
      width: el.scrollWidth,
      height: el.scrollHeight,
    };
    try {
      window.parent.postMessage(readyMsg, '*');
    } catch {
      // Ignore
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const resizeMsg: PreviewResizeMessage = {
          type: 'TESSELLATE_PREVIEW_RESIZE',
          resourceId,
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        };
        try {
          window.parent.postMessage(resizeMsg, '*');
        } catch {
          // Ignore
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [resourceId, variant, theme, component]);

  const onChange=(value:unknown)=>setProps(previous=>({...previous,...(resourceId==='checkbox'||resourceId==='switch'?{checked:value}:resourceId==='multi-select'?{selected:value}:resourceId==='tabs'?{activeId:value}:{value})}));
  const interactiveProps={...props,onChange,onSelect:(value:unknown)=>{setProps(previous=>({...previous,value}));setActionStatus(`Selected ${String(value)}`);},onClose:()=>setProps(previous=>({...previous,open:false})),onConfirm:()=>{setProps(previous=>({...previous,open:false}));setActionStatus('Example action confirmed.');},onPageChange:(currentPage:number)=>setProps(previous=>({...previous,currentPage})),onClick:()=>setActionStatus('Example action activated.')};
  const available = Boolean(component);

  if (loadError) {
    const errorMsg: PreviewErrorMessage = {
      type: 'TESSELLATE_PREVIEW_ERROR',
      resourceId,
      error: loadError,
    };
    try {
      window.parent.postMessage(errorMsg, '*');
    } catch {
      // Ignore
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-sm text-neutral-500">
        Preview failed: {loadError}. The original source remains available; no substitute component is rendered.
      </div>
    );
  }

  if(!available || !component) return <div role="status" className="p-6">Loading the actual resource…</div>;

  const deviceStyles: Record<PreviewDevice, string> = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto shadow-md border-x border-neutral-200 dark:border-neutral-800',
    mobile: 'max-w-[360px] mx-auto shadow-md border-x border-neutral-200 dark:border-neutral-800',
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen w-full transition-colors ${
        reducedMotion ? 'motion-reduce:transition-none' : ''
      }`}
    >
      <div className={deviceStyles[device]}>
        {props.open===false && <button onClick={()=>setProps(previous=>({...previous,open:true}))}>Reopen example</button>}
        {actionStatus && <p role="status" className="text-sm p-2">{actionStatus}</p>}
        <div className="tess-screen @container"><NodeRenderer node={{id:`preview-${resourceId}`,nodeType:'component',semanticRole:'resource-preview',resourceRef:{id:resourceId,slug:resourceId,version:'1.0.0'},variant,props:interactiveProps,slots:{},children:[]}} context={{viewport:device,reducedMotion,designDNA:{visualMode:theme},customComponents:{[resourceId]:component}}}/></div>
      </div>
    </div>
  );
}
