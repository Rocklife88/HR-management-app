<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('cancel')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {{ company ? 'Modifica Azienda' : 'Nuova Azienda' }}
                </h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Nome Azienda *</label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      placeholder="es. Move Solutions"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Ragione Sociale *</label>
                    <input
                      v-model="form.fullName"
                      type="text"
                      required
                      placeholder="es. Move Solutions S.r.l."
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Sede</label>
                    <textarea
                      v-model="form.location"
                      rows="2"
                      placeholder="es. Via Roma 123, 20100 Milano (MI)"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Codice Fiscale</label>
                      <input
                        v-model="form.taxCode"
                        type="text"
                        placeholder="es. 12345678901"
                        maxlength="16"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Partita IVA</label>
                      <input
                        v-model="form.vatNumber"
                        type="text"
                        placeholder="es. IT12345678901"
                        maxlength="13"
                        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Email Aziendale</label>
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="es. info@movesolutions.it"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Telefono</label>
                    <input
                      v-model="form.phone"
                      type="tel"
                      placeholder="es. +39 02 1234567"
                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ company ? 'Aggiorna' : 'Crea Azienda' }}
            </button>
            <button
              type="button"
              @click="$emit('cancel')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annulla
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  company: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

// Form data
const form = reactive({
  name: '',
  fullName: '',
  location: '',
  taxCode: '',
  vatNumber: '',
  email: '',
  phone: ''
})

// Watch for company prop changes
watch(() => props.company, (company) => {
  if (company) {
    Object.keys(form).forEach(key => {
      if (company[key] !== undefined) {
        form[key] = company[key]
      }
    })
  } else {
    // Reset form for new company
    Object.keys(form).forEach(key => {
      form[key] = ''
    })
  }
}, { immediate: true })

const handleSubmit = () => {
  const companyData = {
    name: form.name,
    description: form.fullName, // Usiamo fullName come description
    industry: '', // Campo vuoto per ora
    location: form.location
  }
  emit('save', companyData)
}
</script>
