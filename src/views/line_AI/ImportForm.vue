<template>
    <el-dialog title="Import Lines From Previous Year"
               width="80%"
               top="1vh"
               :close-on-click-modal="false"
               :visible.sync="visible">
        <form method="POST" enctype="multipart/form-data" class="line-group-form">
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <div class="row align-items-center">
                        <div class="col">
                            <h6 class="d-block">Select Line Group</h6>
                            <small>
                                Select the year and Line Group to import Lines from. You can select any Line Group still
                              saved in the system. <br><strong>This will delete all lines in the CURRENT Line Group!</strong>
                            </small>
                        </div>
                        <div class="col-5 text-center">
                          <multiselect
                              class="w-100 mx-auto"
                              v-model="sourceGroup"
                              tag-placeholder=""
                              placeholder="Select Line Group to import Lines from"
                              track-by="id"
                              :custom-label="groupLabel"
                              :options="filteredGroups"
                              :multiple="false"
                              :searchable="true"
                              :internal-search="true"
                              :close-on-select="true"
                              :clear-on-select="true"
                              :options-limit="300"
                              select-label=""
                              :hide-selected="true"
                              deselect-label="" />
                        </div>
                    </div>
                </li>
            </ul>
        </form>
        <div slot="footer">
            <n-button round type="info" @click.native="visible = false">
              Cancel
            </n-button>
            <n-button round type="success" @click.native="importLines" :disabled="$store.getters['loading']">
              Import Lines
            </n-button>
        </div>
    </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { Dialog } from 'element-ui'
import Multiselect from 'vue-multiselect'
import { RepositoryFactory } from '@/repositories/RepositoryFactory'

const LineGroupRepository = RepositoryFactory.get('linegroup')

export default {
  name: 'import-form',
  props: {
    show: Boolean,
    currentGroupId: Number
  },
  components: {
    [Dialog.name]: Dialog,
    Multiselect
  },
  data () {
    return {
      visible: false,
      groups: [],
      sourceGroup: null
    }
  },
  methods: {
    fetchLineGroups () {
      LineGroupRepository.index()
        .then(r => {
          this.groups = r.data
        })
    },
    importLines () {
      this.$confirm('Are you sure you want to import lines from the selected Line Group? <br><strong>This will delete all lines in the current Line Group!</strong>', 'Import Lines', {
        type: 'info',
        confirmButtonText: 'Import Lines',
        dangerouslyUseHTMLString: true
      }).then(() => {
        LineGroupRepository.import(this.currentGroupId, this.sourceGroup.id)
          .then(r => {
            this.visible = false
            this.$emit('update', r.data)
          })
      })
    },
    groupLabel ({ year, name, active }) {
      return `${year} - ${name}`
    }
  },
  computed: {
    ...mapGetters({}),
    filteredGroups () {
      return _.filter(this.groups, g => {
        return g.id !== this.currentGroupId
      })
    }
  },
  created () {},
  watch: {
    /** Display form */
    visible (n) {
      if (n) { this.fetchLineGroups() }
      this.$emit('update:show', n)
    },
    show (n) {
      this.visible = n
    }
  }
}
</script>
