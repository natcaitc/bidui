<template>
  <div>
    <!-- eslint-disable vue/attribute-hyphenation -->
    <slot
      :facility="localFacility"
      :hasChanges="hasChanges"
      :prepareChanges="prepareChanges"
    />
  </div>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'

  const props = defineProps({
    facility: {
      type: Object,
      required: true,
    },
  })
  const emit = defineEmits(['save'])

  // Copy the facility from the store for editing
  const localFacility = ref({})
  const originalFacility = ref('')

  // Track if there are unsaved facility changes
  const hasChanges = computed(() => {
    return JSON.stringify(localFacility.value) !== originalFacility.value
  })

  // Stringify and pass the updated facility back
  function prepareChanges () {
    console.log('FacilityTabBase: saveChanges called, emitting save event');
    const _facility = JSON.parse(JSON.stringify(localFacility.value));
    _facility.bid_days = serializeBidDays(localFacility.value.bid_days); // Serialize the bid hours
    emit('save', _facility);
  }

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Deserialize Bid Hours into a format for the UI to process
  function deserializeBidDays (_hours) {
    // Default empty structure
    const defaultDays = weekdays.map(day => ({
      weekday: day,
      open: '',
      close: '',
      closed: false,
    }));

    if (!_hours) {
      return defaultDays;
    }

    try {
      // Try to parse the JSON string
      const parsed = typeof _hours === 'string' ? JSON.parse(_hours) : _hours;

      // If we have a valid array of proper length
      if (Array.isArray(parsed) && parsed.length === 7) {
        return parsed.map((day, idx) => {
          // A day is closed if both open and close are null
          const closed = day.open === null && day.close === null;
          return {
            weekday: weekdays[idx],
            open: day.open || '',
            close: day.close || '',
            closed,
          };
        });
      }
    } catch (e) {
      console.error('Error parsing bid hours:', e);
      // Return default on parse error
    }

    return defaultDays;
  }

  // Serialize Bid Hours for storing in DB
  function serializeBidDays (_hours) {
    if (!_hours || !Array.isArray(_hours)) {
      console.warn('Invalid bid hours format for serialization', _hours);
      return JSON.stringify([]);
    }

    const normalized = _hours.map(day => {
      if (day.closed) {
        return { weekday: day.weekday, open: null, close: null };
      } else {
        return { weekday: day.weekday, open: day.open || '', close: day.close || '' };
      }
    });

    return JSON.stringify(normalized);
  }

  /* Watchers */
  // Watch for changes to facility prop
  watch(() => props.facility, newFacility => {
    if (newFacility) {
      // Create a local copy and deserialize the bid_days
      localFacility.value = JSON.parse(JSON.stringify(newFacility))
      localFacility.value.bid_days = deserializeBidDays(newFacility.bid_days);
      // Store the original facility state for comparison
      originalFacility.value = JSON.stringify(localFacility.value)
    }
  }, { immediate: true, deep: true })
  defineExpose({ hasChanges })
</script>
