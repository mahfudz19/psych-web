export interface PaginationMeta {
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  meta?: PaginationMeta;
  code?: string;
  errors?: FieldError[];
}

export interface AuthResponseData<UserType = unknown> {
  user: UserType;
  token: string;
  expiresIn: number;
}
