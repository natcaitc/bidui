<template>
    <div id="lines" class="mt-2">
        <line-form v-if="showLineForm"
                   v-model="selectedLine"
                   :creating-crew-id="creatingCrewId"
                   :line-group="selectedGroup"
                   :crews="crews"
                   @created="createLine"
                   @close="deselectLine"></line-form>
        <line-flyover v-if="showLineFlyover"
                      :line="selectedLine"
                      v-bind="{crews, types}"
                      @closed="deselectLine"></line-flyover>

        <card v-if="isTestMode">
            <h6 class="text-danger">No Lines Available for Viewing</h6>
            <b>Possible causes:</b><br>
            <ul class="list-unstyled m-0">
                <li class="list-item">Facility has not enabled bidding</li>
                <li class="list-item">Facility requires users to be logged-in to view lines</li>
            </ul>
        </card>

        <el-tabs v-else
                 type="border-card"
                 v-model="activeGroup"
                 ref="groups">
            <el-tab-pane v-for="group in activeGroups" :key="group.id">
                <span slot="label">
                    <i class="fas fa-check-square text-success" v-if="group.active"></i>
                    <i class="fas fa-window-close text-danger" v-else></i>
                    {{ group.name }}
                </span>

                <div class="row mb-2">
                    <div class="col">
                        <h6 class="mb-0 d-inline-block">
                            {{ group.name }}
                            <br><small>{{ groupDates.start | dayRange(groupDates.end) }}</small>
                        </h6>

                        <ul class="list-inline edit-link line-icons">
                          <li class="list-inline-item">
                            <change-leave-year @change="loadDependencies" />
                          </li>
                            <li class="list-inline-item">
                                <a href="#" @click.prevent="print = true">
                                    <i class="fas fa-print"></i>
                                </a>
                            </li>
                            <li class="list-inline-item">
                                <line-group-crud :group="group"
                                                 :can-delete="activeGroups.length > 1"
                                                 v-if="is('arearep', area.id) && !canBidLine"
                                                 @refresh="loadDependencies"
                                                 @new-group="newGroup"
                                                 @update-group="updateGroup"
                                                 @delete-group="removeGroup"/>
                            </li>
                        </ul>
                    </div>
                </div>

                <div id="lines-container">
                    <table class="table-responsive results h-100">
                        <!-- table must have height to get divs to fill cell height :-/ -->
                        <tr class="d-flex head">
                            <th :class="bidMode ? 'col-4 col-md-2' : 'col-3 col-md-1'">&nbsp;</th>
                            <th class="col-1 text-center" v-if="!bidMode" >Init</th>
                            <th class="d-table-cell d-md-none col-8">
                                Details <small class="font-italic">(Click row to view)</small>
                            </th>
                            <th class="d-none d-md-table-cell col-md-8 p-0">
                                <div class="d-none d-md-flex row text-center">
                                    <!--                                                <div class="col">Start</div>-->
                                    <div class="flex-grow-1 text-center">SU</div>
                                    <div class="flex-grow-1">MO</div>
                                    <div class="flex-grow-1">TU</div>
                                    <div class="flex-grow-1">WE</div>
                                    <div class="flex-grow-1">TH</div>
                                    <div class="flex-grow-1">FR</div>
                                    <div class="flex-grow-1">SA</div>
                                </div>
                            </th>
                            <th class="d-none d-md-table-cell col-md-2" v-if="bidMode">Notes</th>
                            <th class="d-none d-md-table-cell col-md-2" v-if="!bidMode">&nbsp;</th>
                        </tr>
                        <template v-for="crew in crews">
                            <tr class="d-flex subhead" :key="crew.id">
                                <td class="col" :colspan="columns">
                                    <div class="row align-items-center">
                                        <div class="col">
                                            <h6 class="d-inline-block mb-0 mr-3">
                                                {{ crew.name }} ({{ crew.crew_tag }})
                                            </h6>

                                            <a href="#"
                                               class="font-weight-light text-white text-decoration-none"
                                               v-if="!bidMode && is('arearep', area.id)"
                                               @click.prevent="createLineForm(crew.id)">
                                                <i class="fas fa-plus"></i> New Line
                                            </a>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <wrapped-component :wrap="!canBidLine" :key="'wrap-' + crew.id" tag="tbody" class="d-block">
                                <draggable #wrapper
                                           v-model="lines[crew.id]"
                                           :key="'drag-' + crew.id"
                                           class="d-block"
                                           :id="crew.id"
                                           tag="tbody"
                                           group="lines"
                                           handle=".fa-grip-vertical"
                                           @end="orderLines($event, crew)" />
                                    <line-row v-for="(line, i) in lines[crew.id]"
                                              :key="line.id"
                                              v-bind="{
                                                  crew,
                                                  line,
                                                  i,
                                                  bidMode: canBidLine,
                                                  canBidLine: canBidLine && bidder.employee_type_id === line.employee_type,
                                                  biddable: !isLineGroupBid,
                                                  isBid: linesBid[selectedGroup.id] && linesBid[selectedGroup.id].id === line.id
                                              }"
                                              @bid="bid"
                                              @click="selectedLine = line"
                                              @view="showLineFlyover = true"
                                              @edit="showLineForm = true"
                                              @copy="duplicateLine(crew.id, lines[crew.id].length)"
                                              @delete="deleteLine(crew.id, i)" />
                            </wrapped-component>
                        </template>
                    </table>
                </div>
            </el-tab-pane>
        </el-tabs>

        <print element-id="lines-container"
               :title="title"
               :trigger="print" @done="print = false"></print>
    </div>
