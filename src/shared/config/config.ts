import { env } from '@/shared/config/env';

const envUp = import.meta.env.VITE_ENV || 'DEV';

const enviroment = env[env];

export {enviroment};