export class PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
}
