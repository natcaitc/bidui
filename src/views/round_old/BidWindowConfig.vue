<template>
  <div>
    <n-button class="pull-right" round type="success" @click.native="visible = true">
      Configure Bid Windows
    </n-button>

    <span class="bid-window-config">
      <el-dialog
        v-model:visible="visible"
        :close-on-click-modal="false"
        title="Configure Bid Windows"
        :width="dialogWidth + '%'"
      >
        <p>
          System will start assigning windows to the next controller who has yet to bid for this round.
          Start times are based on the facility bid times
          (<router-link :to="{ name: 'Facility Admin' }">Configure Here</router-link>)
          and must be configured by the FacRep.
        </p>
        <hr>
        <h5>Facility Bid Hours</h5>
        <table class="table results text-center">
          <thead>
            <tr>
              <td>Su</td>
              <td>Mo</td>
              <td>Tu</td>
              <td>We</td>
              <td>Th</td>
              <td>Fr</td>
              <td>Sa</td>
            </tr>
          </thead>
          <tr>
            <td v-for="day in hours" :key="day.weekday">
              <span v-if="day.open">
                {{ day.open }} - {{ day.close }}
              </span>
              <b v-else>CLOSED</b>
            </td>
          </tr>
        </table>
        <hr>
        <div class="row">
          <div class="col">

            <p>Start time for first/next window</p>

            <div class="w-75 d-inline-block mr-2">
              <fg-input>
                <el-date-picker
                  v-model="config.start"
                  format="MM-dd-yyyy HH:mm"
                  :picker-options="{ step: '00:30' }"
                  placeholder="Select window start"
                  type="datetime"
                />
              </fg-input>
            </div>
            <b>{{ facilityTimezone }}</b>
          </div>
          <div class="col">
            <p>Window duration in minutes</p>
            <fg-input
              v-model="config.duration"
              placeholder="Window Duration"
            />
          </div>
        </div>
        <div class="row">
          <div class="col text-center">
            <n-button
              class="w-25"
              round
              type="primary"
              @click.native="save()"
            >
              Create Windows
            </n-button>
          </div>
        </div>
      </el-dialog>
    </span>
  </div>
</template>

<script>
  import { DatePicker, Dialog, TimeSelect } from 'element-ui'
  import { mapGetters } from 'vuex'

  import { RepositoryFactory } from '@/repositories/RepositoryFactory'
  import moment from 'moment-timezone'
  const RoundRepository = RepositoryFactory.get('round')

  export default {
    name: 'BidWindowConfig',
    components: {
      [Dialog.name]: Dialog,
      [DatePicker.name]: DatePicker,
      [TimeSelect.name]: TimeSelect,
    },
    props: {
      round: Object,
    },
    data () {
      return {
        visible: false,
        config: {
          start: null,
          duration: 30,
        },
      }
    },
    methods: {
      save () {
        // Convert to the facility time zone when submitting the start time
        const facilityOffset = moment.tz.zone(this.facility.timezone).utcOffset(this.config.start)
        const modifyOffset = facilityOffset - this.utcOffset
        const startMoment = moment.utc(this.config.start)
        const data = {
          start: this.config.start, // startMoment.add(modifyOffset, 'minutes'),
          duration: this.config.duration,
        }

        // Create the windows
        RoundRepository.createBidWindows(this.round.id, data)
          .then(r => {
            this.visible = false

            // Force update of this round_AI
            this.$emit('refresh', r.data)
          })
      },
    },
    computed: {
      ...mapGetters({
        facility: 'facility/facility',
      }),
      dialogWidth () {
        return this.screenSize !== 'lg' && this.screenSize !== 'xl' ? 80 : 40
      },
      hours () {
        // Convert bid_hours to local time
        return this.utcTimes(JSON.parse(JSON.stringify(this.facility.bid_hours)), this.facility.timezone, ['open', 'close'], true)
      },
      facilityTimezone () {
        return moment.tz(this.facility.timezone).zoneAbbr()
      },
    },
  }
</script>
