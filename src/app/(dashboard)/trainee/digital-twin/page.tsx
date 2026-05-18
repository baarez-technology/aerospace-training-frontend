'use client';

import { Cpu } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageTransition } from '@/components/ui/PageTransition';
import { F16Explorer } from '@/components/three/F16Explorer';

export default function DigitalTwinPage() {
  return (
    <PageTransition>
      <div className="space-y-6 p-6">
        <PageHeader
          title="Digital Twin Explorer"
          subtitle="Interactive F-16 Fighting Falcon — part-level breakdown, exploded view & systems brief"
          icon={Cpu}
        />
        <F16Explorer />
      </div>
    </PageTransition>
  );
}
