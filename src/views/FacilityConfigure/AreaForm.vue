<template>
  <v-form @submit.prevent>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="modelValue.name"
          label="Area Name"
          variant="outlined"
        />
      </v-col>
      <v-col cols="2">
        <v-text-field
          v-model="modelValue.tag"
          label="Tag"
          maxlength="3"
          variant="outlined"
        />
      </v-col>
      <v-col cols="4">
        <v-text-field
          v-model="modelValue.slug"
          :disabled="isEdit"
          label="Slug"
          :placeholder="isEdit ? '' : 'Auto-generated from name if left empty'"
          variant="outlined"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-row>
      <v-col cols="6">
        <div class="d-flex align-center">
          <v-switch
            v-model="modelValue.use_bid_aid"
            color="primary"
            :false-value="0"
            hide-details
            label="Require Bidders to Enter Bids"
            :true-value="1"
          />
          <v-tooltip location="top">
            <template #activator="{ props: ttProps }">
              <v-icon
                class="ml-2"
                color="primary"
                v-bind="ttProps"
                icon="circle-info"
                size="small"
              />
            </template>
            <span>When enabled controllers cannot enter their own bids</span>
          </v-tooltip>
        </div>
      </v-col>
      <v-col cols="6">
        <div class="d-flex align-center">
          <v-switch
            v-model="modelValue.subtract_holiday_leave"
            color="primary"
            :false-value="0"
            hide-details
            label="Subtract Holiday Leave"
            :true-value="1"
          />
          <v-tooltip location="top">
            <template #activator="{ props: ttProps }">
              <v-icon
                class="ml-2"
                color="primary"
                v-bind="ttProps"
                icon="circle-info"
                size="small"
              />
            </template>
            <span>Holidays bid will be subtracted from the controller's leave balance. Holidays are ALWAYS counted as a slot bid.</span>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <!-- Admin-only fields -->
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="modelValue.grace_hours"
          label="Grace Hours For Bidding Leave Slot"
          maxlength="1"
          type="number"
          variant="outlined"
        >
          <template #append>
            <v-tooltip location="top">
              <template #activator="{ props: ttProps }">
                <v-icon
                  v-bind="ttProps"
                  color="primary"
                  icon="circle-info"
                  size="small"
                />
              </template>
              <span>Extra hours available for controllers to bid leave slot. Accounts for situations where a controller only needs X hours to bid an additional slot.</span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="modelValue.accrual_slot_factor"
          label="Accrual Slot Calculation Factor"
          maxlength="1"
          type="number"
          variant="outlined"
        >
          <template #append>
            <v-tooltip location="top">
              <template #activator="{ props: ttProps }">
                <v-icon
                  v-bind="ttProps"
                  color="primary"
                  icon="circle-info"
                  size="small"
                />
              </template>
              <span>Used to convert Accrual Hours for an area into Accrual Slots Available. Default is an 8-hour shift</span>
            </v-tooltip>
          </template>
        </v-text-field>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    modelValue: {
      type: Object,
      required: true,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue']);
</script>
