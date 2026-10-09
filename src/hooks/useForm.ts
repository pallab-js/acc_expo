import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
}

interface UseFormOptions<T> {
  initialData: T;
  validate?: (data: T) => Partial<Record<keyof T, string>>;
  onSubmit: (data: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useForm<T extends Record<string, unknown>>({
  initialData,
  validate,
  onSubmit,
  onSuccess,
  onError,
}: UseFormOptions<T>) {
  const [state, setState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    isSubmitting: false,
  });

  const setField = useCallback((field: keyof T, value: unknown) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  const setFields = useCallback((fields: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...fields },
      errors: { ...prev.errors, ...Object.keys(fields).reduce((acc, k) => ({ ...acc, [k]: undefined }), {}) },
    }));
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: message },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (validate) {
      const errors = validate(state.data);
      if (Object.keys(errors).length > 0) {
        setState((prev) => ({ ...prev, errors }));
        return;
      }
    }

    setState((prev) => ({ ...prev, isSubmitting: true, errors: {} }));
    try {
      await onSubmit(state.data);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      onError?.(error instanceof Error ? error : new Error(message));
      Alert.alert('Error', message);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [state.data, validate, onSubmit, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({ data: initialData, errors: {}, isSubmitting: false });
  }, [initialData]);

  return {
    ...state,
    setField,
    setFields,
    setError,
    handleSubmit,
    reset,
  };
}

export interface ConfirmDeleteOptions {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirmDelete({ title, message, onConfirm, confirmText = 'Delete', cancelText = 'Cancel' }: ConfirmDeleteOptions) {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  const handleConfirm = async () => {
    close();
    try {
      await onConfirm();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete');
    }
  };

  return {
    visible,
    open,
    close,
    handleConfirm,
    confirmText,
    cancelText,
    title,
    message,
  };
}