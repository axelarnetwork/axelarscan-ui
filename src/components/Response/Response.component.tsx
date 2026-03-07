import { responseStyles } from './Response.styles';
import type { ResponseData } from './Response.types';

export function Response({ data }: { data: ResponseData }) {
  const { code, message } = { ...data };

  return (
    <div className={responseStyles.root}>
      <span className={responseStyles.code}>{code}</span>
      <span className={responseStyles.message}>{message}</span>
    </div>
  );
}
