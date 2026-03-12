export interface DateRangePickerProps {
  params?: { fromTime?: number | string; toTime?: number | string };
  format?: string;
  onChange: (value: {
    fromTime: number | undefined;
    toTime: number | undefined;
  }) => void;
  className?: string;
}
