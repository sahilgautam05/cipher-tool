import { CipherTool } from '@/components/cipher-tool';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  return (
    <main>
      <CipherTool />
      <Toaster />
    </main>
  );
}
