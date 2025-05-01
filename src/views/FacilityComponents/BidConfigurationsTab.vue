<template>
  <v-card flat>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-label class="me-2">
              Auto Open/Close Bidding
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="small">mdi-help-circle</v-icon>
                </template>
                <span>
                  Enabling this feature will prevent BUEs from entering bids for themselves (if enabled) while
                  bidding is "closed" for the facility.
                </span>
              </v-tooltip>
            </v-label>
            <v-switch
              v-model="localFacility.auto_open_close"
              color="primary"
              :false-value="0"
              hide-details
              :true-value="1"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-label class="me-2">
              Bid Lock Time
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" size="small">circle-info</v-icon>
                </template>
                <span>
                  Amount of time a bidder can prevent others from bidding. Doesn't skip the bidder if the timer runs out, just
                  unlocks the area for bidding once the timer expires. Used for when a bidder closes the browser and doesn't cancel
                  bid.
                  <!-- TODO: Can we programatically kick the bidder out so we don't need this anymore -->
                </span>
              </v-tooltip>
            </v-label>
            <v-text-field
              v-model="localFacility.bid_lock_time"
              density="comfortable"
              :disabled="!is('super')"
              label="Bid Lock Time"
              variant="outlined"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
</script>
