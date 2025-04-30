<template>
  <v-main>
    <!--    <v-navigation-drawer-->
    <!--      class="mynatca-sidebar-bg"-->
    <!--      permanent-->
    <!--      theme="dark"-->
    <!--    >-->
    <!--      <v-img-->
    <!--        aspect-ratio="16/9"-->
    <!--        class="mx-auto mt-6"-->
    <!--        cover-->
    <!--        src="@/assets/natca-logo.png"-->
    <!--        :width="100"-->
    <!--      />-->

    <!--      <v-list v-model:opened="open">-->
    <!--        <v-list-item>-->
    <!--          <a href="https://my.natca.org">-->
    <!--            <v-icon icon="chevron-left" />-->
    <!--            Return to MyNATCA-->
    <!--            <font-awesome-icon icon="fa-kit fa-mynatca-icon" size="2x" />-->
    <!--          </a>-->
    <!--        </v-list-item>-->
    <!--        <v-list-item title="Logos" to="/logos" />-->

    <!--        &lt;!&ndash; Nested items using v-list-group &ndash;&gt;-->
    <!--        <v-list-group value="Contracts">-->
    <!--          <template #activator="{ props }">-->
    <!--            <v-list-item-->
    <!--              v-bind="props"-->
    <!--              title="Contracts/MOUs"-->
    <!--            />-->
    <!--          </template>-->
    <!--          <v-list-item title="Slate" />-->
    <!--          <v-list-item title="Purple" />-->
    <!--        </v-list-group>-->
    <!--        <v-list-item title="Charters" />-->
    <!--      </v-list>-->
    <!--    </v-navigation-drawer>-->

    <!--    <v-app-bar-->
    <!--      color="#ECECF1"-->
    <!--      density="compact"-->
    <!--      title="NATCA Document Management System"-->
    <!--    >-->
    <!--      <template #append>-->
    <!--        <v-menu>-->
    <!--          <template #activator="{ props }">-->
    <!--            <v-btn append-icon="caret-down" v-bind="props">Jason</v-btn>-->
    <!--          </template>-->

    <!--          <v-list>-->
    <!--            <v-list-item>-->
    <!--              <h3>Jason Doss</h3>-->
    <!--              <small>Member Number: 40162</small>-->
    <!--            </v-list-item>-->
    <!--            <v-list-item append-icon="right-from-bracket" title="Logout" />-->
    <!--          </v-list>-->
    <!--        </v-menu>-->
    <!--      </template>-->
    <!--    </v-app-bar>-->
    <router-view />
  </v-main>

  <AppFooter />
</template>

<script setup>
  import AppFooter from '@/layouts/Footer.vue'
  import { ref } from 'vue'
  const open = ref([])
</script>

<style scoped>
.v-navigation-drawer a {
  text-decoration: none;
  color: inherit;
}
</style>
