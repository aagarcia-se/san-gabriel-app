import { AppProviders } from '@/app/providers';
import { AppRoutes } from '@/app/routes';
import { PwaInstallListener } from '@/shared/pwa/PwaInstallListener';
import { InstallBanner } from '@/shared/pwa/InstallBanner';

export default function App() {
  return (
    <AppProviders>
      <PwaInstallListener />
      <InstallBanner />
      <AppRoutes />
    </AppProviders>
  );
}
