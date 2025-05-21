<template>
  <v-container density="compact" fluid>
    <!-- Round Status -->
    <!--          <v-row density="compact">-->
    <!--            <v-col cols="12">-->
    <!--              <round-status-button :round="_round" @reset="emitReset" @update-round="updateLocalRound" />-->
    <!--            </v-col>-->
    <!--          </v-row>-->

    <!-- Leave Days Allowed -->
    <v-row v-if="_round.type !== 'line'" density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" md="4" sm="12">
        <h3>Leave Allowed</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            Indicate number of days that can be selected for this round and whether accumulated leave can be used.
          </span>
        </v-tooltip>
      </v-col>
      <v-col class="d-flex align-center" cols="12" md="8" sm="12">
        <v-text-field
          v-model="_round.bid_limit"
          class="mr-2"
          density="compact"
          label="Days Allowed"
          type="number"
          variant="outlined"
        />
        <v-select
          v-model="_round.bid_limit_unit"
          density="compact"
          :items="bidUnits"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />

    <!-- Holiday Restrictions -->
    <v-row v-if="_round.type !== 'line'" density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
        <h3>Holiday Restrictions</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            Set the number of holidays a BUE can bid in the same round. Default is 99 - or no restriction.
          </span>
        </v-tooltip>
      </v-col>
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="_round.holidays_allowed"
          density="compact"
          label="Holidays Allowed"
          type="number"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />

    <!-- Crew Restrictions -->
    <v-row v-if="_round.type !== 'line'" density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
        <h3>Crew Restrictions</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            Set the number of BUEs from the same crew that can bid the same day. Default is 99 - or no restriction.
          </span>
        </v-tooltip>
      </v-col>
      <v-col cols="12" sm="5">
        <v-text-field
          v-model="_round.crew_limit"
          density="compact"
          label="Crew Members Per Day"
          type="number"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />

    <!-- Require Consecutive Days -->
    <v-row v-if="_round.type !== 'line'" density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
        <h3>Require Consecutive Days</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            When enabled, controllers will bid in increments of five days. Each increment
            complies with the contractual definition of a week (seven consecutive days
            inclusive of RDOs). Any portion of a week constitutes a full week, preventing
            controllers from bidding random days throughout the year.
          </span>
        </v-tooltip>
      </v-col>
      <v-col class="d-flex justify-end align-center" cols="12" sm="5">
        <v-switch
          v-model="_round.require_consecutive_days"
          color="primary"
          density="compact"
          :false-value="0"
          hide-details
          inset
          :true-value="1"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />

    <!-- Teams Bid Concurrently -->
    <v-row density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
        <h3>Teams Bid Concurrently</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            Roster Teams will rotate through the bid independent of each other. Even when enabled only one bidder
            may enter bids at a time for each area.
          </span>
        </v-tooltip>
      </v-col>
      <v-col class="d-flex justify-end align-center" cols="12" sm="5">
        <v-switch
          v-model="_round.teams_bid_concurrently"
          color="primary"
          density="compact"
          :disabled="_round.status !== 'new' || !!_round.bidders_created"
          :false-value="0"
          inset
          :true-value="1"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />

    <!-- Select Bid Roster -->
    <v-row density="compact">
      <v-col class="d-flex align-center align-inputs" cols="12" sm="7">
        <h3>Select Bid Roster</h3>
        <v-tooltip location="top">
          <template #activator="{ props: aProps }">
            <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
          </template>
          <span class="tooltip-wrap">
            The roster is the full list of BUEs who will bid a round. Multiple rosters can be configured but only one can
            be selected for each round.
          </span>
        </v-tooltip>
      </v-col>
      <v-col class="d-flex align-center" cols="12" sm="5">
        <v-select
          v-if="rosters.length"
          v-model="_round.roster_id"
          density="compact"
          :disabled="!rosters"
          item-title="name"
          item-value="id"
          :items="rosters"
          label="Select Roster"
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-divider class="mb-4" />
    <v-row v-if="isEdit">
      <v-col cols="12" sm="6">
        <v-btn
          block
          color="warning"
          :disabled="!_round.bidders_created && _round.status === 'new'"
          prepend-icon="rotate"
          rounded
          @click="emit('reset', _round)"
        >
          Reset {{ _round.name }}
        </v-btn>
      </v-col>
      <v-col cols="12" sm="6">
        <v-btn
          block
          color="error"
          prepend-icon="trash"
          rounded
          @click="emit('delete', _round)"
        >
          Delete {{ _round.name }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script setup>
  /** Imports */
  /** @typedef {import('@/types/index.js').Area} Area */
  import { computed, defineEmits, defineProps } from 'vue';

  /** Setup */
  /**
   * @type {import('vue').DefineProps<{
   *   bidYear: number,
   *   area: Area,
   *   rosters: Roster[],
   *   round: Round,
   *   isEdit?: boolean
   * }>}
   */
  const props = defineProps({
    bidYear: {
      type: Number,
      required: true,
    },
    area: {
      type: Object,
      required: true,
    },
    rosters: {
      type: Array,
      required: true,
    },
    round: {
      type: Object,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['update:area', 'reset', 'delete'])
  const bidUnits = [
    { title: 'Days', value: 'days' },
    { title: 'Hours', value: 'hours' },
  ];

  /** State */

  /** Computed */
  const _round = computed({
    get: () => props.round,
    set: val => emit('update:area', val),
  })

</script>

<style scoped>
.align-inputs {
    padding-bottom: 24px; /* Inputs have a default 22px high div below them (for errors?) */
}
</style>
