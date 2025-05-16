<template>
  <div>
    <v-btn
      :color="getActionColor()"
      @click="showDialog = true"
    >
      {{ getActionText() }}
    </v-btn>

    <v-dialog v-model="showDialog" max-width="500">
      <v-card>
        <v-card-title>{{ getDialogTitle() }}</v-card-title>
        <v-card-text>
          <p>{{ getDialogMessage() }}</p>

          <v-alert
            v-if="showWarning()"
            class="mt-3"
            density="compact"
            type="warning"
          >
            This action cannot be undone.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="gray" text @click="showDialog = false">Cancel</v-btn>
          <v-btn :color="getActionColor()" :loading="loading" text @click="updateStatus">
            {{ getActionText() }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useRoundStore } from '@/stores/round.js'

  const props = defineProps({
    round: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['status-updated'])

  // State
  const showDialog = ref(false)
  const loading = ref(false)
  const roundStore = useRoundStore()

  // Computed & Methods
  const getNextStatus = () => {
    const status = props.round.status

    const statusFlow = {
      'draft': 'active',
      'active': 'complete',
      'complete': 'draft',
      'cancelled': 'draft',
    }

    return statusFlow[status] || 'draft'
  }

  const getActionText = () => {
    const nextStatus = getNextStatus()

    const actionText = {
      'active': 'Activate Round',
      'complete': 'Complete Round',
      'draft': 'Reopen as Draft',
      'cancelled': 'Reopen as Draft',
    }

    return actionText[nextStatus] || 'Change Status'
  }

  const getDialogTitle = () => {
    const nextStatus = getNextStatus()

    const titles = {
      'active': 'Activate Round',
      'complete': 'Complete Round',
      'draft': 'Reopen Round',
      'cancelled': 'Reopen Round',
    }

    return titles[nextStatus] || 'Update Round Status'
  }

  const getDialogMessage = () => {
    const nextStatus = getNextStatus()

    const messages = {
      'active': 'Are you sure you want to activate this round_AI? Bidders will be able to place bids according to their scheduled windows.',
      'complete': 'Are you sure you want to mark this round_AI as complete? This will end all active bidding.',
      'draft': 'Are you sure you want to reopen this round_AI as a draft? You will need to reconfigure bid windows and other settings.',
      'cancelled': 'Are you sure you want to reopen this round_AI as a draft? You will need to reconfigure bid windows and other settings.',
    }

    return messages[nextStatus] || 'Are you sure you want to change the status of this round_AI?'
  }

  const getActionColor = () => {
    const nextStatus = getNextStatus()

    const colors = {
      'active': 'success',
      'complete': 'info',
      'draft': 'primary',
      'cancelled': 'primary',
    }

    return colors[nextStatus] || 'primary'
  }

  const showWarning = () => {
    const nextStatus = getNextStatus()
    return ['complete', 'draft'].includes(nextStatus)
  }

  const updateStatus = async () => {
    try {
      loading.value = true
      const nextStatus = getNextStatus()

      await roundStore.updateRoundStatus(props.round.id, nextStatus)

      showDialog.value = false
      emit('status-updated')
    } catch (error) {
      console.error('Failed to update round_AI status:', error)
    } finally {
      loading.value = false
    }
  }
</script>
