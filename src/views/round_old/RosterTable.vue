<template>
  <table class="results table">
    <thead>
      <tr>
        <th colspan="9">{{ roster.name }} Roster</th>
      </tr>
    </thead>

    <template v-if="!round.bidders_created && round.status === 'new'">
      <pre-bid-roster
        v-for="team in roster.teams"
        :key="team.id"
        :editable="false"
        :team="team"
        :team-members="members[team.id]"
        @refresh="fetchMembers()"
      />
    </template>
    <template v-else>
      <bid-roster
        v-for="team in roster.teams"
        v-bind="{ team, round }"
        :key="team.id"
        :bidders="bidders[team.id]"
      />
    </template>
  </table>
</template>

<script>
  import PreBidRoster from './PreBidRoster'
  import BidRoster from './BidRoster'
  import { RepositoryFactory } from '@/repositories/RepositoryFactory'
  const RosterRepository = RepositoryFactory.get('roster')

  export default {
    name: 'RosterTable',
    components: {
      PreBidRoster,
      BidRoster,
    },
    props: {
      roster_id: Number,
      round: Object,
    },
    data () {
      return {
        members: [],
        roster: {},
      }
    },
    computed: {
      /** If Round is ACTIVE then use bidders from VUEX */
      bidders () {
        return this.$store.getters['bidder/roundBidders'](this.round.id)
      },
    },
    watch: {
      roster_id () {
        this.fetchRoster()
        this.fetchMembers() // Roster only changeable until round started
      },
      'round.status' (n, o) { // Handle round reset changing to new status
        if (n === 'new' && o !== 'new') {
          this.fetchMembers()
        }
      },
    },
    created () {
      this.fetchRoster()

      // Load roster if new round, otherwise load bidders
      if (this.round.status === 'new') {
        this.fetchMembers()
      }
    },
    methods: {
      fetchRoster () {
        return RosterRepository.get(this.roster_id)
          .then(r => {
            this.roster = r.data
          })
      },
      /** If Round is INACTIVE then use roster members */
      fetchMembers () {
        return RosterRepository.getMembers(this.roster_id)
          .then(response => {
            // Populate members by team_id
            this.members = _.groupBy(response.data, m => m.roster_team_id)

            // Make sure empty teams have an entry
            this.roster.teams.forEach(t => {
              if (!Object.keys(this.members).includes(String(t.id))) this.members[t.id] = []
            })
          })
      },
    },
  }
</script>

<style scoped>

</style>
