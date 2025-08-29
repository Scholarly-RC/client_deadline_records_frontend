import { 
  TaskStatus, 
  TaskPriority, 
  UserRole, 
  TaxCategory, 
  TaxType, 
  BirForm 
} from './api';
import type { TaskCategory } from '../constants/choices';

export interface User {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  fullname: string;
  role: UserRole;
  is_active: boolean;
  last_login: string | null;
  password?: string; // writeOnly field
  is_admin: boolean;
  has_logs: boolean;
}

export interface UserMini {
  id: number;
  first_name: string;
  last_name: string;
  role: UserRole;
  fullname: string;
  is_admin: boolean;
}

export interface Client {
  id: number;
  client_name: string;
  name?: string; // Legacy field alias for client_name
  email: string | null;
  phone_number: string | null;
  phone?: string; // Legacy field alias for phone_number
  address: string | null;
  birthday: string | null;
  date_of_birth?: string; // Legacy field alias for birthday
  notes: string | null;
  is_active: boolean;
  status?: string; // Legacy field for status
  category?: string; // Legacy field for category
  contact_person?: string; // Legacy field for contact person
  created_at: string;
  updated_at: string;
}

export interface ClientMini {
  id: number;
  client_name: string;
  name?: string; // Alias for client_name
  is_active: boolean;
}

export interface Task {
  id: number;
  client: number;
  client_detail: ClientMini;
  category: TaskCategory;
  description: string;
  status: TaskStatus;
  assigned_to: number;
  assigned_to_detail: User;
  priority: TaskPriority;
  deadline: string;
  remarks: string | null;
  date_complied: string | null;
  completion_date: string | null;
  last_update: string | null;
  period_covered: string | null;
  engagement_date: string | null;
  steps: string | null;
  requirements: string | null;
  type: string | null;
  needed_data: string | null;
  area: string | null;
  tax_category: TaxCategory | null;
  tax_type: TaxType | null;
  form: BirForm | null;
  working_paper: string | null;
  tax_payable: string | null;
  last_followup: string | null;
  category_specific_fields: Record<string, any>;
  current_approval_step: number;
  requires_approval: boolean;
  pending_approver: UserMini;
}

export interface TaskList {
  id: number;
  client_name: string;
  client_detail?: ClientMini; // Optional client detail object
  category: TaskCategory;
  category_display: string;
  category_name?: string;
  description: string;
  status: TaskStatus;
  assigned_to: number;
  assigned_to_name: string;
  priority: TaskPriority;
  engagement_date: string;
  deadline: string;
  completion_date: string;
  last_update: string;
  deadline_days_remaining: number;
  remarks: string | null;
  needed_data?: string | null;
  type_name?: string | null;
  form_name?: string | null;
  period_covered?: string | null;
  tax_payable?: string | null;
  category_specific_fields: Record<string, any>;
  pending_approver: UserMini;
  current_approval_step: number;
  requires_approval: boolean;
  all_approvers: any[];
  status_history?: StatusHistoryEntry[];
  approval_history?: ApprovalHistoryEntry[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  recipient: number;
  related_object_id: number | null;
  action_url: string | null;
}

export interface AppLog {
  id: number;
  user: {
    id: number;
    fullname: string;
  };
  action: string;
  details: string | null;
  timestamp: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// Document interfaces
export interface Document {
  id: number;
  name: string;
  description: string;
  file: string;
  file_url: string;
  file_size: number;
  file_extension: string;
  client: number;
  uploaded_by: UserMini;
  uploaded_at: string;
  updated_at: string;
}

export interface DocumentFormData {
  name: string;
  description: string;
  file: File | null;
  client: number;
}

export interface DocumentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Document[];
}

export interface DocumentDownloadResponse {
  download_url: string;
  filename: string;
  expires_in: number;
}

// Status History interfaces
export interface StatusHistoryEntry {
  id: number;
  task: number;
  old_status: TaskStatus | null;
  old_status_display: string | null;
  new_status: TaskStatus;
  new_status_display: string;
  changed_by: UserMini;
  change_type: string;
  change_type_display: string;
  remarks: string | null;
  created_at: string;
  formatted_date: string;
}

// Approval History interfaces
export interface ApprovalHistoryEntry {
  id: number;
  task: number;
  approver: UserMini;
  action: 'approve' | 'reject';
  action_display?: string; // Display name for action
  remarks: string | null;
  comments?: string; // Alias for remarks
  approval_step: number;
  step_number?: number; // Alias for approval_step
  created_at: string;
  formatted_date: string;
}

// Pagination interface
export interface PaginationInfo {
  count?: number;
  next?: string | null;
  previous?: string | null;
  current_page?: number;
  item_range?: string;
  total_pages?: number;
}

// Form Types
export interface ClientFormData {
  name: string;
  status: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  notes: string;
}

export interface TaskCompletionFormData {
  remarks: string;
  completion_date?: string;
  date_complied?: string;
}

// Chart Data Types
export interface ChartSeriesData {
  name: string;
  data: number[];
  type?: string;
  color?: string;
}

// Client Birthday Data
export interface ClientWithBirthdayInfo extends Client {
  days_remaining?: number;
}

export interface ClientBirthdaysData {
  today: ClientWithBirthdayInfo[];
  upcoming: ClientWithBirthdayInfo[];
  past: ClientWithBirthdayInfo[];
}

// Utility function types
export type GetDaysRemainingFunction = (days: number) => string;

// Dashboard Statistics Types
export interface TaskStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  summary: {
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    overdue: number;
    high_priority: number;
  };
}

export interface ChartData {
  categories: string[];
  series: ChartSeriesData[];
}

export interface DrillContext {
  level?: number;
  parentCategory?: string;
  filters?: Record<string, any>;
}

export interface ChartClickParams {
  seriesName: string;
  name: string;
  value: number | number[];
  dataIndex: number;
  seriesIndex: number;
  componentType: string;
  seriesType: string;
  data: any;
  dataType?: string;
  color: string;
}

export interface GaugeData {
  name: string;
  value: number;
  max?: number;
  min?: number;
  color?: string;
}