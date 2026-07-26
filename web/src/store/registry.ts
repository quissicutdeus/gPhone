import { writable } from "svelte/store";
import { type AppManifest, defineApp } from "@gphone/sdk";

export type { AppManifest } from "@gphone/sdk";

// Glob all manifest.ts files in ../modules/
const manifestFiles = import.meta.glob("../modules/*/manifest.ts", { eager: true });
const appComponents = import.meta.glob("../modules/*/index.svelte", { eager: true });

// Parse manifests
const loadedApps: AppManifest[] = [];
const componentRegistry: Record<string, any> = {};

for (const path in manifestFiles) {
    const rawManifest = (manifestFiles[path] as any).default as AppManifest;
    if (rawManifest && rawManifest.id) {
        const manifest = defineApp(rawManifest);
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
            const validatedManifest = defineApp(manifest);
            componentRegistry[validatedManifest.id] = component;
            update((apps) => {
                const existingIndex = apps.findIndex((a) => a.id === validatedManifest.id);
                if (existingIndex >= 0) {
                    apps[existingIndex] = validatedManifest;
                    return [...apps];
                }
                return [...apps, validatedManifest];
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
