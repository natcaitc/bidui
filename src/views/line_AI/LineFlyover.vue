<template>
    <flyover :title="line.name" :show="true" @closed="$emit('closed')">
        <h6 class="d-inline-block mr-2">Line Details</h6>
        <line-calendar :line="line"></line-calendar>

        <div class="row no-gutters text-center font-weight-bold border-bottom border-dark">
            <div class="col">SU</div>
            <div class="col">MO</div>
            <div class="col">TU</div>
            <div class="col">WE</div>
            <div class="col">TH</div>
            <div class="col">FR</div>
            <div class="col">SA</div>
        </div>

        <template v-for="(detail, i) in line.details">
            <div v-if="line.repeat === 'span'"
                 class="row col font-weight-bold"
                 :class="i === 0 ? 'mt-0' : 'mt-3'"
                 :key="'start-' + detail.id">
                Starting On {{ detail.start }}
            </div>
            <div class="row no-gutters text-center" :key="'shifts-' + detail.id">
                <div class="col shift" :class="{ rdo: !detail.su }">{{ detail.su }}</div>
                <div class="col shift" :class="{ rdo: !detail.mo }">{{ detail.mo }}</div>
                <div class="col shift" :class="{ rdo: !detail.tu }">{{ detail.tu }}</div>
                <div class="col shift" :class="{ rdo: !detail.we }">{{ detail.we }}</div>
                <div class="col shift" :class="{ rdo: !detail.th }">{{ detail.th }}</div>
                <div class="col shift" :class="{ rdo: !detail.fr }">{{ detail.fr }}</div>
                <div class="col shift no-border" :class="{ rdo: !detail.sa }">{{ detail.sa }}</div>
            </div>
        </template>

        <h6>Crew</h6>
        {{ crewName }}

        <h6>Who Can Bid?</h6>
        {{ typeName }}

        <h6 class="mt-3">Notes</h6>
        {{ line.notes || 'N/A' }}
    </flyover>
</template>

<script>
import Flyover from '@/components/stateless/Flyover'
import LineCalendar from './LineCalendar'

export default {
  name: 'LineFlyover',
  components: {
    Flyover,
    LineCalendar
  },
  props: {
    showLineFlyover: Boolean,
    line: Object,
    crews: Array,
    types: Array
  },
  data () {
    return {
      visible: false
    }
  },
  methods: {},
  computed: {
    crewName () {
      return _.find(this.crews, { id: this.line.crew_id }).name
    },
    typeName () {
      return _.find(this.types, { id: this.line.employee_type }).type_name
    },
    isSet () {
      return !_.isEmpty(this.line)
    }
  },
  watch: {
    line (n) {
      this.visible = !_.isEmpty(n)
    },
    showLineFlyover (n) {
      this.visible = n
    },
    visible (n) {
      this.$emit('update:showLineFlyover', n)
    }
  }
}
</script>

<style scoped>
    .row {
        font-size: 0.9rem;
    }
    h6 {
        margin-top: 1em;
    }
</style>
