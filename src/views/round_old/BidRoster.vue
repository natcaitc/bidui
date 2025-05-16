<template>
    <tbody>
        <tr class="subhead cursor-pointer" :key="'tr-' + team.id">
            <td colspan="9">
                {{ team.name }}
            </td>
        </tr>
        <tr>
            <td colspan="9" class="p-0">
                <table class="results table-responsive">
                    <tr class="subhead-light d-flex">
                        <td class="col-6" :class="round.use_bid_windows ? 'col-lg-3' : 'col-lg-6 col-xl-5'">Name</td>
                        <td class="d-none d-sm-table-cell col-sm-1 text-center">Init</td>
                        <td class="col-6 col-sm-5 col-lg-3 col-xl-4 text-center">Status</td>
                        <td class="d-none d-lg-table-cell col-lg-3 col-xl-2" v-if="round.use_bid_windows">Window Start</td>
                        <td style="width: 150px" class="d-none d-lg-table-cell col-lg-2 text-right">Accrued/Accum.</td>
                    </tr>

                    <tr v-for="bidder in bidders" :key="bidder.id" class="d-flex">
                        <td class="col-6" :class="round.use_bid_windows ? 'col-lg-3' : 'col-lg-6 col-xl-5'">
                            <el-tooltip class="item" v-if="is('super')">
                                <p slot="content" class="m-0"><b>Bidder ID:</b> {{  bidder.id }}<br><b>Member #: </b>{{ bidder.member_id }}</p>
                                <i class="fas fa-user-astronaut cursor-pointer" />
                            </el-tooltip>

                            {{ bidder.lname }}, {{ bidder.fname }}

                            <i class="d-sm-none">({{ bidder.init | uppercase }})</i>

                            <span class="pull-right">
                                <router-link :to="{ name: 'Controller Details', params: { facility: $route.params.facility, member_id: bidder.member_id }}">
                                    <i class="fas fa-edit mr-1" />
                                </router-link>

                                <edit-bidder v-if="!bidder.bid"
                                             v-bind="{
                                                round,
                                                bidder
                                            }" />
                            </span>
                        </td>
                        <td class="d-none d-sm-table-cell col-sm-1 text-center text-uppercase">
                            <b>{{ bidder.init }}</b>
                        </td>
                        <td class="col-6 col-sm-5 col-lg-3 col-xl-4 text-left">
                            <bid-button v-bind="{ round, bidder }" small />

                            <member-bid-status v-bind="{ round, bidder }" />
                        </td>
                        <td class="d-none d-lg-table-cell col-lg-3 col-xl-2"
                            v-if="round.use_bid_windows">
                            {{ bidder.start | localDisplay('MM/DD/YYYY HH:mm', true) }}
                        </td>
                        <td class="d-none d-lg-table-cell text-right col-lg-2">
                            {{ bidder.balance_accrued || 0 }} / {{ bidder.balance_accumulated || 0 }}

                            <member-leave class="ml-2"
                                          :name="bidder.full_name"
                                          :member_id="bidder.member_id" />
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </tbody>
</template>

<script>
import { mapGetters } from 'vuex'
import { BidButton, MemberBidStatus, MemberLeave } from '../../components'
import EditBidder from './EditBidder'

export default {
  name: 'bid-roster',
  components: {
    BidButton,
    MemberBidStatus,
    MemberLeave,
    EditBidder
  },
  props: {
    team: Object,
    bidders: Array,
    round: Object,
    showFields: Array
  },
  data () {
    return {
      showMemberLeave: {}
    }
  },
  methods: {
  },
  computed: {
    ...mapGetters({
      is: 'auth/is',
      facility: 'facility/facility',
      area: 'area/area',
      employeeType: 'facility/employeeType',
      roleName: 'auth/roleName'
    })
  },
  watch: {}
}
</script>

<style scoped>

</style>
