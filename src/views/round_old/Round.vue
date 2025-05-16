<template>
  <div id="round-container">
    <el-tabs ref="rounds" v-model="activeRoundTab" type="border-card">
      <el-tab-pane v-for="(round, i, idx) in rounds" :key="i" :name="`${round.id}`">
        <template #label>
          <span>
            {{ round.name }}
          </span>
        </template>

        <div>
          <div class="row">
            <div class="col">
              <round-crud
                v-bind="{ round, rosters }"
                @create-round="createRound"
                @delete-round="deleteRound(round)"
              />
            </div>
          </div>
          <div class="row">
            <div class="col-lg-6">
              <roster-table
                v-if="selectedRound && selectedRound.id === round.id"
                :roster_id="round.roster_id"
                :round="round"
              />
            </div>
            <div class="col-lg-6">
              <div class="card">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item list-group-item-primary font-weight-bold px-1 py-2">
                    Round Configuration
                  </li>
                  <li class="list-group-item p-2">
                    <round-status-button :round="round" @reset="resetRound" @update-round="updateRound" />
                  </li>
                  <li v-if="round.status === 'new' && !round.bidders_created" class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Select Roster</h6>
                        <small>One roster can be used for multiple rounds, or define a new roster for each round.
                          <router-link :to="{ name: 'Roster', params: { area: area.slug, facility: facility.id }}">Manage Rosters</router-link>
                        </small>
                      </div>
                      <div class="col-5">
                        <el-select class="w-100 select-primary" :value="round.roster_id" @change="updateRound({ roster_id: $event })">
                          <el-option
                            v-for="roster in rosters"
                            :key="roster.id"
                            class="select-primary"
                            :label="roster.name"
                            :value="roster.id"
                          />
                        </el-select>
                      </div>
                    </div>
                  </li>
                  <li v-if="round.type !== 'line'" class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Leave Days Allowed</h6>
                        <small>
                          Indicate number of days that can be selected for this round and
                          whether accumulated leave can be used.
                        </small>
                      </div>
                      <div class="col-5">
                        <fg-input :disabled="round.status !== 'new' && !is('admin')" label="Days Allowed" :value="round.allowed_days" @change="updateRound({ allowed_days: $event.target.value })" />
                        <el-select class="w-100 select-primary" :disabled="round.status !== 'new' && !is('admin')" :value="round.leave_type" @change="updateRound({ leave_type: $event })">
                          <el-option
                            class="select-primary"
                            label="Accrued Only"
                            value="accrued"
                          />
                          <el-option
                            class="select-primary"
                            label="Accrued or Accumulated"
                            value="accumulated"
                          />
                        </el-select>
                      </div>
                    </div>
                  </li>
                  <li v-if="round.type !== 'line'" class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Restrictions</h6>
                        <small>
                          Set the number of holidays allowed for this round and
                          the number of controllers allowed off per crew per day.
                        </small>
                      </div>
                      <div class="col-5">
                        <fg-input :disabled="round.status !== 'new' && !is('admin')" label="Holidays Allowed" :value="round.holidays_allowed" @change="updateRound({ holidays_allowed: $event.target.value })" />
                        <fg-input :disabled="round.status !== 'new' && !is('admin')" label="Crew Members Per Day" :value="round.crew_limit" @change="updateRound({ crew_limit: $event.target.value })" />
                      </div>
                    </div>
                  </li>
                  <li v-if="round.type !== 'line'" class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Require Consecutive Days</h6>
                        <small>
                          When enabled controllers will bid in increments of five days. Each increment
                          complies with the contractual definition of a week (Seven consecutive days
                          inclusive of RDOs). Any portion of a week constitutes a full week, preventing
                          controllers from bidding random days throughout the year. Current area configuration
                          will allow all or part of <b class="text-success">{{ weeksAllowed }} week(s)</b>.
                        </small>
                      </div>
                      <div class="col-5">
                        <n-switch
                          color="bg-lightblue"
                          class="align-top float-right"
                          :off-value="0"
                          on-text="ON"
                          :on-value="1"
                          :value="round.require_consecutive_days"
                          @input="updateRound({ require_consecutive_days: $event })"
                        />
                        <!--                                                <span v-else class="float-right mr-3">-->
                        <!--                                                    <i v-if="round_AI.require_consecutive_days" class="fas fa-check-circle text-success fa-2x"></i>-->
                        <!--                                                    <i v-else class="fas fa-times-circle text-danger fa-2x"></i>-->
                        <!--                                                </span>-->
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item pt-2 pb-0">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Use Bid Windows</h6>
                        <small>Controllers will be required to bid within the pre-determined window. Opens bidding for controller at the start of their window, regardless of whether the previous controller has bid.</small>
                      </div>
                      <div class="col-4">
                        <n-switch
                          v-if="round.status === 'new'"
                          color="bg-lightblue"
                          class="align-top float-right"
                          :off-value="0"
                          on-text="ON"
                          :on-value="1"
                          :value="round.use_bid_windows"
                          @input="updateRound({ use_bid_windows: $event })"
                        />
                        <span v-else class="float-right mr-3">
                          <i v-if="round.use_bid_windows" class="fas fa-check-circle text-success fa-2x" />
                          <i v-else class="fas fa-times-circle text-danger fa-2x" />
                        </span>
                      </div>
                    </div>
                    <div v-if="round.use_bid_windows && round.type !== 'line'" class="row align-items-center pt-2">
                      <div class="col-1" />
                      <div class="col">
                        <h6><i class="fas fa-circle mr-2" />Auto-Close Bid Windows</h6>
                        <small>Controller will not be allowed to bid once their bid window closes.</small>
                      </div>
                      <div class="col-4">
                        <n-switch
                          color="bg-lightblue"
                          class="align-top float-right"
                          :off-value="0"
                          on-text="ON"
                          :on-value="1"
                          :value="round.close_bid_windows"
                          @input="updateRound({ close_bid_windows: $event })"
                        />
                      </div>
                    </div>
                    <div v-if="round.use_bid_windows" class="row align-items-center pt-2">
                      <div class="col-1" />
                      <div class="col">
                        <h6><i class="fas fa-circle mr-2" />Assign Bid Windows</h6>
                        <small>
                          Enter the first bid window and the duration of windows to automatically
                          create bid windows for the current roster. If bidding has started this
                          will create bid windows for any bidder who hasn't already bid.
                        </small>
                      </div>
                      <div class="col-4">
                        <bid-window-config :round="round" @refresh="bidWindowRefresh" />
                      </div>
                    </div>
                  </li>
                  <li class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Teams Bid Concurrently</h6>
                        <small>When turned on teams will start bidding at the same time.</small>
                      </div>
                      <div class="col-4">
                        <n-switch
                          v-if="round.status === 'new' && !round.bidders_created"
                          color="bg-lightblue"
                          class="align-top float-right"
                          :off-value="0"
                          on-text="ON"
                          :on-value="1"
                          :value="round.teams_bid_concurrently"
                          @input="updateRound({ teams_bid_concurrently: $event })"
                        />
                        <span v-else class="float-right mr-3">
                          <i v-if="round.teams_bid_concurrently" class="fas fa-check-circle text-success fa-2x" />
                          <i v-else class="fas fa-times-circle text-danger fa-2x" />
                        </span>
                      </div>
                    </div>
                  </li>
                  <li v-if="canDeleteRound(round)" class="list-group-item">
                    <div class="row align-items-center">
                      <div class="col">
                        <h6>Delete {{ round.name }}</h6>
                        <small>Permanently removes this round and any recorded bids. Use caution!</small>
                      </div>
                      <div class="col">
                        <n-button
                          class="float-right"
                          round
                          type="danger"
                          @click.native="deleteRound(round)"
                        >
                          <i class="fas fa-trash fa-md" />
                          Delete {{ round.name }}
                        </n-button>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
  import { mapGetters } from 'vuex'
  import RosterTable from './RosterTable'
  import RoundStatusButton from './RoundStatusButton'
  import RoundCrud from './RoundCrud'
  import BidWindowConfig from './BidWindowConfig'

  import { Switch as NSwitch } from '@/components/stateless'
  import { Option, Select, TabPane, Tabs } from 'element-ui'

  import { RepositoryFactory } from '@/repositories/RepositoryFactory'
  const RosterRepository = RepositoryFactory.get('roster')
  const RoundRepository = RepositoryFactory.get('round')

  export default {
    name: 'Round',
    components: {
      RosterTable,
      RoundStatusButton,
      RoundCrud,
      BidWindowConfig,
      NSwitch,
      [Select.name]: Select,
      [Option.name]: Option,
      [Tabs.name]: Tabs,
      [TabPane.name]: TabPane,
    },
    data () {
      return {
        activeRoundTab: null,
        // rounds: JSON.parse(JSON.stringify(this.$store.state.round_AI.rounds)),
        selectedRound: null,
        rosters: [],
      }
    },
    computed: {
      ...mapGetters({
        facility: 'facility/facility',
        area: 'area/area',
        types: 'facility/employeeTypes',
        is: 'auth/is',
        activeRounds: 'round_AI/activeRounds',
        rounds: 'round_AI/rounds',
      }),
      roundCount () {
        return Object.values(this.rounds).length
      },
      /** Number of full/part weeks allowed for the specified number of allowed days */
      weeksAllowed () {
        if (_.isEmpty(this.selectedRound)) return 0

        return Math.ceil(this.selectedRound.allowed_days / 5)
      },
    },
    watch: {
      activeRoundTab (n) {
        this.selectedRound = JSON.parse(JSON.stringify(this.rounds[n]))
      },
    },
    created () {
      this.fetchRosters()
    },
    mounted () {
      this.setActiveTab()
    },
    methods: {
      resetRound () {
        this.$confirm('Are you sure you want to reset ' + this.selectedRound.name + '?' +
          '<br><strong>All bids for this round_AI will be deleted!</strong>', 'Warning', {
          type: 'warning',
          confirmButtonText: 'Reset Round',
          dangerouslyUseHTMLString: true,
        }).then(() => {
          RoundRepository.reset(this.selectedRound.id)
            .then(r => {
              this.$store.commit('round_AI/setRound', r.data)
              this.$store.dispatch('bidder/fetch')
            })
        })
      },
      setActiveTab () {
        const activeRound = _.find(this.rounds, { status: 'active' })
        const newRound = _.find(this.rounds, { status: 'new' })
        this.activeRoundTab = String(activeRound ? activeRound.id : (newRound ? newRound.id : this.rounds[Object.keys(this.rounds)[0]].id))
      },
      /** Prevent selecting last tab, used for triggering form */
      checkTab (name) {
        if (name === 'add-round_AI') return false
      },
      /** Check if round_AI can be deleted */
      canDeleteRound (round) {
        // if (this.is('super')) return true; // Super can always delete
        if (round.type !== 'leave') return false // Line can never be deleted
        if (round.number + 1 !== Object.keys(this.rounds).length) return false // Only delete last leave round_AI
        return true
      },
      /** Create new round_AI */
      createRound (data) {
        // Add year to the round_AI
        data.bid_year = this.facility.bid_year

        // Store the new round_AI
        this.$store.dispatch('round_AI/create', data)
          .then(round => {
            this.$set(this.rounds, round.id, round)
            this.activeRoundTab = String(round.id)
          })
      },
      /** Delete a leave round_AI, line round_AI can only be deleted by a super */
      deleteRound () {
        this.$confirm('Are you sure you want to delete <strong>' + this.selectedRound.name + '</strong>?' +
          '<br><strong>All bids for this round_AI will be deleted!</strong>', 'Warning', {
          type: 'warning',
          confirmButtonText: 'Delete Round',
          dangerouslyUseHTMLString: true,
        }).then(() => {
          this.$store.dispatch('round_AI/delete', this.selectedRound)
            .then(() => {
              delete this.rounds[this.selectedRound.id]
              this.activeRoundTab = Object.keys(this.rounds).pop()
              window.scrollTo(0, 0)
            })
        })
      },
      updateRound (change) {
        const data = Object.assign({ round_id: this.selectedRound.id }, change)
        this.$store.dispatch('round_AI/update', data)
          .then(round => {
            this.$set(this.rounds, this.selectedRound.id, round)

            // Force bidder update if turning windows off
            if (change.use_bid_windows === 0) {
              this.$store.dispatch('bidder/fetch')
            }
          })
      },
      fetchRosters () {
        RosterRepository.index(this.facility.bid_year)
          .then(r => {
            this.rosters = r.data
          })
      },
      bidWindowRefresh (round) {
        this.$store.commit('round_AI/setRound', round)
        this.$store.dispatch('bidder/fetch')
      // updateRound({ bidders_created: true })
      },
    },
  }
</script>
<style></style>
