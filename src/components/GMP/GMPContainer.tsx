import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

import { Container } from '@/components/Container';
import { Response } from '@/components/Response';
import { Spinner } from '@/components/Spinner';

import { GMPMessage } from './GMP.types';

interface GMPContainerProps extends PropsWithChildren {
  data: GMPMessage | null;
}

export function GMPContainer({ data, children }: GMPContainerProps) {
  return (
    <Container className="sm:mt-8">
      <Toaster />
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className="flex max-w-7xl flex-col gap-y-4">{children}</div>
      )}
    </Container>
  );
}


