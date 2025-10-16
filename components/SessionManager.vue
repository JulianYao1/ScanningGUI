<template>
  <div class="session-manager">
    <div class="session-header">
      <h2>Scanning Sessions</h2>
      <button
        @click="createNewSession"
        class="btn-new-session"
        title="Create new scanning session"
      >
        + New Session
      </button>
    </div>

    <div v-if="sessions.length === 0" class="empty-state">
      <p>No active sessions. Create a new session to start scanning.</p>
    </div>

    <div v-else class="session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{
          active: session.id === currentSessionId,
          paused: session.status === 'paused',
          completed: session.status === 'completed'
        }"
        @click="handleSessionClick(session.id)"
      >
        <div class="session-info">
          <div class="session-title">
            <span class="status-indicator" :class="session.status"></span>
            <strong>{{ session.boxNumber }}</strong>
            <span class="box-style">{{ session.boxStyle }}</span>
          </div>

          <div class="session-meta">
            <span class="product-count">
              {{ session.products.length }}
              {{ session.products.length === 1 ? 'product' : 'products' }}
            </span>
            <span class="total-quantity">
              ({{ totalQuantity(session) }} items)
            </span>
          </div>

          <div class="session-timestamp">
            Updated: {{ formatTimestamp(session.updatedAt) }}
          </div>
        </div>

        <div class="session-actions" @click.stop>
          <button
            v-if="session.status !== 'completed'"
            @click="deleteSession(session.id)"
            class="btn-delete"
            title="Delete session"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScanningSession } from '~/types/scanning'

interface Props {
  sessions: ScanningSession[]
  currentSessionId: string | null
}

interface Emits {
  (e: 'switch-session', sessionId: string): void
  (e: 'delete-session', sessionId: string): void
  (e: 'create-session'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSessionClick = (sessionId: string) => {
  if (sessionId !== props.currentSessionId) {
    emit('switch-session', sessionId)
  }
}

const createNewSession = () => {
  emit('create-session')
}

const deleteSession = (sessionId: string) => {
  if (confirm('Are you sure you want to delete this session?')) {
    emit('delete-session', sessionId)
  }
}

const totalQuantity = (session: ScanningSession): number => {
  return session.products.reduce((sum, product) => sum + product.quantity, 0)
}

const formatTimestamp = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
</script>

<style scoped>
.session-manager {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.session-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.btn-new-session {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-new-session:hover {
  background: #0056b3;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 2px solid #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.session-item:hover {
  border-color: #007bff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.session-item.active {
  border-color: #28a745;
  background: #f0fff4;
}

.session-item.paused {
  opacity: 0.7;
}

.session-item.completed {
  border-color: #6c757d;
  background: #f5f5f5;
  cursor: default;
}

.session-item.completed:hover {
  border-color: #6c757d;
  box-shadow: none;
}

.session-info {
  flex: 1;
}

.session-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.active {
  background: #28a745;
  box-shadow: 0 0 4px #28a745;
}

.status-indicator.paused {
  background: #ffc107;
}

.status-indicator.completed {
  background: #6c757d;
}

.box-style {
  color: #6c757d;
  font-size: 0.875rem;
}

.session-meta {
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 0.25rem;
}

.total-quantity {
  color: #6c757d;
  margin-left: 0.25rem;
}

.session-timestamp {
  font-size: 0.75rem;
  color: #6c757d;
}

.session-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #c82333;
}
</style>
