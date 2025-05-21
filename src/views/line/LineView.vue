<template>
  <div id="lines" class="mt-2">
    <v-card v-if="isTestMode">
      <v-card-text>
        <h6 class="text-error">No Lines Available for Viewing</h6>
        <b>Possible causes:</b><br>
        <ul class="list-unstyled m-0">
          <li class="list-item">Facility has not enabled bidding</li>
          <li class="list-item">Facility requires users to be logged-in to view lines</li>
        </ul>
      </v-card-text>
    </v-card>

    <!-- Multiple LineGroups displayed in tabs -->
    <template v-if="lineGroups.length > 1">
      <v-tabs v-model="activeLineGroupId">
        <v-tab v-for="group in lineGroups" :key="group.id" :value="group.id">
          {{ group.name }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeLineGroupId">
        <v-window-item
          v-for="group in lineGroups"
          :key="group.id"
          :value="group.id"
        >
          <line-list
            :area="area"
            :crews="crews"
            :line-group="selectedGroup"
            :lines-by-crew="linesByCrew"
            @delete-line="handleDeleteLine"
            @new-line="handleNewLine"
            @update-lines="handleUpdateLines"
          />
        </v-window-item>
      </v-window>
    </template>

    <!-- Single LineGroup displayed without tabs -->
    <template v-else-if="lineGroups.length === 1">
      <line-list
        :area="area"
        :crews="crews"
        :line-group="lineGroups[0]"
        :lines-by-crew="linesByCrew"
        @delete-line="handleDeleteLine"
        @new-line="handleNewLine"
        @update-lines="handleUpdateLines"
      />
    </template>
  </div>
</template>

<script setup>
/** Imports */
  import { computed, onMounted, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';

  import { useRoute } from 'vue-router';
  import draggable from 'vuedraggable';
  import { LineGroupRepository } from '@/api';
  import { useFacilityStore } from '@/stores/facility.js';
  import LineRow from './LineRow';
  import LineList from './LineList';
  import { logError } from '@/utils/logError.js';
  import { useAreaStore } from '@/stores/area.js';

  /** Setup */
  const route = useRoute();
  const areaStore = useAreaStore();
  const facilityStore = useFacilityStore();
  const { area, crews } = storeToRefs(areaStore);
  const LINEGROUP = new LineGroupRepository();

  /** State */
  /** @type {import('vue').Ref<import('@/types').LineGroup[]>} */
  const lineGroups = ref([]) // for tabs
  const activeLineGroupId = ref('');


  const flattenedLines = ref([])
  const expandedGroups = ref([]) // to track which groups are expanded
  const activeGroup = ref('0');
  const groups = ref([]);
  const lines = ref({});
  const showLineForm = ref(false);
  const showLineFlyover = ref(false);
  const selectedLine = ref({});
  const creatingCrewId = ref(null);

  /** Methods */
  function handleNewLine (line) {
    if (!line) return;
    console.log('[LineView] - receive new-line event', line);

    // Get active LineGroup
    const group = lineGroups.value.find(g => g.id === activeLineGroupId.value);
    if (!group) return;

    // Initialize lines array if it doesn't exist
    if (!group.lines) {
      group.lines = [];
    }

    // Add the new line to the group
    group.lines.push(line);
  }
  function handleUpdateLines (lines) {
    console.log('[LineView] - receive update-line event', lines);
    // Loop through each of the line updates
    lines.forEach(line => {
      // Get the active LineGroup
      const group = lineGroups.value.find(g => g.id === activeLineGroupId.value);
      if (!group) return;
      console.log('[LineView] - found group', group);

      // Find the line in the group
      const lineIndex = group.lines.findIndex(l => l.id === line.id);
      console.log('[LineView] - found line', lineIndex);
      if (lineIndex >= 0) {
        // Update the line
        group.lines[lineIndex] = line;
        console.log('[LineView] - updated line', group.lines[lineIndex]);
      }
    })
  }
  function handleDeleteLine (data) {
    const { deletedLine, lines } = data;
    console.log('[LineView] - receive delete-line event', deletedLine);
    // Get the active LineGroup
    const group = lineGroups.value.find(g => g.id === activeLineGroupId.value);
    if (!group) return;
    console.log('[LineView] - found group', group);
    // Find the line in the group
    const lineIndex = group.lines.findIndex(l => l.id === deletedLine.id);
    console.log('[LineView] - found line', lineIndex);
    if (lineIndex >= 0) {
      // Remove the line
      group.lines.splice(lineIndex, 1);
      console.log('[LineView] - removed line', group.lines[lineIndex]);

      // Update the impacted lines (new line number)
      handleUpdateLines(lines);
    }
  }

  /** Actions */
  const fetchLines = async () => {
    /** @type {import('@/types/context').LineGroupContextData} LineGroupContext */
    try {
      const { data } = await LINEGROUP.get({ areaSlug: route.params.area })
      // Store the linegroups and set the active LineGroup
      lineGroups.value = data
      activeLineGroupId.value = data[0].id
    } catch (e) {
      await logError(e, { tag: 'LineView.fetchLines' });
    }
  }

  /** Computed */
  const linesByCrew = computed(() => {
    /** @type {import('@/types').LineGroup} */
    const group = lineGroups.value.find(g => g.id === activeLineGroupId.value);
    if (!group || !group.lines) return {};

    const result = group.lines.reduce((result, item) => {
      const groupKey = item.crew_id || 'Unknown';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});

    // Sort each crew's lines by the 'line' field
    Object.keys(result).forEach(crewId => {
      result[crewId].sort((a, b) => {
        // If line is a number, sort numerically
        if (!isNaN(a.line) && !isNaN(b.line)) {
          return a.line - b.line;
        }
        // Otherwise sort by name
        return a.name.localeCompare(b.name);
      });
    });

    return result;
  })


  /** REVIEW **/

  function handleViewLine (item) {
    selectedLine.value = item;
    showLineFlyover.value = true;
  }

  function handleEditLine (item) {
    selectedLine.value = item;
    showLineForm.value = true;
  }

  function handleDuplicateLine (item) {
    // Find the crew and line index
    const crewId = item.crew_id;
    const lineIndex = lines.value[crewId]?.length || 0;

    // Use the existing duplicateLine function with the correct parameters
    selectedLine.value = item;
    duplicateLine(crewId, lineIndex);
  }


  // Also update flattenedLines
  // const flattenedIndex = flattenedLines.value.findIndex(l => l.id === line.id);
  // if (flattenedIndex >= 0) {
  //   flattenedLines.value[flattenedIndex] = {
  //     ...line,
  //     crew_name: line.crew_name,
  //   };
  // } else {
  //   flattenedLines.value.push({
  //     ...line,
  //     crew_name: line.crew_name,
  //   });
  // }

  // Refresh the data
  // fetchLines();

  const canBidLine = computed(() => {
    return true;
    // return bidMode.value && bidder.value && bidder.value.round_type === 'line';
  });
  const lineCount = computed(() => {
    return 12;
    // return flatten(Object.values(lines.value)).length;
  });
  const selectedGroup = computed(() => {
    return groups.value[activeGroup.value];
  });
  const selectedGroupIdx = computed(() => {
    return parseInt(activeGroup.value);
  });
  const groupHeaders = ref([])
  const activeGroups = computed(() => {
    return []
    // return canBidLine.value ? filter(groups.value, { active: 1 }) : groups.value;
  });
  const groupDates = computed(() => {
    return {
      start: null,
      end: null,
      // start: moment.utc(selectedGroup.value?.start_day),
      // end: moment.utc(selectedGroup.value?.end_day),
    };
  });
  const isTestMode = computed(() => {
    return false;
    // if (!facility.value.test_mode) return false;
    // return !is.value('arearep', area.value.id);
  });
  const isLineGroupBid = computed(() => {
    return true;
    // return indexOf(Object.keys(linesBid.value), String(selectedGroup.value?.id)) !== -1;
  });
  const areAllLineGroupsBid = computed(() => {
    return Object.keys(linesBid.value).length === activeGroups.value.length;
  });

  // Computed property to group all lines by crew_name (for backwards compatibility)
  const groupedLines = computed(() => {
    return flattenedLines.value.reduce((result, item) => {
      const groupKey = item.crew_name || 'Unknown';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    }, {});
  });


  // Methods
  function bid (line) {
    store.commit('bidder/toggleLine', line);

    // If all linegroups bid then mark line as complete
    if (areAllLineGroupsBid.value) {
      store.commit('bidder/bidModuleComplete', { module: 'line', status: true });
    } else {
      store.commit('bidder/bidModuleComplete', { module: 'line', status: false });
    }
  }
  function createLineForm (crewID) {
    creatingCrewId.value = crewID;
    showLineForm.value = true;
  }
  function createLine (line) {
    insertLine(line, creatingCrewId.value);
    deselectLine();
  }
  function deselectLine () {
    selectedLine.value = {};
    showLineFlyover.value = false;
    showLineForm.value = false;
    creatingCrewId.value = null;
  }
  function duplicateLine (crewIdx, newLineNumber) {
    LineRepository.duplicate(selectedLine.value, newLineNumber)
      .then(response => {
        insertLine(response.data, crewIdx);
        deselectLine();
      });
  }
  function insertLine (line, crewIdx) {
    // Create a new crew if one doesn't exist
    if (!lines.value[crewIdx]) {
      lines.value[crewIdx] = [];
    }

    // Insert the new line
    lines.value[crewIdx].push(line);
  }
  function newGroup (group) {
    // Do nothing if viewing previous year groups
    if (viewingPastYear.value) return null;

    // Push new group into state and fetch lines
    const length = groups.value.push(group);
    fetchLines(group.id)
      .then(() => {
        activeGroup.value = `${length - 1}`;
      });
  }
  function orderLines ($event) {
    // const changedCrews = [
    //   $event.from.id,
    //   $event.to.id,
    // ];
    //
    // // Simplify order of lines
    // const changes = {};
    // forEach(lines.value, (linesArray, crewID) => {
    //   if (changedCrews.includes(crewID)) {
    //     changes[crewID] = map(linesArray, 'id');
    //   }
    // });
    //
    // LineRepository.order(changes)
    //   .then(r => {
    //     // Update the line number for each line
    //     forEach(r.data, line => {
    //       const change = find(lines.value[line.crew_id], { id: line.id });
    //       if (change) {
    //         change.name = line.name;
    //         change.line = line.line;
    //         change.crew_name = line.crew_name;
    //       }
    //     });
    //   });
  }
  function removeGroup () {
    groups.value.splice(selectedGroupIdx.value, 1);
    activeGroup.value = '0';
  }


  // Watchers
  watch(activeGroup, (newVal, oldVal) => {
    if (newVal !== oldVal && oldVal !== undefined && groups.value[parseInt(newVal)]) {
      fetchLines(groups.value[parseInt(newVal)].id);
    }
  });
  // Lifecycle hooks
  onMounted(async () => {
    await fetchLines();

    // Expand all groups
    // Object.values(groupHeaders.value).forEach(header => {
    //   header.toggleGroup(header.item)
    // })

    // Initialize all groups as expanded for the custom table
    expandedGroups.value = Object.keys(groupedLines.value);
  });
</script>
<style scoped>
</style>
