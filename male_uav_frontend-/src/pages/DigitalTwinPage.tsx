import React, { useEffect } from 'react';
import { DigitalTwinProvider } from '../modules/digital-twin/contexts/DigitalTwinContext';
import { TwinLayout } from '../modules/digital-twin/components/TwinLayout';

export const DigitalTwinPage: React.FC = () => {
  useEffect(() => {
    console.log("Digital Twin Mounted");
  }, []);

  return (
    <DigitalTwinProvider>
      <TwinLayout />
    </DigitalTwinProvider>
  );
};
