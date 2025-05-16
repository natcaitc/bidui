<template>
  <div>
    <!-- Slot for the edit icon from parent component -->
    <div @click="dialog = true">
      <slot />
    </div>

    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title class="primary-lighten-1">
          <span class="text-h5">Edit {{ _round.name }}</span>
          <v-spacer />
          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-container density="compact" fluid>
            <!-- Round Status -->
            <v-row density="compact">
              <v-col cols="12">
                <round-status-button :round="_round" @reset="emitReset" @update-round="updateLocalRound" />
              </v-col>
            </v-row>

            <!-- Roster Selection -->
            <!--            <v-row density="compact" v-if="_round.status === 'new' && !_round.bidders_created">-->
            <!--              <v-col cols="12" sm="7">-->
            <!--                <v-subheader class="pl-0 font-weight-bold">Select Roster</v-subheader>-->
            <!--                <div class="text-caption mb-2">-->
            <!--                  One roster can be used for multiple rounds, or define a new roster for each round_AI.-->
            <!--                  <router-link :to="{ name: 'Roster', params: { area: areaSlug, facility: facilityId }}">-->
            <!--                    Manage Rosters-->
            <!--                  </router-link>-->
            <!--                </div>-->
            <!--              </v-col>-->
            <!--              <v-col cols="12" sm="5">-->
            <!--                <v-select-->
            <!--                  v-model="_round.roster_id"-->
            <!--                  :items="rosters"-->
            <!--                  item-value="id"-->
            <!--                  item-title="name"-->
            <!--                  density="compact"-->
            <!--                  variant="outlined"-->
            <!--                  @update:model-value="updateLocalRound({ roster_id: _round.roster_id })"-->
            <!--                ></v-select>-->
            <!--              </v-col>-->
            <!--            </v-row>-->

            <!-- Leave Days Allowed -->
            <v-row v-if="_round.type !== 'line'" density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Leave Days Allowed</v-subheader>-->
                <div class="text-caption mb-2">
                  Indicate number of days that can be selected for this round and whether accumulated leave can be used.
                </div>
              </v-col>
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="_round.allowed_days"
                  density="compact"
                  :disabled="_round.status !== 'new' && !isAdmin"
                  label="Days Allowed"
                  type="number"
                  variant="outlined"
                  @update:model-value="updateLocalRound({ allowed_days: _round.allowed_days })"
                />
                <v-select
                  v-model="_round.leave_type"
                  density="compact"
                  :disabled="_round.status !== 'new' && !isAdmin"
                  :items="leaveTypes"
                  variant="outlined"
                  @update:model-value="updateLocalRound({ leave_type: _round.leave_type })"
                />
              </v-col>
            </v-row>

            <!-- Restrictions -->
            <v-row v-if="_round.type !== 'line'" density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Restrictions</v-subheader>-->
                <div class="text-caption mb-2">
                  Set the number of holidays allowed for this round and the number of controllers allowed off per crew per day.
                </div>
              </v-col>
              <v-col cols="12" sm="5">
                <v-text-field
                  v-model="_round.holidays_allowed"
                  density="compact"
                  :disabled="_round.status !== 'new' && !isAdmin"
                  label="Holidays Allowed"
                  type="number"
                  variant="outlined"
                  @update:model-value="updateLocalRound({ holidays_allowed: _round.holidays_allowed })"
                />
                <v-text-field
                  v-model="_round.crew_limit"
                  density="compact"
                  :disabled="_round.status !== 'new' && !isAdmin"
                  label="Crew Members Per Day"
                  type="number"
                  variant="outlined"
                  @update:model-value="updateLocalRound({ crew_limit: _round.crew_limit })"
                />
              </v-col>
            </v-row>

            <!-- Require Consecutive Days -->
            <v-row v-if="_round.type !== 'line'" density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Require Consecutive Days</v-subheader>-->
                <div class="text-caption mb-2">
                  When enabled controllers will bid in increments of five days. Each increment
                  complies with the contractual definition of a week (Seven consecutive days
                  inclusive of RDOs). Any portion of a week constitutes a full week, preventing
                  controllers from bidding random days throughout the year. Current area configuration
                  will allow all or part of <span class="text-success font-weight-bold">{{ weeksAllowed }} week(s)</span>.
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <v-switch
                  v-model="_round.require_consecutive_days"
                  density="compact"
                  :false-value="0"
                  :true-value="1"
                  @update:model-value="updateLocalRound({ require_consecutive_days: _round.require_consecutive_days })"
                />
              </v-col>
            </v-row>

            <!-- Use Bid Windows -->
            <v-row density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Use Bid Windows</v-subheader>-->
                <div class="text-caption mb-2">
                  Controllers will be required to bid within the pre-determined window. Opens bidding for controller at the start of their window, regardless of whether the previous controller has bid.
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <v-switch
                  v-if="_round.status === 'new'"
                  v-model="_round.use_bid_windows"
                  density="compact"
                  :false-value="0"
                  :true-value="1"
                  @update:model-value="updateLocalRound({ use_bid_windows: _round.use_bid_windows })"
                />
                <div v-else>
                  <v-icon v-if="_round.use_bid_windows" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else color="error">mdi-close-circle</v-icon>
                </div>
              </v-col>
            </v-row>

            <!-- Auto-Close Bid Windows -->
            <v-row v-if="_round.use_bid_windows && _round.type !== 'line'" density="compact">
              <v-col class="pl-6" cols="12" sm="7">
                <!--                <v-subheader class="pl-3 font-weight-bold">-->
                <!--                  <v-icon class="mr-2" size="small">mdi-circle-small</v-icon>-->
                <!--                  Auto-Close Bid Windows-->
                <!--                </v-subheader>-->
                <div class="text-caption mb-2 pl-5">
                  Controller will not be allowed to bid once their bid window closes.
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <v-switch
                  v-model="_round.close_bid_windows"
                  density="compact"
                  :false-value="0"
                  :true-value="1"
                  @update:model-value="updateLocalRound({ close_bid_windows: _round.close_bid_windows })"
                />
              </v-col>
            </v-row>

            <!-- Assign Bid Windows -->
            <v-row v-if="_round.use_bid_windows" density="compact">
              <v-col class="pl-6" cols="12" sm="7">
                <!--                <v-subheader class="pl-3 font-weight-bold">-->
                <!--                  <v-icon class="mr-2" size="small">mdi-circle-small</v-icon>-->
                <!--                  Assign Bid Windows-->
                <!--                </v-subheader>-->
                <div class="text-caption mb-2 pl-5">
                  Enter the first bid window and the duration of windows to automatically
                  create bid windows for the current roster. If bidding has started this
                  will create bid windows for any bidder who hasn't already bid.
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <!--                <bid-window-config :round_AI="_round" @refresh="emitWindowRefresh" />-->
              </v-col>
            </v-row>

            <!-- Teams Bid Concurrently -->
            <v-row density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Teams Bid Concurrently</v-subheader>-->
                <div class="text-caption mb-2">
                  When turned on teams will start bidding at the same time.
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <v-switch
                  v-if="_round.status === 'new' && !_round.bidders_created"
                  v-model="_round.teams_bid_concurrently"
                  density="compact"
                  :false-value="0"
                  :true-value="1"
                  @update:model-value="updateLocalRound({ teams_bid_concurrently: _round.teams_bid_concurrently })"
                />
                <div v-else>
                  <v-icon v-if="_round.teams_bid_concurrently" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else color="error">mdi-close-circle</v-icon>
                </div>
              </v-col>
            </v-row>

            <!-- Delete Round -->
            <v-row v-if="canDeleteRound" density="compact">
              <v-col cols="12" sm="7">
                <!--                <v-subheader class="pl-0 font-weight-bold">Delete {{ _round.name }}</v-subheader>-->
                <div class="text-caption mb-2">
                  Permanently removes this round and any recorded bids. Use caution!
                </div>
              </v-col>
              <v-col class="d-flex justify-end align-center" cols="12" sm="5">
                <v-btn
                  color="error"
                  rounded
                  size="small"
                  @click="emitDelete"
                >
                  <v-icon class="mr-1" size="small">mdi-delete</v-icon>
                  Delete {{ _round.name }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="text" @click="dialog = false">
            Close
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="floppy-disk"
            @click="emit('update-round_AI', _round)"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import RoundStatusButton from './RoundStatusButton.vue';
  import BidWindowConfig from '@/views/round_AI/BidWindowConfig.vue';

  // Props
  const props = defineProps({
    round: {
      type: Object,
      required: true,
    },
    // rosters: {
    //   type: Array,
    //   default: () => []
    // },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    areaSlug: {
      type: String,
      default: '',
    },
    facilityId: {
      type: [String, Number],
      default: '',
    },
  });

  // Emits
  const emit = defineEmits(['update-round_AI', 'reset', 'delete-round_AI', 'window-refresh']);

  // Reactive state
  const dialog = ref(false);
  const _round = ref({});
  const leaveTypes = [
    { title: 'Accrued Only', value: 'accrued' },
    { title: 'Accrued or Accumulated', value: 'accumulated' },
  ];

  // Computed properties
  const canDeleteRound = computed(() => props.canDelete);
  const weeksAllowed = computed(() => Math.ceil(_round.value.allowed_days / 5));

  // Watch for changes to the round_AI prop
  watch(() => props.round, newVal => {
    _round.value = JSON.parse(JSON.stringify(newVal));
  }, { immediate: true, deep: true });

  // Methods
  function updateLocalRound (changes) {
    // Update local round_AI data
    if (changes) {
      Object.keys(changes).forEach(key => {
        _round.value[key] = changes[key];
      });
    }

    // Emit changes to parent component
    emit('update-round_AI', changes || _round.value);
  }

  function emitReset () {
    emit('reset');
  }

  function emitDelete () {
    emit('delete-round_AI', _round.value);
    dialog.value = false;
  }

  function emitWindowRefresh (round) {
    emit('window-refresh', round);
  }
</script>

<style scoped>
</style>
