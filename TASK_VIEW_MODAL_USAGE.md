# TaskViewModal - Improved Layout Design

The TaskViewModal has been enhanced with a proper layout structure while maintaining a minimalist design approach. It fetches fresh data from the API endpoint every time it opens.

## Layout Structure

### Header Section
- **Task Title**: Prominent display with larger typography
- **Status & Priority Badges**: Clear visual indicators
- **Deadline Information**: Right-aligned with status indicator
- **Client & Assignment**: Organized in a clean grid below

### Main Content
- **Task Details**: Left column with category, remarks, and core information
- **Information Sidebar**: Right column with timestamps and metadata
- **Category-Specific Fields**: Full-width section for detailed task data
- **Approval History**: Accordion-style for detailed approval tracking
- **Status History**: Timeline view with enhanced readability

## Design Principles

✅ **Minimalist Approach**: Clean typography, proper spacing, no decorative elements  
✅ **Clear Hierarchy**: Logical information organization with proper headings  
✅ **Responsive Layout**: Adapts well to different screen sizes  
✅ **Readable Content**: Better spacing and typography for long-form content  
✅ **Functional Focus**: Emphasizes content over visual decoration

## New API-First Approach

### Props
- `modelValue`: Boolean - Controls modal open/close state
- `taskId`: Number - The task ID to fetch data for

### Usage Example

```vue
<template>
  <div>
    <!-- Trigger button -->
    <UButton @click="openTaskModal(taskId)">
      View Task Details
    </UButton>

    <!-- Task View Modal -->
    <TaskViewModal 
      v-model="showTaskModal" 
      :task-id="selectedTaskId" 
    />
  </div>
</template>

<script setup lang="ts">
const showTaskModal = ref(false);
const selectedTaskId = ref<number | null>(null);

const openTaskModal = (taskId: number) => {
  selectedTaskId.value = taskId;
  showTaskModal.value = true;
};
</script>
```

## Benefits

1. **Always Fresh Data**: Fetches the latest task information from `/api/tasks/{id}/` every time the modal opens
2. **Type Safety**: No more type casting issues - uses proper API response structure
3. **Simplified Props**: Only requires `taskId` instead of complex task object
4. **Better Performance**: Eliminates prop drilling and stale data issues
5. **Consistent Structure**: Uses the comprehensive API response with detailed fields like:
   - `assigned_to_detail.fullname`
   - `client_detail.name`  
   - `category_specific_fields`
   - `current_approval_step`
   - `requires_approval`

## API Response Structure

The component now works with the complete API response that includes:

```typescript
{
  id: number;
  client_detail: { id: number; name: string };
  assigned_to_detail: {
    id: number;
    fullname: string;
    role: string;
    // ... other user fields
  };
  category_specific_fields: Record<string, any>;
  current_approval_step: number;
  requires_approval: boolean;
  // ... all other task fields
}
```

This ensures the modal always displays accurate, up-to-date information without relying on potentially stale prop data.