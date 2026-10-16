import {loadCheckpointJournal,saveCheckpointJournal} from '../persistence/checkpoint-journal.js';
import { composeProjectPipeline } from '@tessellate/compatibility';
import React, { useEffect, useState } from 'react';
import { useWorkbenchStore } from '../store/workbench-store.js';
import { TopToolbar } from './TopToolbar.js';
import { LeftPanel } from './left-panel/LeftPanel.js';
import { WorkbenchCanvas } from './canvas/WorkbenchCanvas.js';
import { RightInspector } from './right-inspector/RightInspector.js';
import { CommandBar } from './CommandBar.js';
import { MobileWorkbench } from './mobile/MobileWorkbench.js';
import { PreviewModal } from './preview/PreviewModal.js';
import { CompareModal } from './compare/CompareModal.js';
import { BlendModal } from './blend/BlendModal.js';
import { ReplaceDrawer } from './replace/ReplaceDrawer.js';
import { AuditPanel } from './audit/AuditPanel.js';
import { loadBrowserProject, createProjectSaver } from '../persistence/browser-session.js';
import { setActiveCatalog } from '../mutations/replace.js';
import { ResourceManifestSchema, ProjectManifestSchema } from '@tessellate/schemas';

export function WorkbenchShell() {
  const activeMode = useWorkbenchStore((state) => state.activeMode);
  const isPreview = useWorkbenchStore((state) => state.isPreview);
  const selectParentNode = useWorkbenchStore((state) => state.selectParentNode);
  const undo = useWorkbenchStore((state) => state.undo);
  const redo = useWorkbenchStore((state) => state.redo);
  const setDevicePreset = useWorkbenchStore((state) => state.setDevicePreset);
  const setZoom = useWorkbenchStore((state) => state.setZoom);
  const selectedNodeId = useWorkbenchStore((state) => state.selectedNodeId);
  const toggleNodeLock = useWorkbenchStore((state) => state.toggleNodeLock);
  const openReplaceDrawer = useWorkbenchStore((state) => state.openReplaceDrawer);
  const setManifest = useWorkbenchStore((state) => state.setManifest);

  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [damagedRecords, setDamagedRecords] = useState<Array<{raw:string; reason:string}>>([]);

  // Load project from URL or local persistence on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let disposed = false;
    let unsubscribe: (()=>void) | undefined;
    const params=new URLSearchParams(window.location.search);
    const projectId=params.get('project') ?? undefined;
    const showcaseId=params.get('showcase');
    const resourceSlug=params.get('resource');
    const saver = createProjectSaver(error => { if (!disposed) setStorageError(`Local save failed: ${String(error)}. Export your manifest before leaving.`); });
    Promise.all([
      loadBrowserProject(projectId),
      fetch('/data/catalog.json').then(async response => {
        if (!response.ok) throw new Error(`Catalogue HTTP ${response.status}`);
        const payload = await response.json();
        return ResourceManifestSchema.array().parse(payload.resources);
      }),
    ]).then(async ([loaded, catalog]) => {
      if (disposed) return;
      setDamagedRecords(loaded.damagedRecords);
      setActiveCatalog(catalog);
      if(showcaseId || resourceSlug){
        void (async()=>{
          let imported;
          if(showcaseId){const response=await fetch(`/data/showcases/${encodeURIComponent(showcaseId)}.json`);if(!response.ok)throw new Error(`Showcase HTTP ${response.status}`);imported=ProjectManifestSchema.parse(await response.json());}
          else {const resource=catalog.find(item=>item.slug===resourceSlug);if(!resource || resource.status!=='verified-gold')throw new Error('This resource is outside the Gold composition runtime. Its source remains available on the resource page.');imported=composeProjectPipeline({description:'A local resource exploration project',visualAmbition:40,structuralCreativity:40},{catalogResources:catalog,seed:crypto.randomUUID()}).directionA.manifest;const screen=imported.screens[0]!;screen.name=resource.name;screen.rootNode={id:`resource-root-${crypto.randomUUID()}`,nodeType:'layout',semanticRole:'marketing-page',children:[{id:`resource-${crypto.randomUUID()}`,nodeType:'section',semanticRole:resource.roles[0]??'component',resourceRef:{id:resource.id,slug:resource.slug,version:resource.version},variant:resource.variants[0]?.id,children:[],slots:{},props:resource.preview.defaultProps??{}}],slots:{},props:{}};imported.screens=[screen];imported.navigation.primaryItems=[];imported.screenGraph.groups=imported.screenGraph.groups.map(group=>({...group,screens:group.screens.filter(node=>node.id===screen.id)}));imported.screenGraph.edges=[];imported.name=`Resource study — ${resource.name}`;}
          if(disposed)return;
          imported.id=`local-${crypto.randomUUID()}`;
          setManifest(ProjectManifestSchema.parse(imported));await saver(imported);
          const url=new URL(window.location.href);url.search='';url.searchParams.set('project',imported.id);window.history.replaceState(null,'',url);
          setLoading(false);
        })().catch(error=>{if(!disposed){setStorageError(String(error));setLoading(false);}});
      }
      else if (loaded.manifest) setManifest(loaded.manifest);
      else if (projectId) throw new Error(`Project ${projectId} was not found in this browser.`);
      else if (loaded.damagedRecords.length===0) {
        const starter=composeProjectPipeline({description:'An employee experience platform with people, teams, onboarding and policies. This is a sample local project.',feel:'professional but playful',visualAmbition:40,structuralCreativity:55,targetDevices:['desktop','tablet','mobile']},{catalogResources:catalog,seed:crypto.randomUUID()}).directionA.manifest;
        starter.name='Example employee workspace';
        setManifest(starter);
        void saver(starter);
      }
      if(loaded.manifest && !showcaseId && !resourceSlug){
        const checkpoints=await loadCheckpointJournal(loaded.manifest.id);
        if(disposed)return;
        if(checkpoints.length)useWorkbenchStore.setState({checkpoints});
      }
      // Never overwrite corrupt records with a sample. Recovery remains read-only.
      if (loaded.damagedRecords.length === 0) {
        unsubscribe = useWorkbenchStore.subscribe((state, previous) => {
          if (state.manifest !== previous.manifest) {
            void saver(state.manifest);
            if(state.manifest.id!==previous.manifest.id){
              const url=new URL(window.location.href);url.search='';url.searchParams.set('project',state.manifest.id);window.history.replaceState(null,'',url);
              try {
                const raw=localStorage.getItem(`tessellate_directions_${previous.manifest.id}`);
                if(raw && !localStorage.getItem(`tessellate_directions_${state.manifest.id}`))localStorage.setItem(`tessellate_directions_${state.manifest.id}`,JSON.stringify(ProjectManifestSchema.array().parse(JSON.parse(raw))));
              }catch(error){if(!disposed)setStorageError(`Direction metadata could not be carried forward: ${String(error)}. Your current project is preserved.`);}
            }
          }
          if(state.checkpoints!==previous.checkpoints)void saveCheckpointJournal(state.manifest.id,state.checkpoints).catch(error=>{if(!disposed)setStorageError(`Checkpoint save failed: ${String(error)}. Export your current project.`);});
        });
      }
      if(!showcaseId && !resourceSlug){setLoading(false);if(params.get('open')==='blend')useWorkbenchStore.getState().openBlend();}
    }).catch(error => {
      if (!disposed) { setStorageError(String(error)); setLoading(false); }
    });
    return () => { disposed = true; unsubscribe?.(); };
  }, [setManifest]);

  useEffect(()=>{
    const navigate = ()=>{
      const id = decodeURIComponent(window.location.hash.slice(1));
      if(useWorkbenchStore.getState().manifest.screens.some(screen=>screen.id===id)) useWorkbenchStore.getState().setActiveScreen(id);
    };
    window.addEventListener('hashchange',navigate);
    return ()=>window.removeEventListener('hashchange',navigate);
  },[]);

  // Responsive window listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger global shortcuts if typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      // Escape to climb selection
      if (e.key === 'Escape' && !document.querySelector('[role=dialog]')) {
        e.preventDefault();
        selectParentNode();
      }

      // Undo / Redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // 1: Desktop preset
      if (e.key === '1') {
        e.preventDefault();
        setDevicePreset('1440');
      }

      // 2: Tablet preset
      if (e.key === '2') {
        e.preventDefault();
        setDevicePreset('768');
      }

      // 3: Mobile preset
      if (e.key === '3') {
        e.preventDefault();
        setDevicePreset('390');
      }

      // F: Fit / 100% zoom
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setZoom(1.0);
      }

      // L: Lock selected node
      if (e.key.toLowerCase() === 'l' && selectedNodeId) {
        e.preventDefault();
        if (e.shiftKey) useWorkbenchStore.getState().unlockAllNodeLocks(selectedNodeId);
        else toggleNodeLock(selectedNodeId, 'node');
      }

      // R: Replace selected node
      if (e.key.toLowerCase() === 'r' && selectedNodeId) {
        e.preventDefault();
        openReplaceDrawer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectParentNode, undo, redo, setDevicePreset, setZoom, toggleNodeLock, openReplaceDrawer]);

  if (loading) return <div role="status" className="p-8">Loading local project and verified catalogue…</div>;
  if (damagedRecords.length) return <main className="p-8 space-y-4"><h1>Recover your local project</h1><p role="alert">A stored record could not be validated. Its original data has been preserved. Editing is paused to protect your work.</p>{damagedRecords.map((record,index)=><div key={index}><p>{record.reason}</p><a download={`recovered-record-${index}.json`} href={`data:application/json;charset=utf-8,${encodeURIComponent(record.raw)}`}>Export raw record {index+1}</a></div>)}<a href="/compose">Create a separate project</a></main>;
  if (storageError) return <main className="p-8 space-y-4"><h1>Local project needs attention</h1><p role="alert">{storageError}</p><a download="unsaved-project.tess.json" href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(useWorkbenchStore.getState().manifest,null,2))}`}>Export the current manifest</a><p><a href="/compose">Open Compose</a></p></main>;

  // Clean full-screen preview mode
  if (isPreview) {
    return <PreviewModal />;
  }

  // Mobile layout below 1024px
  if (isMobileScreen) {
    return <MobileWorkbench />;
  }

  // Desktop viewport-filling shell
  return (
    <div
      data-testid="workbench-shell"
      className="h-screen w-screen overflow-hidden flex flex-col bg-[#0B0D10] text-[#F5F7FA]"
    >
      {/* 56px Top Toolbar */}
      <TopToolbar />

      {/* Main 3-column composition canvas workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel (280px) */}
        <LeftPanel />

        {/* Central Canvas or Audit Dashboard */}
        {activeMode === 'audit' ? <AuditPanel /> : <WorkbenchCanvas />}

        {/* Right Contextual Inspector (340px) */}
        <RightInspector />

        {/* Advanced Modals & Drawers */}
        <ReplaceDrawer />
        <CompareModal />
        <BlendModal />
      </div>

      {/* 64px Command Bar */}
      <CommandBar />
    </div>
  );
}
