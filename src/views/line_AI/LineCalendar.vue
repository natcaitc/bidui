<template>
    <span>
        <a href="#/" @click.prevent="show = true" class=" text-decoration-none">
            <i class="fas fa-calendar font-weight-light"></i> View Calendar
        </a>

        <el-dialog title="Basic Watch Schedule"
                   width="60%"
                   :visible.sync="show"
                   append-to-body>
            <div class="row justify-content-center mt-2">
                <div class="col-10">
                    <full-calendar defaultView="dayGridMonth"
                                   :plugins="calendarPlugins"
                                   :events="shifts"
                                   :header="{
                                        left: 'title',
                                        center: '',
                                        right: 'prev,next'
                                    }"
                                   :valid-range="validRange"
                                   :height="420"
                                   default-date="2020-01-01"></full-calendar>
                </div>
            </div>
        </el-dialog>
    </span>
</template>
<script>
    import { mapGetters } from "vuex";
    import FullCalendar from '@fullcalendar/vue'
    import dayGridPlugin from "@fullcalendar/daygrid";
    import { Dialog } from "element-ui";
    import { lineShifts } from "./LinesToShifts";

    export default {
        name: 'line-calendar',
        components: {
            FullCalendar,
            [Dialog.name]: Dialog,
        },
        props: {
            line: {},
        },
        data() {
            return {
                show: false,
                calendarPlugins: [dayGridPlugin],
                validRange: {},
            }
        },
        computed: {
            ...mapGetters({
                start: 'facility/leaveYearStart',
                end: 'facility/leaveYearEnd',
            }),
            startFormat() {
                return this.start.format('YYYY-MM-DD');
            },
            endFormat() {
                return this.end.clone().format('YYYY-MM-DD')
            },
            shifts() {
                return lineShifts(this.line, this.start, this.end);
            },
        },
        created() {
            this.validRange = {
                start: this.startFormat,
                end: this.endFormat,
            };
        }
    }
</script>
<style>
    @import '~@fullcalendar/core/main.css';
    @import '~@fullcalendar/daygrid/main.css';
</style>
