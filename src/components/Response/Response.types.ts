export interface ResponseData {
  code?: number | string;
  message?: string;
}

export interface ResponseProps {
  data: ResponseData;
}
