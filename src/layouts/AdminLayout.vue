<template>
  <v-layout>
    <v-navigation-drawer
      v-model="drawer"
      class="mynatca-sidebar-bg"
      :permanent="display.lgAndUp.value"
      :temporary="!display.lgAndUp.value"
      theme="dark"
    >
      <!-- Close button - only visible on mobile -->
      <div
        v-if="!display.lgAndUp.value"
        class="close-btn"
        :class="{ 'close-btn-visible': drawer }"
        @click="drawer = false"
      >
        <v-icon icon="xmark" />
      </div>

      <v-img
        aspect-ratio="16/9"
        class="mx-auto mt-6"
        cover
        src="@/assets/natca-logo.png"
        :width="100"
      />

      <v-list>
        <v-list-item
          exact
          link
          prepend-icon="house"
          title="FACILITY HOME"
          :to="{name: 'facility.home'}"
        />
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
          :to="{name: 'facility.config'}"
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      color="#ECECF1"
      density="compact"
      title="NATCA Document Management System"
    >
      <template #prepend>
        <!-- Only show hamburger on mobile -->
        <v-app-bar-nav-icon
          v-if="!display.lgAndUp.value"
          @click="drawer = !drawer"
        >
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
  /* Imports */
  import AppFooter from '@/layouts/Footer.vue'
  import { onMounted, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'

  /* Setup */
  const route = useRoute();
  const display = useDisplay();

  /* Data */
  const drawer = ref(true); // Single drawer state

  /* Lifecycle */
  // Set initial drawer state based on screen size
  onMounted(() => {
    drawer.value = display.lgAndUp.value;
  });

  /* Watchers */
  // Update drawer when screen size changes
  watch(display.lgAndUp, isLargeScreen => {
    drawer.value = isLargeScreen;
  });

  // Close drawer on navigation for mobile
  watch(() => route.fullPath, () => {
    if (!display.lgAndUp.value) {
      drawer.value = false;
    }
  });
</script>

<style scoped>
.v-navigation-drawer a {
  text-decoration: none;
  color: inherit;
}

/* Close button styles */
.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transform: scale(0.5) rotate(-90deg);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Animation for when drawer opens */
.close-btn-visible {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

/* Icon color */
/* noinspection CssUnusedSymbol */
.close-btn .v-icon {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
}
</style>
