<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-system-bar color="primary" style="height:40px">
          <span class="text-body-1 font-weight-bold">{{ round.name }} Bidders</span>
          <v-spacer />

          <v-btn
            prepend-icon="clock"
            size="small"
            title="Bid Roster"
            variant="text"
            @click="openBidWindowDialog"
          >
            Configure Bid Windows
          </v-btn>
        </v-system-bar>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <h3>Manage Rounds</h3>
          </v-card-title>

          <v-card-text class="pa-0">
            <round-bidders :round="round" />
            <!--            <v-data-table-->
            <!--                density="compact"-->
            <!--                :headers="headers"-->
            <!--                hide-default-footer-->
            <!--                :items="rounds"-->
            <!--                :items-per-page="10"-->
            <!--                :loading="loading"-->
            <!--                :row-props="getRowClass"-->
            <!--                @click:row="handleRowClick"-->
            <!--            >-->
            <!--            </v-data-table>-->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Bid Window Form -->
  <BidWindowForm ref="bidWindowRef" :round="round" />
</template>

<script setup>
  /** Imports */
  import { useRoundStore } from '@/stores/round.js';
  import RoundBidders from '@/views/round/RoundBidders.vue';
  import BidWindowForm from '@/views/round/BidWindowForm.vue';
  import { ref } from 'vue';

  /** Setup */
  const roundStore = useRoundStore();

  /** State */
  /** @type {import('@/views/round/BidWindowForm.vue')['__VLS_exposed'] & { openDialog: () => void }} */
  const bidWindowRef = ref()

  /** Methods */
  function openBidWindowDialog () {
    bidWindowRef.value?.openDialog()
  }

  /** Computed */
  /** @type {import('vue').ComputedRef<import('@/types').Round>} */
  const round = computed(() => roundStore.round)

</script>
