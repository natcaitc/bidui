<template>
        <tr class="d-flex cursor-pointer line-row"
            :style="'background-color:' + ( line.bgcolor ? line.bgcolor : 'white' ) + ' !important'"
            @click="click(null, $event)">
            <td id="id" :class="bidMode ? 'text-center col-4 col-md-2' : 'col-3 col-md-1'" class="py-0 align-middle">
                <i v-if="!bidMode && is('arearep', area.id)"
                   class="d-none d-md-inline-block fas fa-grip-vertical text-primary mr-2"></i>

                <n-button v-if="bidMode && !line.bid_id"
                          id="bid-button"
                          @click.native="$emit('bid', line)"
                          round
                          small
                          :type="isBid ? 'success' : 'info'"
                          :disabled="!canBidLine || (!biddable && !isBid)"
                          class="px-3 py-1 my-1">
                    Bid <br v-if="screenSize === 'xs' || screenSize === 'sm'"><b>{{ line.name }}</b>
                </n-button>
                <b v-else-if="bidMode" class="text-uppercase font-weight-bold align-middle">
                    {{ line.bid_id ? line.bid_init : ''}}
                </b>
                <b v-else>{{ i + 1 }}</b>
            </td>
            <td class="col-1 text-center text-uppercase font-weight-bold align-middle" v-if="!bidMode" >
                {{ line.bid_id ? ( checkPrivacy ? line.bid_init : '**' ) : ''}}
            </td>

            <td class="d-table-cell d-md-none col-8">
                <div class="w-100" v-for="detail in line.details" :key="detail.id" v-html="shortLineDetails(detail)" />
                <div v-if="line.notes"><b>Note:</b> {{ line.notes }}</div>
            </td>
            <td class="d-none d-md-table-cell col-md-8 p-0">
                <div v-for="(detail, di) in line.details"
                     :key="di"
                     class="row no-gutters text-center align-baseline"
                     :class="{
                         'detail-top-border': line.details.length > 1 && di !== 0,
                         'h-100': line.details.length === 1,
                      }">
                    <!--                                                    <div class="col border-right">{{ detail.start || '&#45;&#45;' }}</div>-->
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.su }">{{ detail.su }}</div>
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.mo }">{{ detail.mo }}</div>
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.tu }">{{ detail.tu }}</div>
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.we }">{{ detail.we }}</div>
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.th }">{{ detail.th }}</div>
                    <div class="flex-grow-1 shift" :class="{ rdo: !detail.fr }">{{ detail.fr }}</div>
                    <div class="flex-grow-1 shift no-border" :class="{ rdo: !detail.sa }">{{ detail.sa }}</div>
                </div>
            </td>
            <td class="d-none d-md-table-cell col-md-2" v-if="bidMode">{{ line.notes }}</td>
<!--            <td class="text-center text-uppercase font-weight-bold align-middle">-->
<!--                <a class="text-success cursor-pointer"-->
<!--                   v-if="!line.bid && canBid && line.employee_type === bidder.member.employee_type_id"-->
<!--                   @click.prevent="bidLine(line)">-->
<!--                    <i class="fas fa-clipboard fa-lg mr-1"></i> Bid-->
<!--                </a>-->
<!--                <a class="text-warning cursor-pointer"-->
<!--                   v-else-if="lineBids[activeGroup] && lineBids[activeGroup] === line.id"-->
<!--                   @click="unbidLine(line)">-->
<!--                    <i class="fas fa-clipboard-check fa-lg mr-1"></i> Bid-->
<!--                </a>-->

<!--                <b v-else-if="line.bid && line.bid.controller">{{-->
<!--                    line.bid.controller.init }}</b>-->

<!--            </td>-->
            <td class="d-none d-md-table-cell col-md-2 align-middle text-right" v-if="!bidMode" id="admin">
                <line-form v-if="showLineForm"
                          v-model="line"
                          :line-group="selectedGroup"
                          :crews="crews"></line-form>

                <!--                                                {{ Tenant.employeeTypes[line.employee_type].type_tag | uppercase }}-->
                <el-tooltip effect="dark" :content="line.notes" v-if="line.notes">
                    <i class="fas fa-comment mr-1"></i>
                </el-tooltip>
                <i class="fas fa-copy cursor-pointer mr-1"
                   v-if="is('arearep', area.id)"
                   @click="click('copy')"></i>
                <i class="fas fa-edit cursor-pointer mr-1"
                   v-if="is('arearep', area.id)"
                   @click.prevent="click('edit')"></i>
                <i class="fas fa-trash text-danger cursor-pointer"
                   v-if="is('arearep', area.id) && !line.bid_init"
                   @click="del(line.name)" />
            </td>
        </tr>
</template>

<script>
import { mapGetters } from 'vuex'
import LineForm from './LineForm'

export default {
  name: 'line-row',
  components: {
    LineForm
  },
  props: {
    i: Number,
    line: {
      type: [Object, String]
    },
    crew: Object,
    bidMode: Boolean,
    canBidLine: Boolean,
    biddable: Boolean,
    isBid: Boolean
  },
  data () {
    return {
      showFlyover: false,
      showLineForm: false
    }
  },
  methods: {
    click (action = null, $event = null) {
      this.$emit('click') // Select line

      // Trigger additional actions
      if (action) { this.$emit(action) }

      // User is viewing the line if they click outside the specified objects
      if ($event) {
        const test = (e) => $event.target.id !== e && $event.target.parentNode.id !== e
        const exclude = [
          'admin',
          'id',
          'bid-button'
        ]
        if (exclude.every(test)) { this.$emit('view', this.line) } // View the line details
      }
    },
    del (name) {
      this.$confirm('Are you sure you want to delete the ' + name + ' line?', 'Warning', {
        type: 'warning',
        confirmButtonText: 'Delete Line'
      }).then(() => {
        this.$emit('delete')
      })
    },
    hide () {
      this.showFlyover = false
    },
    shortLineDetails (detail) {
      return this.shortLine(detail, 'su') + ' | ' +
                    this.shortLine(detail, 'mo') + ' | ' +
                    this.shortLine(detail, 'tu') + ' | ' +
                    this.shortLine(detail, 'we') + ' | ' +
                    this.shortLine(detail, 'th') + ' | ' +
                    this.shortLine(detail, 'fr') + ' | ' +
                    this.shortLine(detail, 'sa')
    },
    shortLine (detail, day) {
      return detail[day] ? detail[day] + ' <small>(' + detail[day + '_length'] + ')</small>' : "<small class='font-weight-bold'>RDO</small>"
    }
  },
  computed: {
    ...mapGetters({
      facility: 'facility/facility',
      checkPrivacy: 'facility/checkPrivacy',
      area: 'area/area',
      is: 'auth/is'
    }),
    title () {
      return !_.isEmpty(this.line) ? 'Line ' + this.line.line : ''
    }
  },
  watch: {
    line (n) {
      if (n !== '') { this.showFlyover = true }
    }
  }
}
</script>
