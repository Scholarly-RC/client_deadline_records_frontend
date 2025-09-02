import { TaskStatus, TaskPriority, UserRole } from './api';
import type { BaseFilters } from './api';
import type { TaskCategory } from '../constants/choices';

// Task-related request types
export interface TaskFilters extends BaseFilters {
  assigned_to?: number;
  category?: TaskCategory;
  category__in?: TaskCategory[];
  client?: number;
  completion_date?: string;
  completion_date__gte?: string;
  completion_date__lte?: string;
  deadline?: string;
  deadline__gte?: string;
  deadline__lte?: string;
  engagement_date?: string;
  engagement_date__gte?: string;
  engagement_date__lte?: string;
  priority?: TaskPriority;
  priority__in?: TaskPriority[];
  status?: TaskStatus;
  status__in?: TaskStatus[];
  requires_approval?: boolean;
  form?: string;
  form__in?: string[];
  tax_category?: string;
  tax_category__in?: string[];
  tax_type?: string;
  tax_type__in?: string[];
}

export interface TaskCreateRequest {
  client: number;
  category: TaskCategory;
  description: string;
  assigned_to: number;
  priority: TaskPriority;
  deadline: string;
  remarks?: string;
  period_covered?: string;
  engagement_date?: string;
  steps?: string;
  requirements?: string;
  type?: string;
  needed_data?: string;
  area?: string;
  tax_category?: string;
  tax_type?: string;
  form?: string;
  working_paper?: string;
  tax_payable?: string;
  last_followup?: string;
}

export interface TaskUpdateRequest extends Partial<TaskCreateRequest> {
  status?: TaskStatus;
  date_complied?: string;
  completion_date?: string;
}

export interface TaskCompletionRequest {
  completion_date: string;
  date_complied: string;
  remarks?: string;
}

export interface ApprovalRequest {
  approvers: number[];
}

export interface ApprovalActionRequest {
  action: 'approve' | 'reject';
  remarks?: string;
}

// User-related request types
export interface UserCreateRequest {
  first_name: string;
  middle_name: string;
  last_name: string;
  username: string;
  email: string;
  role: UserRole;
  password: string;
  is_active?: boolean;
}

export interface UserUpdateRequest extends Partial<Omit<UserCreateRequest, 'password'>> {
  password?: string;
}

export interface UserFilters extends BaseFilters {
  role?: UserRole;
  is_active?: boolean;
}

// Client-related request types
export interface ClientCreateRequest {
  client_name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  birthday?: string;
  notes?: string;
  is_active?: boolean;
}

export interface ClientUpdateRequest extends Partial<ClientCreateRequest> {}

export interface ClientFilters extends BaseFilters {
  is_active?: boolean;
}

// Authentication request types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

// Notification request types
export interface NotificationFilters extends BaseFilters {
  is_read?: boolean;
  recipient?: number;
}

export interface NotificationCreateRequest {
  title: string;
  message: string;
  notification_type: string;
  recipient: number;
  related_object_id?: number;
  action_url?: string;
}

// App Log request types
export interface AppLogFilters extends BaseFilters {
  user?: number;
}