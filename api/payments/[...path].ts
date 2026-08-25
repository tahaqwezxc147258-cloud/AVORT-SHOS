// Keep payment callbacks on an explicit Vercel function route.  Some Vercel
// deployments do not pass nested payment paths through the root catch-all.
import app from '../../server/src/index.js';

export default app;
