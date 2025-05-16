<template>
  <v-card flat>
    <v-card-title>
      <span>Webhook Configuration</span>
    </v-card-title>
    <v-card-text>
      <v-data-table
        class="elevation-1"
        :headers="headers"
        hide-default-footer
        :items="areas"
      >
        <template #item.name="{ item }">
          {{ item.name }} <span class="text-caption text-medium-emphasis">({{ item.slug }})</span>
        </template>
        <template #item.slack_webhook="{ item }">
          <v-icon
            :class="{
              'cursor-pointer': canEdit(item),
              'cursor-not-allowed opacity-50 pointer-events-none': !canEdit(item)
            }"
            :color="item.slack_webhook ? 'primary' : 'grey'"
            icon="fa-brands fa-slack"
            @click="handleOpenForm(item, 'slack')"
          />
        </template>
        <template #item.discord_channel_id="{ item }">
          <v-icon
            class="cursor-pointer"
            :class="{
              'cursor-pointer': canEdit(item),
              'cursor-not-allowed opacity-50 pointer-events-none': !canEdit(item)
            }"
            :color="item.discord_channel_id ? 'primary' : 'grey'"
            icon="fa-brands fa-discord"
            @click="handleOpenForm(item, 'discord')"
          />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <!-- Edit Dialog -->
  <FormDialog
    v-model="showDialog"
    :form-data="formData"
    :loading="loading"
    :title="editOption === 'discord' ? 'Edit Discord Webhook' : 'Edit Slack Webhook'"
    @submit="handleSave"
  >
    <template #default="slotProps">
      <!-- @type {import('@/types').Area} data -->
      <v-text-field
        v-if="editOption === 'slack'"
        v-model="slotProps.data.slack_webhook"
        label="Slack Webhook URL"
        variant="outlined"
      />
      <v-text-field
        v-if="editOption === 'slack'"
        v-model="slotProps.data.slack_channel"
        label="Slack Channel"
        variant="outlined"
      />
      <v-text-field
        v-if="editOption === 'discord'"
        v-model="slotProps.data.discord_channel_id"
        label="Discord Channel ID"
        variant="outlined"
      />
    </template>
  </FormDialog>

  <!--
    <v-dialog v-model="displaySlackDialog" max-width="500">
      <v-card>
        <v-card-title>Slack Configuration</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="_area.slack_webhook"
            label="Slack Webhook URL"
            variant="outlined"
          />
          <v-text-field
            v-model="_area.slack_channel"
            label="Slack Channel"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="displaySlackDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="saveWebhookSettings"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
-->
  <!--
  <v-dialog v-model="displayDiscordDialog" max-width="500">
    <v-card>
      <v-card-title>Discord Configuration</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="_area.discord_channel_id"
          label="Discord Channel ID"
          variant="outlined"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="displayDiscordDialog = false">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveWebhookSettings"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  -->
</template>

<script setup>
  /* Imports */
  /** @typedef {import('@/types/index').Area} Area */
  import { ref, watch } from 'vue';
  import FormDialog from '@/components/FormDialog.vue';
  import { AreaRepository } from '@/api/index.js';
  import { useCrud } from '@/composables/useCrud.js';
  import { useAreaStore } from '@/stores/area.js';
  import { storeToRefs } from 'pinia';

  /* Setup */
  const props = defineProps({
    updateArea: {
      type: Function,
      default: null,
    },
    canEdit: {
      type: Function,
      default: () => false,
    },
  });
  const areaStore = useAreaStore();
  const { areas } = storeToRefs(areaStore);
  const AREA = new AreaRepository()
  const {
    loading,
    formData,
    showDialog,
    openEdit,
    save,
  } = useCrud(AREA)

  /** Data */
  const _areas = ref([]); // Local copy of areas list
  // /** @type {ref<Area>} */
  // const _area = ref({}); // Local copy of area being edited
  const headers = [
    { title: 'Area Name', value: 'name' },
    { title: 'Slack', value: 'slack_webhook', align: 'center' },
    { title: 'Discord', value: 'discord_channel_id', align: 'center' },
  ]; // Table headers
  const editOption = ref(null);

  /** Actions */
  const handleSave = async () => {
    await save(r => {
      // Find and update the area in the store
      areaStore.updateArea(r)
    })
  }

  /* Methods */
  function handleOpenForm (area, option) {
    // Check if the user can do this
    if (!props.canEdit(area)) return

    // Open with the appropriate option
    editOption.value = option
    openEdit(area)
  }
  // Open the dialog for the given brand and clone a local copy of the  area for editing
  // function openDialog (brand, area) {
  //   _area.value = JSON.parse(JSON.stringify(area));
  //   if (brand === 'slack') {
  //     displaySlackDialog.value = true;
  //   } else if (brand === 'discord') {
  //     displayDiscordDialog.value = true;
  //   }
  // }
  // // Save the webhook settings for the area being edited
  // function saveWebhookSettings () {
  //   if (props.updateArea) {
  //     props.updateArea(_area.value);
  //   } else {
  //     emit('save', _area.value);
  //   }
  //   displaySlackDialog.value = false;
  //   displayDiscordDialog.value = false;
  //   _area.value = {};
  // }

  /* Watchers */
  // Watch for changes to the areas list and update the local copy
  watch(() => areas, newAreas => {
    if (newAreas) {
      _areas.value = JSON.parse(JSON.stringify(newAreas))
    }
  }, { immediate: true, deep: true })
</script>
