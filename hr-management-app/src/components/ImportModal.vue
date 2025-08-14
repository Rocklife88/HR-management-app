<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancel')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="w-full">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Importa Dati JSON
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Seleziona file JSON
                  </label>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".json"
                    @change="handleFileSelect"
                    class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>

                <div class="text-xs text-gray-500">
                  <p><strong>Formato JSON atteso:</strong></p>
                  <pre class="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">{{
`{
  "employees": [...],
  "teams": [...],
  "meetings": [...]
}`
                  }}</pre>
                </div>

                <div v-if="jsonData" class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Anteprima dati
                  </label>
                  <div class="p-3 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                    <div v-if="jsonData.employees">
                      <strong>Dipendenti:</strong> {{ jsonData.employees.length }} elementi
                    </div>
                    <div v-if="jsonData.teams">
                      <strong>Team:</strong> {{ jsonData.teams.length }} elementi
                    </div>
                    <div v-if="jsonData.meetings">
                      <strong>Meeting:</strong> {{ jsonData.meetings.length }} elementi
                    </div>
                  </div>
                </div>

                <div v-if="error" class="text-red-600 text-sm">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleImport"
            :disabled="!jsonData"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
          >
            Importa
          </button>
          <button
            type="button"
            @click="$emit('cancel')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['import', 'cancel'])

const fileInput = ref(null)
const jsonData = ref(null)
const error = ref('')

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) {
    jsonData.value = null
    error.value = ''
    return
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    error.value = 'Seleziona un file JSON valido'
    jsonData.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      jsonData.value = data
      error.value = ''
    } catch (err) {
      error.value = 'File JSON non valido: ' + err.message
      jsonData.value = null
    }
  }
  reader.readAsText(file)
}

const handleImport = () => {
  if (jsonData.value) {
    emit('import', jsonData.value)
  }
}
</script>
