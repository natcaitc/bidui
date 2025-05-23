<template>
  <FacilityTabBase :facility="facility" @save="handleSave">
    <template #default="slotProps">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Bid Configurations</span>
          <v-btn
            color="primary"
            :disabled="!slotProps.hasChanges "
            prepend-icon="floppy-disk"
            @click="slotProps.prepareChanges"
          >
            Save Changes
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-switch
                  v-model="slotProps.facility.auto_open_close"
                  color="primary"
                  :disabled="!can"
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
                  v-model="slotProps.facility.bid_lock_time"
                  density="comfortable"
                  :disabled="!can"
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
                    <!-- TODO: Can we programmatically kick the bidder out so we don't need this anymore -->
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
  /* Imports */
  import FacilityTabBase from '@/views/FacilityConfigure/Tabs/FacilityTabBase.vue';

  /* Setup */
  const props = defineProps({
    facility: {
      type: Object,
      required: true,
    },
    saveHandler: {
      type: Function,
      default: null,
    },
    can: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['save']);

  /* Data */
  // Helper function to check user role
  const is = () => {
    // Replace with your actual role checking logic
    return true;
  };

  function handleSave (_facility) {
    if (props.saveHandler) {
      props.saveHandler(_facility);
    } else {
      emit('save', _facility);
    }
  }
</script>
