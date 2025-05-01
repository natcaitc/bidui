<template>
  <v-card class="ma-5 elevation-3">
    <v-tabs
      v-model="tab"
      bg-color="light-blue-lighten-4"
      slider-color="primary"
    >
      <v-tab prepend-icon="building" value="details">
        Details
      </v-tab>
      <v-tab prepend-icon="calendar-clock">
        Bid Times
      </v-tab>
      <v-tab prepend-icon="webhook">
        Webhooks
      </v-tab>
      <v-tab prepend-icon="sliders">
        Bid Configurations
      </v-tab>
      <v-tab prepend-icon="layer-group">
        Areas
      </v-tab>
    </v-tabs>

    <v-card-text>
      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="details">
          <DetailsTab :facility="facility" @save="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidTimesTab :facility="facility" @save="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <WebhooksTab :facility="facility" @save="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidConfigurationsTab :facility="facility" @save="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <AreasTab :facility="facility" @save="updateFacility" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia';
  import { useFacilitiesStore } from '@/stores/facilities.js';
  import { FacilityRepository } from '@/api/';
  import DetailsTab from './FacilityComponents/DetailsTab.vue'
  import BidTimesTab from './FacilityComponents/BidTimesTab.vue'
  import WebhooksTab from './FacilityComponents/WebhooksTab.vue'
  import BidConfigurationsTab from './FacilityComponents/BidConfigurationsTab.vue'
  import AreasTab from './FacilityComponents/AreasTab.vue'
  import { useToastStore } from '@/stores/toasts';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';

  const toast = useToastStore();
  const tab = ref(0)
  const facilityStore = useFacilitiesStore();
  const { facility } = storeToRefs(facilityStore);
  const FACILITY = new FacilityRepository();

  // Handle save from Details tab
  async function updateFacility (data) {
    try {
      // Save to API
      await FACILITY.update(data.id, data);

      // Update store with new data
      // facilityStore.updateFacility(data);

      // Show success message
      toast.showMessage({
        title: 'Success',
        message: 'Facility details saved successfully.',
        color: 'success',
      })
    } catch (error) {
      console.error('Error saving facility details:', error);
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      })
    }
  }

  // async function saveAreas (updatedData) {
  //   try {
  //     await facilityRepo.update(facility.value.id, updatedData);
  //
  //     // Update store
  //     const updatedFacility = { ...facility.value, ...updatedData };
  //     facilityStore.updateFacility(updatedFacility);
  //
  //     showSnackbar('Areas saved successfully', 'success');
  //   } catch (error) {
  //     console.error('Error saving areas:', error);
  //     showSnackbar('Error saving areas', 'error');
  //   }
  // }
</script>
