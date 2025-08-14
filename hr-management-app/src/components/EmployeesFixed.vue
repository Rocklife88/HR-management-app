<template>
  <!-- Debug Test per Employees originale -->
  <div class="space-y-6">
    <!-- Debug Info -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <h3 class="text-sm font-medium text-blue-800">Employees Component (Simplified)</h3>
      <p class="text-sm text-blue-700">Il componente Employees originale funziona!</p>
      <p class="text-sm text-blue-700">Composables temporaneamente disabilitati per test</p>
    </div>

    <!-- Header -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Dipendenti</h1>
        <p class="mt-2 text-sm text-gray-700">
          Lista completa dei dipendenti con stato e scadenze
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button class="btn-primary">
          Aggiungi Dipendente
        </button>
      </div>
    </div>

    <!-- Simple table placeholder -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <p class="text-gray-600">Tabella dipendenti sarà qui (composables da riabilitare)</p>
        <div class="mt-4">
          <p class="text-sm text-gray-500">
            ✅ Layout funziona<br>
            ✅ Tailwind CSS funziona<br>
            🔄 Prossimo step: riabilitare i composables
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Temporaneamente rimossi tutti i composables per test
// import { useHR } from '../composables/useHR'

onMounted(() => {
  console.log('Employees component mounted successfully (simplified)!')
})
</script>
