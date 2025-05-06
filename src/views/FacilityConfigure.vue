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
          <DetailsTab
            :can="authStore.can('facility:configure:edit', { areaId: null, facilityId: facility.id })"
            :facility="facility"
            :is-super="authStore.is('super')"
            :save-handler="updateFacility"
          />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidTimesTabNew
            :can="authStore.can('facility:configure:edit', { areaId: null, facilityId: facility.id })"
            :facility="facility"
            :save-handler="updateFacility"
          />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <WebhooksTab :areas="areas" :can-edit-area="canAdminArea" :update-area="updateArea" />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <BidConfigurationsTab
            :can="authStore.can('facility:configure:edit', { areaId: null, facilityId: facility.id })"
            :facility="facility"
            :save-handler="updateFacility"
          />
        </v-tabs-window-item>
        <v-tabs-window-item>
          <AreasTab
            :areas="areas"
            :can-edit-area="canAdminArea"
            :can-edit-facility="authStore.can('facility:configure:edit', { areaId: null, facilityId: facility.id })"
            :create-area="createArea"
            :delete-area="deleteArea"
            :is-admin="authStore.isAtLeast('admin')"
            :update-area="updateArea"
          />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card-text>
  </v-card>
</template>

<script setup>
/* Imports */
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia';
  import { useFacilityStore } from '@/stores/facility.js';
  import { useAreaStore } from '@/stores/area.js';
  import { useAuthStore } from '@/stores/auth.js';
  import { useToastStore } from '@/stores/toasts.js';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';
  import DetailsTab from '@/views/FacilityConfigure/Tabs/DetailsTab.vue'
  import BidTimesTabNew from '@/views/FacilityConfigure/Tabs/BidTimesTab.vue'
  import WebhooksTab from '@/views/FacilityConfigure/Tabs/WebhooksTab.vue'
  import BidConfigurationsTab from '@/views/FacilityConfigure/Tabs/BidConfigurationsTab.vue'
  import AreasTab from '@/views/FacilityConfigure/Tabs/AreasTab.vue'

  /* Data */
  const toast = useToastStore();
  const facilityStore = useFacilityStore();
  const areaStore = useAreaStore();
  const authStore = useAuthStore();
  const { facility } = storeToRefs(facilityStore);
  const { areas } = storeToRefs(areaStore);
  const tab = ref(0)

  /* Methods */
  // Handle save from tabs for facility changes
  async function updateFacility (data) {
    try {
      if (!data || !data.id) {
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
      toast.showMessage({
        title: 'Server Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }
  // Handle area updates from tabs
  async function createArea (data) {
    try {
      if (!data) {
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
      toast.showMessage({
        title: 'Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }
  // Handle area updates from tabs
  async function updateArea (data) {
    try {
      if (!data) {
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
      toast.showMessage({
        title: 'Error',
        message: getErrorMessage(e),
        color: 'error',
      });
    }
  }
  // Handle area updates from tabs
  async function deleteArea (data) {
    try {
      if (!data) {
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

  function canAdminArea (item) {
    return authStore.can('area:admin', {
      areaId: item.id,
      facilityId: item.facility_id,
    })
  }
</script>
