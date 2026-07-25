import type { Snippet } from "svelte";

export interface AppManifest {
    id: string;
    name: string;
    color: string;
    icon: Snippet | any; // Svelte component or snippet
    badgeStore?: any;
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
        // Assuming path is ../modules/[appId]/manifest.ts
        // And component is ../modules/[appId]/index.svelte
        const componentPath = path.replace("manifest.ts", "index.svelte");
        if (appComponents[componentPath]) {
            componentRegistry[manifest.id] = (appComponents[componentPath] as any).default;
        }
    }
}

export const registeredApps = loadedApps;
export const registeredComponents = componentRegistry;
