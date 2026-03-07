import dynamic from 'next/dynamic';
import React, { type ReactNode } from 'react';

const NonSSRWrapper = (props: { children: ReactNode }) => (
  <React.Fragment>{props.children}</React.Fragment>
);

export default dynamic(() => Promise.resolve(NonSSRWrapper), { ssr: false });
