<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 mb-4">Dipendenti - Test Semplice</h1>
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
      <p><strong>Successo!</strong> Il componente Employees si sta renderizzando correttamente.</p>
      <p class="mt-2">Questa è una versione semplificata per il debug.</p>
    </div>
    
    <div class="mt-6">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Simple Employees component mounted successfully!')
})
</script>
