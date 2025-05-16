<template>
    <tbody>
        <tr class="subhead cursor-pointer" :key="'tr-' + team.id">
            <td colspan="9" v-if="editable">
                <i class="fas fa-grip-vertical"></i>
                {{ team.name }}
                <i class="fas fa-edit cursor-pointer ml-2" @click="$emit('edit-team', team)"></i>

                <a href="#/" class="text-white float-right" @click.prevent="$emit('search-members', team.id)">
                    <i class="fas fa-plus-circle"></i> Add Controller
                </a>
            </td>
            <td v-else colspan="9">
                {{ team.name }}
            </td>
        </tr>
        <tr>
            <td colspan="9" class="p-0">
                <table class="results table">
                    <tr class="d-flex subhead-light" v-if="!dragTeamActive">
                        <td class="col-7 col-sm-6 col-lg-4 col-xl-4">Name</td>
                        <td class="d-none d-sm-table-cell col-sm-1 text-center">Init</td>
                        <td class="d-none d-lg-table-cell col-xl-3">Type</td>
                        <td class="col-5 col-lg-2 text-center">Role</td>
                        <td class="d-none d-lg-table-cell col-lg-2 text-right">Accrued/Accum.</td>
                    </tr>

                    <draggable v-model="members"
                               :key="'drag-' + team.id"
                               handle=".fa-grip-vertical"
                               group="teams"
                               tag="tbody"
                               @change="$emit('order', $event)">
                        <tr class="d-flex" v-for="(member, i) in members" :key="member.id" v-if="!dragTeamActive" :class="{'bg-lightblue': !member.init }">
                            <td class="col-7 col-sm-6 col-lg-4 col-xl-4">
                                <i v-if="editable" class="fas fa-grip-vertical cursor-pointer"></i>

                                <el-tooltip class="item" v-if="is('super')">
                                    <p slot="content" class="m-0"><b>Member #: </b>{{ member.id }}</p>
                                    <i class="fas fa-user-astronaut cursor-pointer" />
                                </el-tooltip>

                                {{ member.lname }}, {{ member.fname }}

                                <i class="d-sm-none">({{ member.init | uppercase }})</i>

                                <span class="pull-right">
                                    <edit-member :member="member"
                                                 @update-member="updateMember(member, $event)"
                                                 class="ml-1" />
                                </span>

                            </td>
                            <td class="d-none d-sm-table-cell col-sm-1 text-center text-uppercase" @click="editing = member.id">
                                <inline-input v-if="editable"
                                              v-model="member.init"
                                              @blur="$emit('update-member', member)"
                                              container-class="d-block w-100 h-100"
                                              maxlength="2"
                                              input-class="w-100 text-center text-uppercase"></inline-input>
                                <b v-else>{{ member.init }}</b>
                            </td>
                            <td class="d-none d-lg-table-cell col-xl-3">{{ employeeType(member.employee_type_id) ? employeeType(member.employee_type_id).type_name : 'No Profile' }}</td>
                            <td class="col-5 col-lg-2 text-center">
                                <span v-if="member.role_id">{{ roleName(member.role_id) }}</span>
                                <i v-else class="m-0">Not Registered</i>
                            </td>
                            <td class="d-none d-lg-table-cell col-lg-2 text-right">
                                {{ member.balance_accrued || 0 }} / {{ member.balance_accumulated || 0 }}

                                <member-leave class="ml-2"
                                              :name="member.full_name"
                                              @refresh="$emit('refresh')"
                                              :member_id="member.id" />
                            </td>
                        </tr>
                    </draggable>

                </table>
            </td>
        </tr>
    </tbody>
</template>

<script>
import { EditMember, MemberLeave } from '@/components'
import draggable from 'vuedraggable'
import { InlineInput } from '@/components/stateless'
import { mapGetters } from 'vuex'

export default {
  name: 'pre-bid-roster',
  components: {
    EditMember,
    MemberLeave,
    draggable,
    InlineInput
  },
  props: {
    team: Object,
    teamMembers: Array,
    dragTeamActive: Boolean,
    editable: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      members: this.teamMembers
    }
  },
  methods: {
    updateMember (member, update) {
      Object.assign(member, update)
    },
    updateMemberRole (member, roleID) {
      member.role_id = roleID
    }
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
  watch: {
    /** members prop */
    members (n) {
      this.$emit('update:teamMembers', n)
    },
    teamMembers (n) {
      this.members = n
    }
  }
}
</script>

<style scoped>

</style>
