<template>
    <span>
      <el-dropdown trigger="click">
        <span class="el-dropdown-link">
          <i class="fas fa-cog cursor-pointer"/>
        </span>

        <el-dropdown-menu>
          <el-dropdown-item @click.native="showForm(true)" :disabled="viewingPastYear">
            <i class="fas fa-plus"></i> Create New Group
          </el-dropdown-item>

          <el-dropdown-item @click.native="duplicate()">
            <i class="fas fa-copy"></i> Duplicate Group
          </el-dropdown-item>

          <el-dropdown-item @click.native="showImportForm = true">
            <i class="fas fa-file-import"></i> Import Lines
          </el-dropdown-item>

          <el-dropdown-item @click.native="showForm()" :disabled="viewingPastYear">
            <i class="fas fa-sliders-h"></i> Manage <b>{{ group.name }}</b> Group Settings
          </el-dropdown-item>

          <el-dropdown-item v-if="canDelete" class="text-danger" @click.native="deleteGroup()">
            <i class="fas fa-trash"/> Delete Group
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <line-group-form v-model="Group"
                       :show.sync="showGroupForm"
                       @create="create"
                       @update="update" />

      <import-form :show.sync="showImportForm"
                   :current-group-id="group.id"
                   @update="$emit('refresh')"/>
    </span>
</template>
<script>
import LineGroupForm from './LineGroupForm'
import ImportForm from './ImportForm'
import { mapGetters } from 'vuex'
import { RepositoryFactory } from '@/repositories/RepositoryFactory'

const LineGroupRepository = RepositoryFactory.get('linegroup')

export default {
  name: 'line-group-crud',
  components: {
    LineGroupForm,
    ImportForm
  },
  props: {
    group: {},
    canDelete: Boolean
  },
  data () {
    return {
      showGroupForm: false,
      showImportForm: false,
      Group: {}
    }
  },
  methods: {
    create (Group) {
      LineGroupRepository.create(Group)
        .then((response) => {
          this.showGroupForm = false
          this.$emit('new-group', response.data)
        })
    },
    deleteGroup () {
      // Confirm before deleting
      this.$confirm('This will permanently delete the Line Group. Continue?', 'Warning', {
        type: 'warning'
      }).then(() => {
        LineGroupRepository.delete(this.group.id)
          .then(() => {
            this.showGroupForm = false
            this.$emit('delete-group', this.group)
          })
      }).catch(() => {})
    },
    duplicate () {
      LineGroupRepository.duplicate(this.group.id)
        .then((response) => {
          this.$emit('new-group', response.data)
        })
    },
    init () {
      return {
        id: null,
        area_id: this.area.id,
        year: this.facility.bid_year,
        name: '',
        start_day: this.leaveYearStart,
        end_day: this.leaveYearEnd,
        active: true
      }
    },
    showForm (creating = false) {
      if (creating) {
        // Create a new group with a fresh instance
        this.Group = this.init()
      } else {
        // Lose the reactivity to edit this group
        this.Group = JSON.parse(JSON.stringify(this.group))
      }
      this.showGroupForm = true
    },
    update (Group) {
      LineGroupRepository.update(Group.id, Group)
        .then((response) => {
          this.showGroupForm = false
          this.$emit('update-group', response.data)
        })
    }
  },
  computed: {
    ...mapGetters({
      facility: 'facility/facility',
      viewingPastYear: 'facility/viewingPastYear',
      leaveYearStart: 'facility/leaveYearStart',
      leaveYearEnd: 'facility/leaveYearEnd',
      area: 'area/area'
    })
  }
}
</script>
<style>
</style>
