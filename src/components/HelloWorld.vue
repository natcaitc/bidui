<template>
  <v-container class="fill-height" max-width="900">
    <div>
      <v-img
        class="mb-4"
        height="150"
        src="@/assets/logo.png"
      />

      <div class="mb-8 text-center">
        <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
        <h1 class="text-h2 font-weight-bold">Vuetify</h1>
      </div>

    </div>
  </v-container>
</template>

<script setup>
  /*import { ref } from 'vue';
  import { facilities } from '@/stores/facilities.js';
  const store = facilities();
  const facilityId = store.facilityId;
  const data = ref();
  import { AreaRepository, AuthRepository } from '@/api'
  const authRepo = new AuthRepository();
  authRepo.getScope(17,'dab').then(r => {
    data.value = r.data;
  })

  const areaRepo = new AreaRepository(facilityId);
  console.log('hi')

  console.log(facilityId);
  const test = areaRepo.fetchAreas('dab').then(response => {
    data.value = response.data;
  })
    .catch(error => console.error('API Error:', error));

  console.log('bye')*/
</script>
