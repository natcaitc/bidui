<template>
  <v-container class="d-flex flex-column justify-center align-center fill-height">
    <v-row>
      <v-col cols="12">
        <v-img
          class="mb-4"
          src="@/assets/natca-logo-300.png"
          :width="300"
        />

        <div class="mb-5 text-center">
          <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
          <h1 class="text-h2 font-weight-bold">BID</h1>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        Enter the three-character ID of your facility to continue:
        <v-text-field
          v-model="facilityId"
          append-inner-icon="right"
          class="text-uppercase"
          label="Facility ID"
          maxlength="3"
          @click:append-inner="go"
          @keyup.enter="go"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        If this is your first time using BID, check out our <a href="https://support.natca.org/en/collections/10296694-bid">knowledgebase</a>
        and the <a href="https://natcadcorg.sharepoint.com/:v:/s/ITC/ETR9_n0wi5VDsgMbuwkNk0sBim62tf65mXXAy28bzkT7sw?e=QamSDG">most recent training webinar</a>.
        You can also chat with the ITC using the red messenger icon at the bottom right of this page,
        or by emailing <a href="mailto:support@natca.org">support@natca.org</a>.
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useToastStore } from '@/stores/toasts';
  import { useFacilityStore } from '@/stores/facility.js';

  const facilityStore = useFacilityStore();
  const toast = useToastStore();
  const router = useRouter();
  const facilityId = ref(); // User entered facilityId

  // Go to the facility homepage
  function go () {
    // Check if facility is valid
    if (facilityStore.validateFacilityId(facilityId.value))
      router.push({ name: 'facility.home', params: { facility: facilityId.value } })
    else
      toast.showMessage({
        title: 'Input Error',
        message: `${facilityId.value} is not a valid facility.`,
        color: 'error',
      })
    // FACILITY.get(facilityId.value)
    //   .then(r => {
    //     console.log(r)
    //     if (r.data.id === facilityId.value)
    //       router.push({ name: 'facility.home', params: { facility: facilityId.value } })
    //     else
    //       toast.showMessage({
    //         title: 'Input Error',
    //         message: `${facilityId.value} is not a valid facility.`,
    //         color: 'error',
    //       })
    //   })
    //   .catch(e => {
    //     console.log(e)
    //     toast.showMessage({
    //       title: 'Server Error',
    //       message: getErrorMessage(e),
    //       color: 'error',
    //     })
    //   })
  }

</script>
<style scoped>
:deep(.v-field__input) {
    text-transform: uppercase !important;
}
</style>
