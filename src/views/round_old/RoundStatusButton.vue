<template>
  <div>
    <div class="row no-gutters align-items-center">
      <div class="col">
        <div class="pl-3">
          <h6>Round Status</h6>
          <span :class="'text-' + title.color">
            <i class="fa-lg" :class="title.icon" />
            {{ title.text }}
          </span>
          <div v-if="!isFacilityOpen && round.status === 'active'" class="m-2 p-3 bg-lightgray">
            <b class="text-danger">Facility bidding is closed!</b><br>
            Notifications will still be sent but bids cannot be entered by BUEs until bidding opens for the facility.
          </div>
          <div v-if="area.exceeded_preapproved" class="m-2 p-3 bg-lightgray">
            <b class="text-danger">Preapproved Slots Exhausted</b><br>
            Either all slots have been bid, or the next bidder could potentially exceed the number of Preapproved slots
            for this area.
          </div>
        </div>
      </div>
    </div>
    <div class="row no-gutters align-items-center">
      <div class="col text-right">
        <el-tooltip
          content="Reset round, deleting all bids"
          :open-delay="300"
          placement="top"
        >
          <n-button
            v-if="is('arearep', area.id)"
            round
            size="sm"
            type="info"
            @click.native="$emit('reset')"
          >
            <i class="fas fa-undo fa-md" /> Reset Round
          </n-button>
        </el-tooltip>
        <n-button
          round
          size="sm"
          :type="button.color"
          @click.native="$emit('update-round_AI', { status: button.action })"
        >
          <i class="fa-md" :class="button.icon" /> {{ button.title }}
        </n-button>
        <el-tooltip
          content="End Bidding for this Round"
          :open-delay="300"
          placement="top"
        >
          <n-button
            v-if="round.status === 'active' || round.status === 'paused'"
            icon
            round
            size="sm"
            type="danger"
            @click.native="$emit('update-round_AI', { status: 'ended' })"
          >
            <i class="fas fa-stop fa-md" />
          </n-button>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  /**
   * Create Round Status and Control component to display and manage current status of round_AI
   */
  export default {
    name: 'RoundStatusButton',
    components: {},
    props: {
      round: Object,
    },
    data () {
      return {
        buttons: {
          start: {
            title: 'Start Round',
            color: 'success',
            icon: 'fas fa-play',
            action: 'active',
          },
          pause: {
            title: 'Pause Round',
            color: 'warning',
            icon: 'fas fa-pause',
            action: 'paused',
          },
          resume: {
            title: 'Resume Round',
            color: 'success',
            icon: 'fas fa-play',
            action: 'active',
          },
        },
        statuses: {
          new: {
            text: 'New Round',
            color: 'muted',
            icon: 'fas fa-stop-circle',
            button: 'start',
          },
          active: {
            text: 'Bidding Active',
            color: 'success',
            icon: 'fas fa-play-circle',
            button: 'pause',
          },
          paused: {
            text: 'Bidding Paused',
            color: 'warning',
            icon: 'fas fa-pause-circle',
            button: 'resume',
          },
          ended: {
            text: 'Round Ended',
            color: 'danger',
            icon: 'fas fa-stop-circle',
            button: 'resume',
          },
        },
      }
    },
    computed: {
      ...mapGetters({
        isFacilityOpen: 'facility/isFacilityOpen',
        area: 'area/area',
        is: 'auth/is',
      }),
      status () {
        if (!this.isFacilityOpen) {
          return 'paused'
        }
        return this.round.status
      },
      title () {
        return this.statuses[this.status]
      },
      button () {
        return this.buttons[this.statuses[this.round.status].button]
      },
    },
    watch: {},
    mounted () {
    },
    methods: {},
  }
</script>
