export interface SwitchProps {
  value: boolean;
  onChange?: (enabled: boolean) => void;
  title?: string;
  groupClassName?: string;
  outerClassName?: string;
  innerClassName?: string;
  labelClassName?: string;
  titleClassName?: string;
}
