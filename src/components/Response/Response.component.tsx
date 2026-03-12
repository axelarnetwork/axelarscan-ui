import { responseStyles } from './Response.styles';
import type { ResponseProps } from './Response.types';

export function Response({ data }: ResponseProps) {
  const { code, message } = { ...data };

  return (
    <div className={responseStyles.root}>
      <span className={responseStyles.code}>{code}</span>
      <span className={responseStyles.message}>{message}</span>
    </div>
  );
}
