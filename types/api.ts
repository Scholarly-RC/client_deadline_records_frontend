export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// Enums based on schema.yml
export enum TaskCategory {
  COMPLIANCE = 'compliance',
  FINANCIAL_STATEMENT = 'financial_statement',
  ACCOUNTING_AUDIT = 'accounting_audit',
  FINANCE_IMPLEMENTATION = 'finance_implementation',
  HR_IMPLEMENTATION = 'hr_implementation',
  MISCELLANEOUS = 'miscellaneous',
  TAX_CASE = 'tax_case'
}

export enum TaskStatus {
  COMPLETED = 'completed',
  FOR_REVISION = 'for_revision',
  FOR_CHECKING = 'for_checking',
  ON_GOING = 'on_going',
  PENDING = 'pending',
  PENDING_APPROVAL = 'pending_approval',
  NOT_YET_STARTED = 'not_yet_started',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff'
}

export enum TaxCategory {
  OTE = 'OTE',
  RP = 'RP'
}

export enum TaxType {
  PT = 'PT',
  IT = 'IT',
  WE = 'WE'
}

export enum BirForm {
  FORM_2551Q = '2551Q',
  FORM_1701 = '1701',
  FORM_0619E = '0619E',
  FORM_1601EQ = '1601EQ'
}

// Base filter interface for API queries
export interface BaseFilters {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}