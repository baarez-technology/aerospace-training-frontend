// The app's auth guard redirects unauthenticated users to "/", so the root
// route IS the login screen. Re-export the canonical login page so there is
// a single source of truth (this file used to be a stale duplicate).
export { default } from './login/page';
