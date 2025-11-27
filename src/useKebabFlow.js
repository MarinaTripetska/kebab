import { ref, computed, onMounted, onUnmounted } from "vue";

export function useKebabFlow(GOOGLE_SCRIPT_URL) {
  const user = ref(null);
  const nameInput = ref("");
  const startTime = ref(null);
  const endTime = ref(null);
  const now = ref(Date.now());
  const isLoading = ref(false);

  let timerInterval = null;

  const isFinished = computed(() => startTime.value && endTime.value);

  const elapsedTime = computed(() => {
    if (!startTime.value) return "00:00";
    const end = endTime.value || now.value;
    const diff = Math.floor((end - startTime.value) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  });

  const calculateDuration = (start, end) => {
    if (!start || !end) return "";
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.floor((e - s) / 1000);
    const mm = Math.floor(diff / 60).toString().padStart(2, "0");
    const ss = (diff % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const finalDuration = computed(() => {
    if (!startTime.value || !endTime.value) return "--";
    return calculateDuration(startTime.value, endTime.value);
  });

  // --- API z Google Sheets ---
  const sendToSheet = async (payload) => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("TU_WKLEJ")) {
      alert("Brak URL do Google Script");
      return;
    }
    isLoading.value = true;

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.error("Błąd wysyłania", e);
      alert("Błąd zapisu");
    } finally {
      isLoading.value = false;
    }
  };

  // --- Local storage ---
  const saveLocal = () => {
    const data = {
      name: user.value?.name,
      startTime: startTime.value,
      endTime: endTime.value
    };
    localStorage.setItem("kebab_user_sheet", JSON.stringify(data));
  };

  // --- Actions ---
  const login = () => {
    if (!nameInput.value.trim()) return;
    user.value = { name: nameInput.value.trim() };
    saveLocal();
  };

  const markStart = async () => {
    startTime.value = Date.now();
    saveLocal();
    await sendToSheet({
      name: user.value.name,
      startTime: startTime.value,
      action: "start"
    });
  };

  const markEnd = async () => {
    endTime.value = Date.now();
    saveLocal();
    await sendToSheet({
      name: user.value.name,
      endTime: endTime.value,
      action: "end"
    });
  };

  const resetApp = () => {
    if (confirm("Czy na pewno?")) {
      localStorage.removeItem("kebab_user_sheet");
      location.reload();
    }
  };

  // --- Lifecycle ---
  onMounted(() => {
    timerInterval = setInterval(() => (now.value = Date.now()), 1000);

    const saved = localStorage.getItem("kebab_user_sheet");
    if (saved) {
      const parsed = JSON.parse(saved);
      user.value = { name: parsed.name };
      startTime.value = parsed.startTime;
      endTime.value = parsed.endTime;
    }
  });

  onUnmounted(() => clearInterval(timerInterval));

  return {
    user,
    nameInput,
    startTime,
    endTime,
    elapsedTime,
    finalDuration,
    isFinished,
    isLoading,
    login,
    markStart,
    markEnd,
    resetApp
  };
}
