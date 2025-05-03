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
        :items="_areas"
      >
        <template #item.name="{ item }">
          {{ item.name }} <span class="text-caption text-medium-emphasis">({{ item.slug }})</span>
        </template>
        <template #item.slack_webhook="{ item, index }">
          <v-icon
            class="cursor-pointer"
            :color="item.slack_webhook ? 'primary' : 'grey'"
            icon="fa-brands fa-slack"
            @click="openDialog('slack', item)"
          />
        </template>
        <template #item.discord_channel_id="{ item, index }">
          <v-icon
            class="cursor-pointer"
            :color="item.discord_channel_id ? 'primary' : 'grey'"
            icon="fa-brands fa-discord"
            @click="openDialog('discord', item)"
          />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>

  <v-dialog v-model="slackDialog" max-width="500">
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
        <v-btn text @click="slackDialog = false">Cancel</v-btn>
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

  <v-dialog v-model="discordDialog" max-width="500">
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
        <v-btn text @click="discordDialog = false">Cancel</v-btn>
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
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { getErrorMessage } from '@/utils/getErrorMessage.js';

  const props = defineProps({
    areas: {
      type: Array,
      default: () => [],
    },
    updateArea: {
      type: Function,
      default: null,
    },
  });
  const emit = defineEmits(['save', 'area-update']);
  const _areas = ref([]);
  const _area = ref({});
  const headers = [
    { title: 'Area Name', value: 'name' },
    { title: 'Slack', value: 'slack_webhook', align: 'center' },
    { title: 'Discord', value: 'discord_channel_id', align: 'center' },
  ];

  const selectedArea = ref(null);
  const selectedAreaIndex = ref(-1);
  const slackDialog = ref(false);
  const discordDialog = ref(false);
  const currentUpdateAreaFn = ref(null);
  const saving = ref(false);

  function openDialog (brand, area) {
    _area.value = JSON.parse(JSON.stringify(area));
    if (brand === 'slack') {
      slackDialog.value = true;
    } else if (brand === 'discord') {
      discordDialog.value = true;
    }
  }

  function saveWebhookSettings () {
    if (props.updateArea) {
      props.updateArea(_area.value);
    } else {
      emit('save', _area.value);
    }
    slackDialog.value = false;
    discordDialog.value = false;
    _area.value = {};
  }

  watch(() => props.areas, newAreas => {
    if (newAreas) {
      _areas.value = JSON.parse(JSON.stringify(newAreas))
    }
  }, { immediate: true, deep: true })
</script>
