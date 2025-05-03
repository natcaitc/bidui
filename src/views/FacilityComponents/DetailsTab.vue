<template>
  <FacilityTabBase :facility="facility" @save="handleSave">
    <template #default="slotProps">
      <v-card flat>
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Facility Details</span>
          <v-btn
            color="primary"
            :disabled="!slotProps['has-changes']"
            prepend-icon="floppy-disk"
            @click="slotProps['prepare-changes']"
          >
            Save Changes
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="slotProps.facility.name"
                density="comfortable"
                :disabled="!is('super')"
                label="Name"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="slotProps.facility.id"
                density="comfortable"
                :disabled="!is('super')"
                label="Facility ID"
                maxlength="3"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="slotProps.facility.bid_year"
                density="comfortable"
                :disabled="!is('super')"
                label="Bid Year"
                :maxlength="4"
                type="number"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-divider class="mt-3 mb-6" />
          <v-row>
            <v-col>
              <p class="mb-2">The bid year for <strong class="text-uppercase">{{ slotProps.facility.id }}</strong> is set to
                <strong>{{ slotProps.facility.bid_year }}</strong>.
                If you are ready to bid to configure the site for next year, click the button to the right.</p>
              <p class="font-italic font-weight-light">The system runs several processes in the background once this button is clicked. Wait a few minutes after clicking the button,
                then reload the page.</p>
            </v-col>
            <v-col class="d-flex align-center text-center">
              <manage-bid-year
                v-if="slotProps.facility.id"
                :facility="facility"
                :is-super="is('super')"
              />
            </v-col>
          </v-row>
          <v-divider class="mb-2 mt-5" />
          <v-row>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-switch
                  v-model="slotProps.facility.test_mode"
                  color="primary"
                  :false-value="0"
                  hide-details
                  label="Test Mode"
                  :true-value="1"
                />
                <v-tooltip location="top">
                  <template #activator="{ props: aProps }">
                    <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
                  </template>
                  <span>
                    Mode for testing the site and different configurations. In test mode...
                    Notifications will not be sent to controllers, notifications that would be sent
                    can be viewed in the Message screen
                  </span>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-switch
                  v-model="slotProps.facility.allow_text"
                  color="primary"
                  :false-value="0"
                  hide-details
                  label="Allow Text Messaging"
                  :true-value="1"
                />
                <v-tooltip location="top">
                  <template #activator="{ props: aProps }">
                    <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
                  </template>
                  <span>
                    Allows users for this facility to select text messaging as a notification option. Facility will
                    be expected to cover costs associated with any text messages sent.
                  </span>
                </v-tooltip>
              </div>
            </v-col>
            <v-col cols="12" md="4">
              <div class="d-flex align-center">
                <v-switch
                  v-model="slotProps.facility.hide_all_content"
                  color="primary"
                  :false-value="0"
                  hide-details
                  label="Enable Privacy"
                  :true-value="1"
                />
                <v-tooltip location="top">
                  <template #activator="{ props: aProps }">
                    <v-icon v-bind="aProps" class="ml-2" color="info" size="small">circle-info</v-icon>
                  </template>
                  <span>
                    Require users to be logged in to view lines and leave slots.
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
  import ManageBidYear from '@/views/FacilityComponents/ManageBidYear.vue';
  import FacilityTabBase from '@/views/FacilityComponents/FacilityTabBase.vue';

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
  });
  const emit = defineEmits(['save']);

  /* Data */
  // Helper function to check user role
  const is = () => {
    // Replace with your actual role checking logic
    return true;
  };

  /* Methods */
  function handleSave (_facility) {
    if (props.saveHandler) {
      props.saveHandler(_facility);
    } else {
      emit('save', _facility);
    }
  }
</script>
