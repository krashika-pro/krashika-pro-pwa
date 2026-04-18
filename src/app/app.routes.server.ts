import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Catch-all: server-render lazy-loaded feature routes on demand.
    // Add explicit path entries above this for routes that can be prerendered.
    path: '**',
    renderMode: RenderMode.Server,
  },
];
