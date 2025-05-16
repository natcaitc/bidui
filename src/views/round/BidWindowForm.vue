<template>
  <FormDialog
    v-model="showDialog"
    action-label="Create Bid Windows"
    :loading="loading"
    title="Configure Bid Windows"
    @submit="handleSave"
  >
    <v-container>
      <v-row density="compact">
        <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
          <h3>Use Bid Windows</h3>
          <v-tooltip location="top">
            <template #activator="{ props: aProps }">
              <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
            </template>
            <span class="tooltip-wrap">
              Controllers will be required to bid within the pre-determined window. Opens bidding for controller at
              the start of their window, regardless of whether the previous controller has bid.
            </span>
          </v-tooltip>
        </v-col>
        <v-col class="d-flex justify-end align-center" cols="12" sm="5">
          <v-switch
            v-model="_round.use_bid_windows"
            color="primary"
            density="compact"
            :false-value="0"
            inset
            :true-value="1"
          />
        </v-col>
      </v-row>
      <v-divider class="mb-4" />

      <!-- Auto-Close Bid Windows -->
      <v-row v-if="_round.use_bid_windows && _round.type !== 'line'" density="compact">
        <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
          <h3>Auto-Close Bid Windows</h3>
          <v-tooltip location="top">
            <template #activator="{ props: aProps }">
              <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
            </template>
            <span class="tooltip-wrap">
              Controller will not be allowed to bid once their bid window closes.
            </span>
          </v-tooltip>
        </v-col>
        <v-col class="d-flex justify-end align-center" cols="12" sm="5">
          <v-switch
            v-model="_round.close_bid_windows"
            color="primary"
            density="compact"
            :false-value="0"
            inset
            :true-value="1"
          />
        </v-col>
      </v-row>
      <v-divider v-if="_round.use_bid_windows" class="mb-4" />

      <!-- Assign Bid Windows -->
      <v-row v-if="_round.use_bid_windows" density="compact">
        <v-col cols="12">
          <h3>Assign Bid Windows</h3>
          <div class="text-caption mb-2 pl-5">
            Enter the first bid window and the duration of windows to automatically
            create bid windows for the current roster. If bidding has started this
            will create bid windows for any bidder who hasn't already bid.
          </div>
        </v-col>
        <!--        <bid-window-config :round_AI="round_AI" @refresh="emitWindowRefresh"/>-->
      </v-row>
    </v-container>
  </FormDialog>
</template>

<script setup>
  /** Imports */
  import FormDialog from '@/components/FormDialog.vue';
  import { computed, ref } from 'vue';

  /** Setup */
  const props = defineProps({
    round: Object,
  })
  const emit = defineEmits(['update:round']);

  /** State */
  const loading = ref(false)
  const showDialog = ref(false)

  /** Computed */
  const _round = computed({
    get: () => props.round,
    set: val => emit('update:round', val),
  })

  /** Actions */
  const handleSave = async () => {
    // await roundStore.updateRound(r)
  }

  /** Methods */
  function openDialog () {
    showDialog.value = true
  }

  defineExpose({ openDialog })
</script>

<style scoped>
.align-inputs {
    padding-bottom: 24px; /* Inputs have a default 22px high div below them (for errors?) */
}
</style>
