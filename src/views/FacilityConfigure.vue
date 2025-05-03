<template>
  <v-card class="ma-5 elevation-3">
    <v-tabs
      v-model="tab"
      bg-color="light-blue-lighten-4"
      grow
      show-arrows
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
          <DetailsTab :facility="facility" :save-handler="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidTimesTabNew :facility="facility" :save-handler="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <WebhooksTab :areas="areas" :update-area="updateArea" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidConfigurationsTab :facility="facility" :save-handler="updateFacility" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <AreasTab :areas="areas" :create-area="createArea" :delete-area="deleteArea" :update-area="updateArea" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia';
  import { useFacilityStore } from '@/stores/facility.js';
  import { useAreaStore } from '@/stores/area.js';
  import { useToastStore } from '@/stores/toasts';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';
  import DetailsTab from './FacilityComponents/DetailsTab.vue'
  import BidTimesTabNew from './FacilityComponents/BidTimesTab.vue'
  import WebhooksTab from './FacilityComponents/WebhooksTab.vue'
  import BidConfigurationsTab from './FacilityComponents/BidConfigurationsTab.vue'
  import AreasTab from './FacilityComponents/AreasTab.vue'


  const toast = useToastStore();
  const facilityStore = useFacilityStore();
  const areaStore = useAreaStore();
  const { facility } = storeToRefs(facilityStore);
  const { areas } = storeToRefs(areaStore);

  const tab = ref(0)

  // Handle save from tabs for facility changes
  async function updateFacility (data) {
    console.log('[FacilityConfigure] updateFacility called with:', data);

    try {
      if (!data || !data.id) {
        console.error('[FacilityConfigure] Invalid facility data provided:', data);
        toast.showMessage({
          title: 'Error',
          message: 'Invalid facility data',
          color: 'error',
        });
        return;
      }

      // Save to API via store
      await facilityStore.updateFacility(data.id, data);

      toast.showMessage({
        title: 'Success',
        message: 'Facility details saved successfully.',
        color: 'success',
      });
    } catch (e) {
      console.error('[FacilityConfigure] Error saving facility details:', e);
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }

  // Handle area updates from tabs
  async function createArea (data) {
    console.log('FacilityConfigure createArea called with:', data);

    try {
      if (!data) {
        console.error('Invalid area data provided:', data);
        return;
      }

      // Update the area store with the updated areas
      await areaStore.createArea(data);

      toast.showMessage({
        title: 'Success',
        message: 'Area created successfully.',
        color: 'success',
      });
    } catch (e) {
      console.error('Error creating area in store:', e);
      toast.showMessage({
        title: 'Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }

  // Handle area updates from tabs
  async function updateArea (data) {
    console.log('FacilityConfigure updateArea called with:', data);

    try {
      if (!data) {
        console.error('Invalid area data provided:', data);
        return;
      }

      // Update the area store with the updated areas
      await areaStore.updateArea(data.id, data);

      toast.showMessage({
        title: 'Success',
        message: 'Area changes saved successfully.',
        color: 'success',
      });
    } catch (e) {
      console.error('Error updating area in store:', e);
      toast.showMessage({
        title: 'Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }

  // Handle area updates from tabs
  async function deleteArea (data) {
    console.log('FacilityConfigure deleteArea called with:', data);

    try {
      if (!data) {
        console.error('Invalid area data provided:', data);
        return;
      }

      // Update the area store with the updated areas
      await areaStore.deleteArea(data.id);

      toast.showMessage({
        title: 'Success',
        message: 'Area deleted successfully.',
        color: 'success',
      });
    } catch (e) {
      console.error('Error deleting the area from the store:', e);
      toast.showMessage({
        title: 'Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }
</script>
