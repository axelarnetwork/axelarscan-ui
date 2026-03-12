export interface ButtonProps {
  variant?: 'solid' | 'outline';
  color?: string;
  circle?: string;
  href?: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: unknown;
}
