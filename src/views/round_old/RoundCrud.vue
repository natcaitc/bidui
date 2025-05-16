<template>
  <span>
    <drop-down class="edit-link" position="right" tag="div">
      <template #title>
        <span class="">
          <i class="fas fa-cog cursor-pointer" />
        </span>
      </template>

      <a
        class="dropdown-item py-0"
        href="/#"
        @click.prevent="showNewRoundForm = true"
      >
        <i class="fas fa-plus" /> Create New Round</a>

      <a
        v-if="round.number !== 0"
        class="dropdown-item py-0 text-danger"
        href="#"
        @click.prevent="deleteRound()"
      >
        <i class="fas fa-trash" /> Delete {{ round.name }}
      </a>
    </drop-down>

    <el-dialog
      v-model:visible="showNewRoundForm"
      :close-on-click-modal="false"
      title="Create New Round"
      top="1vh"
      :width="dialogWidth + '%'"
    >
      <form class="roster-form" enctype="multipart/form-data" method="POST">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <div class="row align-items-center">
              <div class="col">
                <h6>Select Roster</h6>
                <small>One roster can be used for multiple rounds, or define a new roster for each round.
                  <router-link to="rosters">Manage Rosters</router-link>
                </small>

                <el-select v-model="newRoundRosterId" class="w-100 select-primary">
                  <el-option
                    v-for="roster in rosters"
                    :key="roster.id"
                    class="select-primary"
                    :label="roster.name"
                    :value="roster.id"
                  />
                </el-select>
              </div>
            </div>
          </li>
        </ul>
      </form>
      <template #footer>
        <div>
          <n-button round type="info" @click.native="showNewRoundForm = false">Cancel</n-button>
          <n-button :disabled="$store.getters['loading']" round type="success" @click.native="createRound">Save Roster
          </n-button>
        </div>
      </template>
    </el-dialog>
  </span>
</template>
<script>
  import DropDown from '@/components/stateless/DropDown'
  import { Dialog, Option, Select } from 'element-ui'

  export default {
    name: 'RoundCrud',
    components: {
      DropDown,
      [Dialog.name]: Dialog,
      [Select.name]: Select,
      [Option.name]: Option,
    },
    props: {
      round: Object,
      rosters: Array,
    },
    data () {
      return {
        showNewRoundForm: false,
        newRoundRosterId: null,
      }
    },
    computed: {
      dialogWidth () {
        return this.screenSize !== 'lg' && this.screenSize !== 'xl' ? 90 : 40
      },
    },
    methods: {
      createRound () {
        this.$emit('create-round_AI', { roster_id: this.newRoundRosterId })
        this.showNewRoundForm = false
      },
      deleteRound () {
        this.$emit('delete-round_AI')
      },
    },
  }
</script>
<style>
    #round-container .edit-link {
        margin-top: -80px;
        margin-right: -10px;
        /*position: relative;*/
        /*top: -25px;*/
        /*right: 0;*/
        /*float: right;*/
        /*!*margin-top: -50px;*!*/
        /*z-index: 9000;*/
    }
    #round-container .el-tabs__content {
        overflow: visible !important;
    }

</style>
