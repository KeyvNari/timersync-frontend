// src/utilities/form.ts - Enhanced error handling
import { UseFormReturnType } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export function handleFormErrors(form: UseFormReturnType<any>, errors: unknown) {
  if (!errors || typeof errors !== 'object') {
    return;
  }

  // Handle FastAPI validation errors (from TimerSync backend)
  if ('detail' in errors && Array.isArray(errors.detail)) {
    errors.detail.forEach((error: any) => {
      if (error.type === 'validation_error' && error.loc && error.msg) {
        // Extract field name from location array (e.g., ["body", "username"] -> "username")
        const fieldName = error.loc[error.loc.length - 1];
        if (typeof fieldName === 'string') {
          form.setFieldError(fieldName, error.msg);
        }
      } else if (typeof error === 'string') {
        // Handle string error messages
        notifications.show({ message: error, color: 'red' });
      }
    });
    return;
  }

  // Handle generic error with message
  if ('message' in errors && typeof errors.message === 'string') {
    notifications.show({ 
      title: 'Error',
      message: errors.message, 
      color: 'red' 
    });
    return;
  }

  // Legacy error handling for other error formats
  if ('formErrors' in errors && Array.isArray(errors.formErrors)) {
    errors.formErrors.forEach((error) => {
      notifications.show({ message: error, color: 'red' });
    });
  }

  if ('fieldErrors' in errors && typeof errors.fieldErrors === 'object' && errors.fieldErrors) {
    Object.entries(errors.fieldErrors).forEach(([fieldName, fieldErrors]) => {
      if (Array.isArray(fieldErrors)) {
        form.setFieldError(fieldName, fieldErrors.join(', '));
      } else if (typeof fieldErrors === 'string') {
        form.setFieldError(fieldName, fieldErrors);
      }
    });
  }
}