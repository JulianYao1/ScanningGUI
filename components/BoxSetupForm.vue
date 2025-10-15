<template>
  <div class="box-setup-form">
    <h2>Start New Scanning Session</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="box-number">Box Number</label>
        <input
          id="box-number"
          v-model="boxNumber"
          type="text"
          data-testid="box-number"
          placeholder="Enter box number"
          required
          :disabled="disabled"
        />
      </div>

      <div class="form-group">
        <label for="box-style">Box Style</label>
        <select
          id="box-style"
          v-model="boxStyle"
          data-testid="box-style"
          required
          :disabled="disabled"
        >
          <option value="">Select box style</option>
          <option value="Envelope">Envelope</option>
          <option value="Small Box">Small Box</option>
          <option value="Medium Box">Medium Box</option>
          <option value="Large Box">Large Box</option>
          <option value="Flat Rate">Flat Rate</option>
          <option value="Tube">Tube</option>
        </select>
      </div>

      <button
        type="submit"
        data-testid="start-session"
        :disabled="disabled || !boxNumber || !boxStyle"
      >
        Start Session
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { BoxStyle } from '~/types/scanning'

interface Props {
  disabled?: boolean
}

interface Emits {
  (e: 'start-session', boxNumber: string, boxStyle: BoxStyle): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const boxNumber = ref('')
const boxStyle = ref<BoxStyle | ''>('')

const handleSubmit = () => {
  if (!boxNumber.value || !boxStyle.value) return

  emit('start-session', boxNumber.value, boxStyle.value as BoxStyle)

  // Reset form
  boxNumber.value = ''
  boxStyle.value = ''
}
</script>

<style scoped>
.box-setup-form {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  max-width: 500px;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus,
select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

input:disabled,
select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

button {
  width: 100%;
  padding: 0.875rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
