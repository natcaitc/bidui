<template>
  <div class="roster-container">
    <v-card variant="flat">
      <v-card-title class="d-flex align-center">
        <h4 class="text-uppercase">{{ roster.name }} Roster</h4>
        <v-chip v-if="roster.default" class="ml-2" color="info" prepend-icon="star">Default</v-chip>
        <v-spacer />
        <v-btn
          v-if="!orderTeams"
          class="mr-2"
          color="info"
          prepend-icon="arrow-down-up-across-line"
          size="small"
          @click="orderTeams = !orderTeams"
        >
          Reorder Teams
        </v-btn>

        <v-btn
          v-else-if="orderTeams"
          class="mr-2"
          color="warning"
          prepend-icon="xmark"
          size="small"
          @click="orderTeams = !orderTeams"
        >
          Done Ordering Teams
        </v-btn>

        <v-btn
          color="success"
          prepend-icon="plus"
          size="small"
          @click="openCreate(defaultTeam.value)"
        >
          New Team
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate />

        <!-- Draggable Teams -->
        <draggable
          v-model="teams"
          group="teams"
          handle=".team-handle"
          item-key="id"
          @end="onTeamDragEnd"
        >
          <template #item="{ element: team }">
            <div class="team-container">
              <!-- Team Header -->
              <v-sheet
                class="team-header pa-2 d-flex align-center team-handle"
                color="primary"
              >
                <v-icon v-if="orderTeams" class="me-2" size="small">grip-vertical</v-icon>
                <strong class="mr-2">{{ team.name }}</strong>
                <v-btn
                  class="mr-0"
                  density="compact"
                  icon
                  size="small"
                  variant="text"
                  @click="openEdit({...defaultTeam.value, ...team})"
                >
                  <v-icon icon="pen-to-square" size="x-small" />
                </v-btn>
                <v-btn
                  class="me-0"
                  density="compact"
                  icon
                  size="small"
                  variant="text"
                  @click="requestDelete(team)"
                >
                  <v-icon icon="trash" size="x-small" />
                </v-btn>
                <v-spacer />
                <select-members v-model="addMembers" :exclude-ids="allMemberIds" @selection-confirmed="addMembersToTeam(team)">
                  <v-btn
                    class="mr-3"
                    color="success"
                    size="small"
                    variant="elevated"
                  >
                    <v-icon class="mr-2" size="small">user</v-icon>
                    Add BUE
                  </v-btn>
                </select-members>
                <v-chip class="ms-2" size="x-small">{{ team.members.length }}</v-chip>
                <v-btn icon size="x-small" variant="tonal" @click.stop="team.collapsed = !team.collapsed">
                  <v-icon size="small">{{ team.collapsed ? 'chevron-down' : 'chevron-up' }}</v-icon>
                </v-btn>
              </v-sheet>

              <template v-if="!team.collapsed">
                <!-- Header -->
                <v-sheet
                  class="member-header d-flex align-center pa-1 text-caption font-weight-bold"
                  color="grey-lighten-2"
                >
                  <div style="min-width: 25px;" /> <!-- Empty space for drag handle -->
                  <div class="px-2" style="min-width: 160px;">Name</div>
                  <div class="px-2" style="min-width: 110px;">Type</div>
                  <div class="px-4" style="min-width: 70px;">Init</div>
                  <div class="px-2" style="min-width: 110px;">BU Date</div>
                  <div class="px-2" style="min-width: 110px;">NATCA Date</div>
                  <div class="px-2" style="min-width: 110px;">EOD Date</div>
                  <div class="px-2" style="min-width: 110px;">SCD Date</div>
                </v-sheet>

                <!-- Draggable Members -->
                <draggable
                  v-model="team.members"
                  ghost-class="ghost"
                  group="members"
                  handle=".member-handle"
                  item-key="id"
                  tag="div"
                  @change="event => onMemberDropped(event, team)"
                >
                  <template #item="{ element: member }">
                    <v-sheet border="thin" class="member-item d-flex align-center pa-1" color="grey-lighten-4">
                      <v-icon class="me-2 member-handle" size="x-small">grip-vertical</v-icon>

                      <!-- Name -->
                      <div class="px-2" style="min-width: 160px;">{{ member.name_lf }}</div>

                      <!-- Type -->
                      <div class="px-2" style="min-width: 110px;">{{ employeeTypeName(member.employee_type_id) }}</div>

                      <!-- Initials -->
                      <!--                      <div class="px-2 text-uppercase text-center" style="min-width: 60px;">{{ member.init }}</div>-->
                      <v-text-field
                        ref="initInputs"
                        v-model="member.init"
                        class="px-2 initials-input text-uppercase text-center-input"
                        density="compact"
                        hide-details
                        single-line
                        style="min-width: 60px; max-width: 70px;"
                        variant="underlined"
                        @blur="saveInit(member)"
                        @update:model-value="val => member.init = (val || '').toUpperCase().slice(0, 2)"
                      />
                      <!-- Dates -->
                      <div class="px-2" style="min-width: 110px;">{{ member.BU_date }}</div>
                      <div class="px-2" style="min-width: 110px;">{{ member.NATCA_date }}</div>
                      <div class="px-2" style="min-width: 110px;">{{ member.EOD_date }}</div>
                      <div class="px-2" style="min-width: 110px;">{{ member.SCD_date }}</div>

                      <v-spacer />
                    </v-sheet>
                  </template>
                </draggable>
              </template>
            </div>
          </template>
        </draggable>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Dialog -->
    <FormDialog
      v-model="showFormDialog"
      :form-action="formAction"
      :form-data="_team"
      :loading="loading"
      @submit="handleSave"
    >
      <template #default="{ formData }">
        <v-text-field
          v-model="formData.name"
          label="Team Name"
          :rules="[v => !!v || 'Required']"
          @keyup.enter="save(formData)"
        />
      </template>
    </FormDialog>

    <!-- Delete Confirm Dialog -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Confirm Team Deletion"
      @confirm="handleConfirmDelete"
    >
      <div>
        <p>Are you sure you want to delete <strong>{{ _team?.name }}</strong>?</p>
        <small class="text-red">This action cannot be undone.</small>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup>
  /** Imports */
  import { onMounted, ref, watch } from 'vue'
  import draggable from 'vuedraggable'
  import { useRoute } from 'vue-router'
  import { useFacilityStore } from '@/stores/facility.js'
  import { useToastStore } from '@/stores/toasts.js';
  import { MemberRepository, RosterRepository, RosterTeamRepository } from '@/api/index.js'
  import { logError } from '@/utils/logError.js';
  import SelectMembers from '@/components/SelectMembers.vue';
  import { useCrud } from '@/composables/useCrud'
  import FormDialog from '@/components/FormDialog.vue'
  import ConfirmDialog from '@/components/ConfirmDialog.vue'

  /** Setup */
  const props = defineProps ({
    /** @type {import('vue').Ref<import('@/types').Roster|null>} */
    roster: {
      type: Object,
      required: true,
    },
  })
  const route = useRoute()
  const facilityStore = useFacilityStore()
  const toastStore = useToastStore()
  const ROSTER = new RosterRepository()
  const ROSTERTEAM = new RosterTeamRepository()
  const MEMBER = new MemberRepository()

  /** State */
  const loading = ref(true)
  const teams = ref([])
  const orderTeams = ref(false)
  const initInputs = ref([])
  const addMembers = ref([])
  const defaultTeam = ref({
    id: null,
    name: '',
    order: 0,
    members: [],
  })

  /** @typedef {import('@/api').RosterTeamContextData} RosterTeamContext */
  const RosterTeamContext = ref({
    areaSlug: route.params.area,
    rosterId: props.roster.id,
  });

  const {
    formData: _team,
    showDialog: showFormDialog,
    formAction,
    save,
    openCreate,
    openEdit,
    isEdit,
    requestDelete,
    showDeleteConfirm,
    confirmDelete,
  } = useCrud(ROSTERTEAM, RosterTeamContext)

  /** Methods */
  // Collapse all the teams
  function collapseTeams () {
    teams.value.forEach(team => {
      team.collapsed = true
    })
  }
  // Expand all the teams
  function expandTeams () {
    teams.value.forEach(team => {
      team.collapsed = false
    })
  }
  // Find the employee type by name
  function employeeTypeName (id) {
    return facilityStore.employeeTypes.find(et => et.id === id)?.type_name || 'Unknown'
  }
  // Handle the delete confirmation
  function handleConfirmDelete () {
    confirmDelete(deletedTeam => {
      teams.value = teams.value.filter(t => t.id !== deletedTeam.id)
      toastStore.showMessage({ message: 'Roster team deleted successfully', color: 'success' })
    }, async e => {
      toastStore.showMessage({ message: 'Unable to delete the roster team.', color: 'danger' })
      await logError(e, { tag: 'Roster.deleteTeam' })
    })
  }

  /** Actions */
  const handleSave = async () => {
    await save(response => {
      if (isEdit.value) {
        // Find and update the roster in the array
        const index = teams.value.findIndex(r => r.id === response.id)
        if (index !== -1) {
          teams.value[index] = { ...teams.value[index], ...response }
        }
      } else {
        teams.value.push(response)
        console.log(response)
      }
    })
  }
  const onTeamDragEnd = async () => {
    // Update the order of the teams
    const changes = teams.value.map((team, index) => ({
      id: team.id,
      order: index,
    }))

    try {
      console.log('Updated team order:', changes)
      /** @param {import('@/types/context').RosterTeamContextData} context */
      const context = {
        areaSlug: route.params.area,
        rosterId: props.roster.id,
        data: changes,
      }
      await ROSTERTEAM.orderTeams(context)
    } catch (error) {
      console.error('Error updating team order:', error)
      await loadRoster()
    }

    expandTeams()
    orderTeams.value = false
  }
  const onMemberDropped = async (event, team) => {
    const { removed } = event;
    if (removed) return;

    console.log('Member drop event:', event)


    const changes = team.members.map((member, index) => ({
      id: member.id,
      original_order: member.original_order,
      order: index,
      original_roster_team_id: member.original_roster_team_id,
      roster_team_id: team.id,
    })).filter(m => m.original_order !== m.order || m.roster_team_id !== team.id);

    if (changes.length === 0) return;

    try {
      /** @param {import('@/types/context').RosterTeamContextData} context */
      const context = {
        areaSlug: route.params.area,
        rosterId: props.roster.id,
        rosterTeamId: team.id,
        data: changes,
      }
      await ROSTERTEAM.orderMembers(context);
    } catch (e) {
      await logError(e, { tag: 'roster.onMemberDropped' });
    }

    changes.forEach(change => {
      const member = team.members.find(m => m.id === change.id);
      if (member) member.original_order = change.order;
    });
  };
  const saveInit = async member => {
    console.log('Saving init:', member)
    try {
      /** @param {import('@/types/context').MemberContextData} MemberContext */
      const MemberContext = {
        areaSlug: route.params.area,
        id: member.id,
        data: { init: member.init },
      }
      MEMBER.update(MemberContext)
    } catch (e) {
      await logError(e, { tag: 'roster.saveInit' })
    }
  }
  const loadRoster = async () => {
    try {
      loading.value = true
      /** @param {import('@/types/context').RosterContextData} RosterContext */
      const RosterContext = {
        areaSlug: route.params.area,
        id: props.roster.id,
      }
      const r = await ROSTER.teamsMembers(RosterContext)

      // Map a 'collapsed' boolean into the team object
      teams.value = r.data.map(team => ({
        ...team,
        collapsed: false,
        members:
          team.members.map((member, index) => ({
            ...member,
            original_order: index,
            original_roster_team_id: team.id,
          })),
      }))
    } catch (e) {
      await logError(e, { tag: 'roster.loadRoster' })
    } finally {
      loading.value = false
    }
  }
  const addMembersToTeam = async team => {
    if (!addMembers.value.length) return

    // Filter the IDs
    const memberIds = addMembers.value.map(m => m.id)

    try {
      /** @param {import('@/types/context').RosterTeamContextData} context */
      const context = {
        areaSlug: route.params.area,
        rosterId: props.roster.id,
        rosterTeamId: team.id,
        data: { members: memberIds },
      }
      const r = await ROSTERTEAM.addTeamMembers(context)
      teams.value.find(t => t.id === team.id).members = r.data.members
    } catch (e) {
      await logError(e, { tag: 'roster.addMembersToTeam' })
    }
  }

  /** Computed */
  const allMemberIds = computed(() => {
    return teams.value.flatMap(team => team.members.map(member => member.id))
  })

  /** Lifecycle */
  onMounted(async () => {
    await loadRoster()
  })

  /** Watchers */
  watch(orderTeams, async newVal => {
    if (newVal) {
      collapseTeams()
    } else {
      expandTeams()
    }
  })
</script>

<style scoped>
.roster-container {
    height: 100%;
    padding: 4px;
}
:deep(.v-card) {
    height: auto !important;
    overflow: visible !important;
}

.team-container {
    margin-bottom: 4px;
}

.team-header {
    cursor: grab;
}

.member-item {
    cursor: grab;
}

.team-handle,
.member-handle {
    cursor: grab;
    display: inline-flex;
    padding: 2px;
}
.text-center-input :deep(input) {
    text-align: center;
    text-transform: uppercase;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}
</style>
