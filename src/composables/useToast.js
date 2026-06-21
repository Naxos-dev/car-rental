import { reactive } from "vue";

const toasts = reactive([]);
let nextId = 0;

export function useToast() {
  function show(message, type = "success", duration = 3500) {
    const id = ++nextId;
    toasts.push({ id, message, type });
    setTimeout(() => {
      const idx = toasts.findIndex((t) => t.id === id);
      if (idx !== -1) toasts.splice(idx, 1);
    }, duration);
  }

  function dismiss(id) {
    const idx = toasts.findIndex((t) => t.id === id);
    if (idx !== -1) toasts.splice(idx, 1);
  }

  return { toasts, show, dismiss };
}
