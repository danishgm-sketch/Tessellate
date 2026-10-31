import { z } from 'zod';

// Set this before browser schema modules instantiate their object schemas. Zod
// caches its JIT setting when each schema is created, so configuring it in the
// barrel after re-export evaluation is too late for strict-CSP browser builds.
// Keep JIT validation available in server and build processes, where CSP does
// not prohibit the capability probe.
if (typeof window !== 'undefined') {
  z.config({ jitless: true });
}
