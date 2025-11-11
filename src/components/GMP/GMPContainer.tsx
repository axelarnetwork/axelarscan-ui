import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';

import { Container } from '@/components/Container';
import { Response } from '@/components/Response';
import { Spinner } from '@/components/Spinner';

import { GMPMessage } from './GMP.types';
import { gmpContainerStyles } from './GMPContainer.styles';

interface GMPContainerProps extends PropsWithChildren {
  data: GMPMessage | null;
}

export function GMPContainer({ data, children }: GMPContainerProps) {
  return (
    <Container className={gmpContainerStyles.wrapper}>
      <Toaster />
      {!data ? (
        <Spinner />
      ) : data.status === 'errorOnGetData' ? (
        <Response data={data} />
      ) : (
        <div className={gmpContainerStyles.content}>{children}</div>
      )}
    </Container>
  );
}
