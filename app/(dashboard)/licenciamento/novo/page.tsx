'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LicensingForm } from '../licensing-form';

function NewLicensing() {
  // Permite abrir já com o veículo escolhido: /licenciamento/novo?vehicleId=...
  const vehicleId = useSearchParams().get('vehicleId') ?? undefined;
  return <LicensingForm presetVehicleId={vehicleId} />;
}

export default function NewLicensingPage() {
  return (
    <Suspense fallback={null}>
      <NewLicensing />
    </Suspense>
  );
}
