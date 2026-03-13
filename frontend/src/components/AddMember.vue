<template>
  <div class="component-card">
    <h2>Dodaj člana</h2>
    <div class="form-group">
      <label for="adresa">Adresa člana</label>
      <input id="adresa" v-model="adresa" placeholder="0x..." />
    </div>
    <button @click="dodajClana" :disabled="loading">
      {{ loading ? "Dodajem..." : "Dodaj člana" }}
    </button>
    <p v-if="poruka" class="success">{{ poruka }}</p>
    <p v-if="greska" class="error">{{ greska }}</p>
  </div>
</template>

<script>
import { ethers } from "ethers";

export default {
  name: "AddMember",
  props: {
    contract: { type: Object, required: true },
  },
  emits: ["refresh"],
  data() {
    return {
      adresa:  "",
      poruka:  "",
      greska:  "",
      loading: false,
    };
  },
  methods: {
    async dodajClana() {
      this.poruka = "";
      this.greska = "";

      if (!this.adresa) {
        this.greska = "Unesite adresu člana.";
        return;
      }

      if (!ethers.isAddress(this.adresa)) {
        this.greska = "Adresa nije ispravnog formata.";
        return;
      }

      this.loading = true;
      try {
        const tx = await this.contract.addMember(this.adresa);
        await tx.wait();
        this.poruka = "Član uspješno dodan! ";
        this.adresa = "";
        this.$emit("refresh");
      } catch (e) {
        this.greska = e.reason || e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>