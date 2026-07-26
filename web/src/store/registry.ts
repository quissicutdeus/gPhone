import { writable } from "svelte/store";
import type { Snippet } from "svelte";

export interface AppManifest {
    id: string;
    name: string;
    color: string;
    icon: Snippet | any; // Svelte component or snippet
    badgeStore?: any;
    version?: string;
    author?: string;
}

// Glob all manifest.ts files in ../modules/
const manifestFiles = import.meta.glob("../modules/*/manifest.ts", { eager: true });
const appComponents = import.meta.glob("../modules/*/index.svelte", { eager: true });

// Parse manifests
const loadedApps: AppManifest[] = [];
const componentRegistry: Record<string, any> = {};

for (const path in manifestFiles) {
    const manifest = (manifestFiles[path] as any).default as AppManifest;
    if (manifest && manifest.id) {
        loadedApps.push(manifest);

        // Find corresponding component
        const componentPath = path.replace("manifest.ts", "index.svelte");
        if (appComponents[componentPath]) {
            componentRegistry[manifest.id] = (appComponents[componentPath] as any).default;
        }
    }
}

export const registeredApps = loadedApps;
export const registeredComponents = componentRegistry;

// Reactive App Registry Store for Dynamic Community App Installation
function createAppRegistry() {
    const { subscribe, update } = writable<AppManifest[]>(loadedApps);

    return {
        subscribe,
        registerApp: (manifest: AppManifest, component: any) => {
            if (!manifest.id) return;
            componentRegistry[manifest.id] = component;
            update((apps) => {
                const existingIndex = apps.findIndex((a) => a.id === manifest.id);
                if (existingIndex >= 0) {
                    apps[existingIndex] = manifest;
                    return [...apps];
                }
                return [...apps, manifest];
            });
        },
        unregisterApp: (appId: string) => {
            delete componentRegistry[appId];
            update((apps) => apps.filter((a) => a.id !== appId));
        },
        getComponent: (appId: string) => componentRegistry[appId],
    };
}

export const appRegistryStore = createAppRegistry();