</template>
<script>
import { ChangeLeaveYear } from '@/components'
import moment from 'moment'
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'
import LineRow from './LineRow'
import LineFlyover from './LineFlyover'
import LineForm from './LineForm'
import LineGroupCrud from './LineGroupCrud'
import { Dialog, TabPane, Tabs } from 'element-ui'
import WrappedComponent from 'vue-wrapped-component'
import { Print } from '@/components/stateless'

import { RepositoryFactory } from '@/repositories/RepositoryFactory'
const LineRepository = RepositoryFactory.get('line')
const LineGroupRepository = RepositoryFactory.get('linegroup')

export default {
  name: 'lines',
  components: {
    ChangeLeaveYear,
    draggable,
    LineRow,
    LineFlyover,
    LineForm,
    LineGroupCrud,
    [Tabs.name]: Tabs,
    [TabPane.name]: TabPane,
    [Dialog.name]: Dialog,
    WrappedComponent,
    Print
  },
  data () {
    return {
      activeGroup: '0',
      groups: [],
      lines: {},
      showLineForm: false,
      showLineFlyover: false,
      selectedLine: {}, // {"id":10223,"area_id":4,"line_group_id":611,"crew_id":529,"year":2020,"line":1,"employee_type":1,"notes":null,"bgcolor":"#D9D1D1","created_at":"2019-09-18 19:47:11","updated_at":"2019-09-19 00:28:24","deleted_at":null,"hours":8,"repeat":"default","details":[{"id":8059,"created_at":"2019-09-19 21:15:42","updated_at":"2019-09-19 21:15:42","deleted_at":null,"line_id":10223,"start":"2020-01-05","su":null,"su_length":null,"mo":null,"mo_length":null,"tu":"1515","tu_length":8,"we":"1300","we_length":8,"th":"0800","th_length":8,"fr":"0615","fr_length":8,"sa":"2245","sa_length":8}],"bid":{"id":1392,"created_at":"2019-10-01 20:21:00","updated_at":"2019-10-01 20:21:00","deleted_at":null,"line_id":10223,"crew_id":529,"member_id":34380,"area_id":4,"year":2020,"controller":{"id":34380,"created_at":"2019-09-11 04:45:44","updated_at":"2019-09-18 20:59:54","deleted_at":null,"facility_id":"zjx","area_id":4,"employee_type_id":1,"fname":"Andrew","lname":"Wallace","email":"awallace20937@gmail.com","cell_phone":"443-789-0228","init":"VT","notes":null,"notify_method":"email","accrual_override":0,"accumulated_leave":0,"full_name":"Andrew Wallace","name_lf":"Wallace, Andrew"}}},
      creatingCrewId: null,
      print: false
    }
  },
  computed: {
    ...mapGetters({
      facility: 'facility/facility',
      viewYear: 'facility/viewYear',
      viewingPastYear: 'facility/viewingPastYear',
      types: 'facility/employeeTypes',
      area: 'area/area',
      is: 'auth/is',
      crews: 'area/crews',
      bidder: 'bidder/active',
      bidMode: 'bidder/bidMode',
      linesBid: 'bidder/linesBid'
    }),
    canBidLine () { // Make sure the bidder round can bid a line and bidMode is available
      return this.bidMode && this.bidder && this.bidder.round_type === 'line'
    },
    columns () {
      return this.canBidLine ? 9 : 11
    },
    lineCount () {
      return _.flatten(Object.values(this.lines)).length
    },
    selectedGroup () {
      return this.groups[this.activeGroup]
    },
    selectedGroupIdx () {
      return parseInt(this.activeGroup)
    },
    activeGroups () {
      return this.canBidLine ? _.filter(this.groups, { active: 1 }) : this.groups
    },
    groupDates () {
      return {
        start: moment.utc(this.selectedGroup.start_day),
        end: moment.utc(this.selectedGroup.end_day)
      }
    },

    /** Handle test mode for non-admins */
    isTestMode () {
      // Check if test mode is active
      if (!this.facility.test_mode) return false

      // Test mode active but allow admins through
      return !this.is('arearep', this.area.id)
    },
    /** Check if line is selected for active line group */
    isLineGroupBid () {
      return _.indexOf(Object.keys(this.linesBid), String(this.selectedGroup.id)) !== -1
    },
    /** Check if all available line groups are selected */
    areAllLineGroupsBid () {
      return Object.keys(this.linesBid).length === this.activeGroups.length
    },
    title () {
      const title = `bidATC :: ${this.facility.name} :: ${this.area.name}`
      return this.selectedGroup ? title + ` :: ${this.selectedGroup.name}` : title
    }
  },
  methods: {
    bid (line) {
      this.$store.commit('bidder/toggleLine', line)

      // If all linegroups bid then mark line as complete
      if (this.areAllLineGroupsBid) { this.$store.commit('bidder/bidModuleComplete', { module: 'line', status: true }) } else { this.$store.commit('bidder/bidModuleComplete', { module: 'line', status: false }) }
    },
    createLineForm (crewID) {
      this.creatingCrewId = crewID
      this.showLineForm = true
    },
    createLine (line) {
      this.insertLine(line, this.creatingCrewId)
      this.deselectLine()
    },
    deleteLine (crewIdx, lineIdx) {
      LineRepository.delete(this.selectedLine.id)
        .then(() => {
          this.lines[crewIdx].splice(lineIdx, 1)
          this.deselectLine()
        })
    },
    deselectLine () {
      this.selectedLine = {}
      this.showLineFlyover = false
      this.showLineForm = false
      this.creatingCrewId = null
    },
    duplicateLine (crewIdx, newLineNumber) {
      LineRepository.duplicate(this.selectedLine, newLineNumber)
        .then((response) => {
          this.insertLine(response.data, crewIdx)
          this.deselectLine()
        })
    },
    insertLine (line, crewIdx) {
      // Create a new crew if one doesn't exist
      if (!this.lines[crewIdx]) { this.lines[crewIdx] = [] }

      // Insert the new line
      this.$set(this.lines[crewIdx], this.lines[crewIdx].length, line)
    },
    newGroup (group) {
      // Do nothing if viewing previous year groups
      if (this.viewingPastYear) return null

      // Push new group into state and fetch lines
      const length = this.groups.push(group)
      this.fetchLines(group.id)
        .then(() => {
          this.activeGroup = `${length - 1}`
        })
    },
    /** Save order of lines */
    orderLines ($event) {
      const changedCrews = [
        $event.from.id,
        $event.to.id
      ]

      // Simplify order of lines
      const changes = {}
      _.forEach(this.lines, (lines, crewID) => {
        if (changedCrews.includes(crewID)) {
          changes[crewID] = _.map(lines, 'id')
        }
      })

      LineRepository.order(changes)
        .then(r => {
          // Update the line number for each line
          _.forEach(r.data, line => {
            const change = _.find(this.lines[line.crew_id], { id: line.id })
            change.name = line.name
            change.line = line.line
            change.crew_name = line.crew_name
          })
        })
    },
    removeGroup () {
      this.groups.splice(this.selectedGroupIdx, 1)
      this.activeGroup = '0'
    },
    /** Fetch line groups */
    fetchGroups () {
      return LineGroupRepository.get(this.viewYear, this.is('arearep', this.area.id))
        .then((response) => {
          this.groups = response.data
          this.activeGroup = '0'
        })
    },
    /** Retrieve biddable lines */
    fetchLines (groupId) {
      return LineRepository.linesByGroup(groupId)
        .then((response) => {
          const lines = _.groupBy(response.data, 'crew_id')
          _.forEach(this.crews, crew => {
            this.$set(this.lines, crew.id, lines[crew.id] ? lines[crew.id] : [])
          })
        })
        .catch(() => {
          this.lines = {}
        })
    },
    loadDependencies () {
      this.fetchGroups()
        .then(() => {
          this.fetchLines(this.groups[0].id)
        })
    },
    updateGroup (group) {
      this.groups.splice(this.selectedGroupIdx, 1, group)
    }
  },
  created () {
    this.loadDependencies()
  },
  watch: {
    activeGroup (n, o) {
      if (n !== o && !Number.isInteger(o)) { // Watch for change, but not on first load
        this.fetchLines(this.groups[parseInt(n)].id)
      }
    }
  }
}
</script>
<style>
    #lines .line-icons {
        margin-top: -90px;
        margin-right: -10px;
    }

    #lines .table.results td {
        padding: 0 0.3em;
    }
</style>
