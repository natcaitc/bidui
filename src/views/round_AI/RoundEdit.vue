<template>
  <v-container fluid>
    <v-card>
      <v-card-title>
        {{ isNewRound ? 'Create Round' : 'Edit Round' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="form" v-model="valid" @submit.prevent="saveRound">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="roundData.name"
                label="Round Name"
                required
                :rules="[v => !!v || 'Round name is required']"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="roundData.area_id"
                item-title="name"
                item-value="id"
                :items="areaOptions"
                label="Area"
                required
                :rules="[v => !!v || 'Area is required']"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="roundData.start_date"
                label="Start Date"
                required
                :rules="[v => !!v || 'Start date is required']"
                type="date"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="roundData.end_date"
                label="End Date"
                required
                :rules="[
                  v => !!v || 'End date is required',
                  v => !roundData.start_date || new Date(v) >= new Date(roundData.start_date) || 'End date must be after start date'
                ]"
                type="date"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="roundData.description"
                label="Description"
                rows="3"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          :to="`/${facilityId}/rounds${roundId ? '/' + roundId : ''}`"
          variant="text"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :disabled="!valid"
          :loading="loading"
          @click="saveRound"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useRoundStore } from '@/stores/round'
  import { useAreaStore } from '@/stores/area'
  import { useFacilityStore } from '@/stores/facility'

  const route = useRoute()
  const router = useRouter()
  const roundStore = useRoundStore()
  const areaStore = useAreaStore()
  const facilityStore = useFacilityStore()

  // State
  const form = ref(null)
  const valid = ref(false)
  const loading = computed(() => roundStore.loading)

  const roundData = reactive({
    id: null,
    name: '',
    area_id: null,
    start_date: '',
    end_date: '',
    description: '',
    status: 'draft',
  })

  // Computed
  const roundId = computed(() => route.params.roundId)
  const facilityId = computed(() => route.params.facility)
  const isNewRound = computed(() => roundId.value === 'new' || !roundId.value)
  const areaOptions = computed(() => areaStore.areas || [])

  // Methods
  const loadRound = async () => {
    if (isNewRound.value) return

    try {
      const round = await roundStore.fetchRound(roundId.value)
      if (round) {
        Object.assign(roundData, round)

        // Format dates to YYYY-MM-DD for input fields
        if (roundData.start_date) {
          roundData.start_date = new Date(roundData.start_date).toISOString().split('T')[0]
        }
        if (roundData.end_date) {
          roundData.end_date = new Date(roundData.end_date).toISOString().split('T')[0]
        }
      }
    } catch (error) {
      console.error('Failed to load round:', error)
    }
  }

  const saveRound = async () => {
    if (!valid.value) {
      form.value?.validate()
      return
    }

    try {
      const payload = { ...roundData }

      // Add facility ID
      payload.facility_id = facilityStore.facility.id

      // If creating new round, remove ID
      if (isNewRound.value) {
        delete payload.id
      }

      const savedRound = await roundStore.saveRound(payload)


      // Redirect to round view
      router.push(`/${facilityId.value}/rounds/${savedRound.id}`)
    } catch (error) {
      console.error('Failed to save round_AI:', error)
    }
  }

  // Lifecycle
  onMounted(async () => {
    // Load areas for the select dropdown
    if (areaStore.areas.length === 0) {
      await areaStore.fetchAreas()
    }

    // Load round_AI data if editing
    await loadRound()
  })
</script>
