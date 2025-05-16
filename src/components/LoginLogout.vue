<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn v-bind="props">
        {{ authStore.user?.fname || 'Guest' }}
        <v-icon class="ms-1">caret-down</v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item v-if="authStore.user">
        <h3>{{ authStore.user.full_name }}</h3>
        <small v-if="authStore.user.member_id">Member Number: {{ authStore.user.member_id }}</small>
      </v-list-item>
      <v-list-item
        v-if="authStore.loggedIn"
        prepend-icon="right-from-bracket"
        title="Logout"
        @click="logout"
      />
      <v-list-item
        v-else
        prepend-icon="right-to-bracket"
        title="Login"
        @click="login"
      />
    </v-list>
  </v-menu>
</template>

<script setup>
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()

  const login = () => {
    authStore.login()
  }

  const logout = async () => {
    await authStore.logout()
  }
</script>

<style scoped>
.v-list-item h3 {
  margin-bottom: 4px;
}

.v-list-item small {
  opacity: 0.7;
}
</style>
