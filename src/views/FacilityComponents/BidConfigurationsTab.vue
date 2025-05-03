<template>
  <FacilityTabBase :facility="facility" @save="handleSave">
    <template #default="{ facility: _facility, hasChanges, prepareChanges }">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Bid Configurations</span>
          <v-btn
            color="primary"
            :disabled="!hasChanges"
            prepend-icon="floppy-disk"
            @click="prepareChanges"
          >
            Save Changes
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-switch
                  v-model="_facility.auto_open_close"
                  color="primary"
                  :false-value="0"
                  hide-details
                  label="Auto Open/Close Bidding"
                  :true-value="1"
                />
                <v-tooltip location="top">
                  <template #activator="{ props: ttProps }">
                    <v-icon v-bind="ttProps" class="ml-2" color="primary" size="small">info-circle</v-icon>
                  </template>
                  <span>
                    Enabling this feature will prevent BUEs from entering bids for themselves (if enabled) while
                    bidding is "closed" for the facility.
                  </span>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-text-field
                  v-model="_facility.bid_lock_time"
                  density="comfortable"
                  :disabled="!is('super')"
                  label="Bid Lock Time"
                  variant="outlined"
                />
                <v-tooltip location="top">
                  <template #activator="{ props: ttProps }">
                    <v-icon v-bind="ttProps" class="ml-2" color="primary" size="small">circle-info</v-icon>
                  </template>
                  <span>
                    Amount of time a bidder can prevent others from bidding. Doesn't skip the bidder if the timer runs out, just
                    unlocks the area for bidding once the timer expires. Used for when a bidder closes the browser and doesn't cancel
                    bid.
                    <!-- TODO: Can we programatically kick the bidder out so we don't need this anymore -->
                  </span>
                </v-tooltip>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </template>
  </FacilityTabBase>
</template>

<script setup>
  import FacilityTabBase from '@/views/FacilityComponents/FacilityTabBase.vue';

  const props = defineProps({
    facility: {
      type: Object,
      required: true,
    },
    saveHandler: {
      type: Function,
      default: null,
    },
  });

  const emit = defineEmits(['save']);

  function handleSave (_facility) {
    if (props.saveHandler) {
      props.saveHandler(_facility);
    } else {
      emit('save', _facility);
    }
  }

  // Helper function to check user role
  const is = role => {
    // Replace with your actual role checking logic
    return true;
  };
</script>
