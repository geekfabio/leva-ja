import ToastMessage from 'react-native-toast-message';

type ToastInput = string | { title: string; message?: string };

function normalize(input: ToastInput) {
  return typeof input === 'string' ? { title: input, message: undefined } : input;
}

export const toast = {
  success: (input: ToastInput) => {
    const { title, message } = normalize(input);
    ToastMessage.show({ type: 'success', text1: title, text2: message });
  },
  error: (input: ToastInput) => {
    const { title, message } = normalize(input);
    ToastMessage.show({ type: 'error', text1: title, text2: message });
  },
  info: (input: ToastInput) => {
    const { title, message } = normalize(input);
    ToastMessage.show({ type: 'info', text1: title, text2: message });
  },
};
