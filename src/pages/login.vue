<script setup lang="ts">
import { useAdminStore } from '@/store/admin.store';

const adminStore = useAdminStore();
const { signIn } = adminStore;

const email = ref<string>('');
const login = () => signIn(email.value);
</script>

<template>
  <h1>login</h1>
  <input v-model="email" />
  <v-btn @click="login">Log in</v-btn>
</template>

<style scoped lang="scss"></style>
