<template>
    <el-dialog title="Configure Line Group"
               width="80%"
               top="1vh"
               :close-on-click-modal="false"
               :visible.sync="visible">
        <form method="POST" enctype="multipart/form-data" class="line-group-form">
            <ul class="list-group list-group-flush">
                <li class="list-group-item">
                    <div class="row align-items-center">
                        <div class="col">
                            <h6 class="d-block">Activate Line Group</h6>
                            <small>
                                When activated controllers will be required to select a line from this group during bidding.
                            </small>
                        </div>
                        <div class="col-5 text-center">
                            &nbsp;<el-switch
                                style="display: block"
                                v-model="value.active"
                                active-color="#13ce66"
                                inactive-color="#ff4949"
                                :active-value="1"
                                :inactive-value="0"
                                class="mt-2">
                            </el-switch>
                        </div>
                    </div>
                </li>
                <li class="list-group-item">
                    <div class="row align-items-center">
                        <div class="col">
                            <h6>Name</h6>
                            <small>
                                Unique name for the line group. Controllers will not see this if only one line group
                                is active for the bidding process.
                            </small>
                        </div>
                        <div class="col-5">
                            <fg-input v-model="value.name"></fg-input>
                        </div>
                    </div>
                </li>
                <li class="list-group-item">
                    <div class="row align-items-center">
                        <div class="col">
                            <h6>Start/End Dates</h6>
                            <small>
                                Defaults to entire leave year. If bidding multiple line groups (trimesters,
                                summer/winter, etc) set dates to correspond with MOU. When a controller views
                                available leave slots their schedule will reflect the different line groups.
                            </small>
                        </div>

                        <div class="col-5">
                            <date-picker v-model="range"
                                         is-range
                                         :min-date="minDate"
                                         :max-date="maxDate"
                                         @input="setDates"
                                         :columns="2">
                                <template v-slot="{ inputValue, inputEvents }">
                                    <fg-input class="d-inline-block"
                                              :value="inputValue.start"
                                              v-on="inputEvents.start"></fg-input>
                                    <div class="d-inline-block mx-2">
                                        <i class="fas fa-long-arrow-alt-right" />
                                    </div>
                                    <fg-input class="d-inline-block"
                                              :value="inputValue.end"
                                              v-on="inputEvents.end"></fg-input>
                                </template>
                            </date-picker>
                        </div>
                    </div>
                </li>
            </ul>
        </form>
        <div slot="footer">
            <n-button round type="info" @click.native="visible = false">Cancel</n-button>
            <n-button round type="success" @click.native="save" :disabled="$store.getters['loading']">Save Line Group
            </n-button>
        </div>
    </el-dialog>
</template>
<script>
    import {mapGetters} from "vuex";
    import { Dialog, Switch } from "element-ui";
    import DatePicker from 'v-calendar/lib/components/date-picker.umd'

    export default {
        name: 'line-group-form',
        props: {
            value: Object,
            show: Boolean,
        },
        components: {
            [Dialog.name]: Dialog,
            [Switch.name]: Switch,
            DatePicker
        },
        data() {
            return {
                Group: {},
                visible: false,
                range: {
                    start: null,
                    end: null,
                },
            }
        },
        methods: {
            save() {
                if (this.Group.id === null) {
                    this.$emit('create', this.Group);
                } else {
                    this.$emit('update', this.Group);
                }
            },
            setDates(v) {
                this.Group.start_day = v.start;
                this.Group.end_day = v.end;
            },
        },
        computed: {
            ...mapGetters({
                leaveYearStart: 'facility/leaveYearStart',
                leaveYearEnd: 'facility/leaveYearEnd',
            }),
            /** Hack dates for vDatePicker, uses localized dates instead of UTC */
            minDate() {
                return this.vDatePickerUTCHack(this.leaveYearStart);
            },
            maxDate() {
                return this.vDatePickerUTCHack(this.leaveYearEnd);
            },
        },
        created() {
            this.Group = this.value;
        },
        watch: {
            /** V-Model */
            value(n) {
                this.Group = n
                this.range.start = n.start_day;
                this.range.end = n.end_day;
            },
            Group(n) {
                this.$emit('input', n);
            },
            /** Display form */
            visible(n) {
                this.$emit('update:show', n);
            },
            show(n) {
                this.visible = n;
            },
        }
    }
</script>
