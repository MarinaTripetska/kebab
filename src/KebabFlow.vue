<script setup>
import { useKebabFlow } from "./useKebabFlow.js";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxj60IiCF33iG9zP33ItPkoFzwvC1sS7OTby8ciGqyc7SFkIrEGAkAogBxz6u_VtFSi/exec";

const {
  user,
  nameInput,
  startTime,
  elapsedTime,
  finalDuration,
  isFinished,
  isLoading,
  login,
  markStart,
  markEnd,
  resetApp,
} = useKebabFlow(GOOGLE_SCRIPT_URL);
</script>

<style scoped>
.loader-overlay {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}
</style>

<template>
  <div class="flex-1 flex flex-col max-w-md mx-auto w-full bg-white shadow-xl h-full relative">

    <!-- Pasek górny -->
    <header class="bg-green-700 text-white p-4 flex justify-between items-center z-10 shadow-md">
      <div class="font-bold text-lg tracking-wider flex items-center gap-2">
        <span>📊</span> Flow w IT
      </div>
      <div v-if="user" class="text-xs bg-green-800 px-2 py-1 rounded text-green-100 border border-green-600">
        {{ user.name }}
      </div>
    </header>

    <!-- Loader -->
    <div v-if="isLoading" class="absolute inset-0 z-50 loader-overlay flex flex-col items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      <p class="mt-4 text-green-800 font-bold text-sm animate-pulse">Synchronizacja z Arkuszem...</p>
    </div>

    <!-- Main -->
    <main class="flex-1 relative flex flex-col p-6 overflow-y-auto">

      <!-- EKRAN 1: Logowanie -->
      <div v-if="!user" class="flex-1 flex flex-col justify-center items-center space-y-8 fade-in">
        <div class="text-center space-y-2">
          <h1 class="text-3xl font-bold text-gray-800">Ćwiczenie terenowe</h1>
          <p class="text-gray-500">Aby rozpocząć wpisz nazwisko - żeby nie było duplikatów.</p>
        </div>

        <div class="w-full space-y-4">
          <input
            v-model="nameInput"
            @keyup.enter="login"
            type="text"
            placeholder="Twoje nazwisko"
            class="w-full text-center text-xl p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          >
          <button
            @click="login"
            :disabled="!nameInput.trim()"
            class="w-full bg-green-600 text-white font-bold text-xl p-4 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            DOŁĄCZ
          </button>
        </div>

        <div class="text-[10px] text-gray-400 mt-4 text-center px-4">
          Backend: Google Sheets.<br>Twoje dane trafią bezpośrednio do arkusza.
        </div>
      </div>

      <!-- EKRAN 2: Proces -->
      <div v-else-if="!isFinished" class="flex-1 flex flex-col justify-center space-y-6">

        <!-- Start -->
        <div v-if="!startTime" class="flex-1 flex flex-col justify-center">
          <div class="text-center mb-8">
            <p class="text-lg text-gray-600">Jesteś w kolejce</p>
            <div class="text-5xl mt-2">🚶</div>
          </div>

          <button
            @click="markStart"
            class="w-full aspect-square max-h-80 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all mx-auto"
          >
            <span class="text-6xl">📝</span>
            <span class="text-2xl font-bold uppercase tracking-widest">Zamówione!</span>
            <span class="text-xs opacity-75">Kliknij gdy już zamówisz</span>
          </button>

          <button @click="resetApp" class="text-blue-400 text-sm underline mt-4">
            Zresetuj (Nowy pomiar)
          </button>
        </div>

        <!-- WIP -->
        <div v-else class="flex-1 flex flex-col justify-center">
          <div class="text-center mb-8 animate-pulse-slow">
            <p class="text-lg text-orange-600 font-semibold">Work In Progress</p>
            <div class="text-4xl font-mono mt-2 text-gray-800">{{ elapsedTime }}</div>
            <p class="text-xs text-gray-400 mt-1">Czas oczekiwania</p>
          </div>

          <button
            @click="markEnd"
            class="w-full aspect-square max-h-80 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all mx-auto ring-4 ring-green-200"
          >
            <span class="text-6xl">🥘</span>
            <span class="text-2xl font-bold uppercase tracking-widest">Odebrane!</span>
            <span class="text-xs opacity-75">Kliknij gdy dostaniesz jedzenie</span>
          </button>

          <button @click="resetApp" class="text-blue-400 text-sm underline mt-4">
            Zresetuj (Nowy pomiar)
          </button>
        </div>
      </div>

      <!-- EKRAN 3: Finish -->
      <div v-else class="flex-1 flex flex-col justify-center items-center text-center space-y-6">
        <div class="text-6xl animate-bounce">😋</div>
        <h2 class="text-3xl font-bold text-gray-800">Smacznego!</h2>

        <div class="bg-gray-50 p-6 rounded-xl w-full border border-gray-100 shadow-sm space-y-4">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wider">Twój Cycle Time</p>
            <p class="text-4xl font-mono font-bold text-blue-600">{{ finalDuration }}</p>
          </div>
        </div>

        <p class="text-sm text-gray-400">Dane zostały zapisane w Google Sheets.</p>

        <button @click="resetApp" class="text-blue-400 text-sm underline mt-4">
          Zresetuj (Nowy pomiar)
        </button>
      </div>

    </main>
  </div>
</template>
