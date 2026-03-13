<template>
  <div class="component-card">
    <h2>Novi prijedlog troška</h2>
    <div class="form-group">
      <label for="opis">Opis troška</label>
      <input id="opis" v-model="opis" placeholder="npr. Benzin za put..." />
    </div>
    <div class="form-group">
      <label for="iznos">Iznos (ETH)</label>
      <input id="iznos" v-model="iznos" type="number" placeholder="0.1" />
    </div>
    <button @click="kreirajPrijedlog" :disabled="loading">
      {{ loading ? "Kreiram..." : "Dodaj prijedlog" }}
    </button>
    <p v-if="poruka" class="success">{{ poruka }}</p>
    <p v-if="greska" class="error">{{ greska }}</p>
  </div>
</template>

<script>
import { ethers } from "ethers";

export default {
  name: "CreateProposal",
  props: {
    contract: { type: Object, required: true },
  },
  emits: ["refresh"],
  data() {
    return {
      opis:    "",
      iznos:   "",
      poruka:  "",
      greska:  "",
      loading: false,
    };
  },
  methods: {
    async kreirajPrijedlog() {
      this.poruka = "";
      this.greska = "";

      if (!this.opis.trim()) {
        this.greska = "Unesite opis troška.";
        return;
      }
      if (!this.iznos || Number(this.iznos) <= 0) {
        this.greska = "Unesite ispravan iznos.";
        return;
      }

      this.loading = true;
      try {
        const tx = await this.contract.createProposal(
          this.opis,
          ethers.parseEther(this.iznos.toString())
        );
        await tx.wait();
        this.poruka = "Prijedlog uspješno dodan!";
        this.opis   = "";
        this.iznos  = "";
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