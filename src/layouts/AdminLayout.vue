<template>
  <v-layout>
    <v-navigation-drawer
      v-model="drawer"
      class="mynatca-sidebar-bg"
      expand-on-hover
      permanent
      :rail="rail"
      theme="dark"
      @click="rail = false"
    >
      <v-img
        aspect-ratio="16/9"
        class="mx-auto mt-6"
        cover
        src="@/assets/natca-logo.png"
        :width="100"
      />

      <v-list>
        <v-list-item
          link
          prepend-icon="clipboard-list"
          title="LINES"
        />

        <v-list-item
          link
          prepend-icon="calendar"
          title="LEAVE SLOTS"
        />

        <v-list-item
          link
          prepend-icon="users"
          title="MANAGE ROSTERS"
        />

        <v-list-item
          link
          prepend-icon="books"
          title="MANAGE ROUNDS"
        />

        <v-list-item
          link
          prepend-icon="square-list"
          title="BID SUMMARY"
        />

        <v-list-item
          link
          prepend-icon="gear"
          title="CONFIGURATION"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      color="#ECECF1"
      density="compact"
      title="NATCA Document Management System"
    >
      <template #prepend>
        <v-app-bar-nav-icon @click="rail = !rail">
          <v-icon>bars</v-icon>
        </v-app-bar-nav-icon>
      </template>
      <template #append>
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props">
              Jason
              <v-icon class="ms-1">caret-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item>
              <h3>Jason Doss</h3>
              <small>Member Number: 40162</small>
            </v-list-item>
            <v-list-item prepend-icon="right-from-bracket" title="Logout" />
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>

    <AppFooter />
  </v-layout>
</template>

<script setup>
  import AppFooter from '@/layouts/Footer.vue'
  import { ref } from 'vue'

  const drawer = ref(true)
  const rail = ref(true)
</script>

<style scoped>
.v-navigation-drawer a {
  text-decoration: none;
  color: inherit;
}
</style>
