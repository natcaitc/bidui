<template>
    <span>
        <span class="cursor-pointer">
            <i class="fas fa-user-clock text-primary" @click="visible = true"></i>
        </span>

        <el-dialog title="Manage Controller Round Bidding"
                   :width="dialogWidth + '%'"
                   :close-on-click-modal="false"
                   :visible.sync="visible">
            <form>
                <div class="row">
                    <div class="col">
                        <h5 class="mb-0">Controller</h5>
                        {{ Bidder.full_name }} (<b>{{ Bidder.init }}</b>)
                    </div>
                    <div class="col">
                        <h5 class="mb-0">Round</h5>
                        {{ round.name }}
                    </div>
                    <div class="col">
                        <h5 class="mb-0">IDs</h5>
                        <i>Member Number: </i> <b>{{ Bidder.member_id }}</b><br>
                        <i>Bidder: </i> <b>{{ Bidder.id }}</b>
                    </div>
                </div>

                <div class="row mt-3">
                    <div class="col-md-12 col-lg-6" v-if="round.use_bid_windows">
                        <div class="w-75 d-inline-block mr-2">
                            <label class="d-block">
                                Bidder Start Time
                                <el-tooltip>
                                    <div class="text-left" slot="content">
                                        This time is automatically created when clicking "Create Bid Windows." You can
                                        modify the time for individual controllers by changing the start time here.
                                    </div>
                                    <i class="fas fa-question-circle"></i>
                                </el-tooltip>
                            </label>

                            <fg-input>
                                <el-date-picker v-model="Bidder.start"
                                                type="datetime"
                                                format="MM-dd-yyyy HH:mm"
                                                placeholder="Select window start"
                                                :picker-options="{ step: '00:05' }" />
                            </fg-input>
                        </div>
                        <b>{{ tz }}</b>
                    </div>
                    <div class="col-md-12 col-lg-6" v-else>
                        <label class="d-block">
                            Bidder Up To Bid
                            <el-tooltip>
                                <div class="text-left" slot="content">
                                    The system handles "up to bid" automatically as bids are entered. You can
                                    override whether a controller is able to bid using this switch.
                                </div>
                                <i class="fas fa-question-circle"></i>
                            </el-tooltip>
                        </label>

                        <n-switch v-model="Bidder.up_to_bid"
                                  on-text="ON"
                                  :on-value="1"
                                  :off-value="0"
                                  color="bg-lightblue"
                                  class="align-top ml-2"></n-switch>
                    </div>

                    <div class="col-md-12 col-lg-6">
                        <label class="d-block">
                            Skip Round
                            <el-tooltip>
                                <div class="text-left" slot="content">
                                    Bidder has skipped or doesn't have enough leave to bid for this round. You can remove
                                    the skip for this round below. If you disable the skip, and the bidder previously skipped
                                    and indicated "Done Bidding" this will be removed for subsequent rounds.
                                </div>
                                <i class="fas fa-question-circle"></i>
                            </el-tooltip>
                        </label>

                        <n-switch v-model="Bidder.skipped"
                                  on-text="ON"
                                  :on-value="1"
                                  :off-value="0"
                                  color="bg-lightblue"
                                  class="align-top ml-2"></n-switch>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col text-center">
                        <n-button round type="success" @click.native="updateBidder()" class="mr-2">Save Changes</n-button>
                        <n-button round type="default" @click.native="visible = false">Cancel</n-button>
                    </div>
                </div>
            </form>
        </el-dialog>
    </span>
</template>

<script>
import { Dialog, Tooltip, DatePicker, TimeSelect } from 'element-ui'
import { Switch } from '@/components/stateless'
import { mapGetters } from 'vuex'

export default {
  name: 'edit-bidder',
  components: {
    [Dialog.name]: Dialog,
    [Tooltip.name]: Tooltip,
    [DatePicker.name]: DatePicker,
    [TimeSelect.name]: TimeSelect,
    [Switch.name]: Switch
  },
  props: {
    round: Object,
    bidder: Object
  },
  data () {
    return {
      Bidder: {},
      visible: false
    }
  },
  methods: {
    updateBidder () {
      // Create the payload
      const payload = {
        bidder_id: this.Bidder.id,
        changes: this.Bidder
      }

      // Handle deleting of skip bid
      if (this.bidder.skipped && !this.Bidder.skipped) {
        payload.changes.skipped_by = false
        payload.changes.skipped_at = null
      }

      // Submit the update
      this.$store.dispatch('bidder/update', payload)
        .then(() => {
          this.visible = false
        })
    }
  },
  computed: {
    ...mapGetters({
    }),
    dialogWidth () {
      return this.screenSize !== 'lg' && this.screenSize !== 'xl' ? 90 : 50
    }
  },
  created () {
    this.Bidder = JSON.parse(JSON.stringify(this.bidder))
  }
}
</script>
