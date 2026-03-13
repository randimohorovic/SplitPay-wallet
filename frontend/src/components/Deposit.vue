<template>
  <div class="component-card">
    <h2>Uplata u fond</h2>
    <div class="form-group">
      <label for="iznos">Iznos (ETH)</label>
      <input id="iznos" v-model="iznos" type="number" placeholder="0.1" />
    </div>
    <button @click="deposit" :disabled="loading">
      {{ loading ? "Šaljem..." : "Uplati" }}
    </button>
    <p v-if="poruka" class="success">{{ poruka }}</p>
    <p v-if="greska" class="error">{{ greska }}</p>
  </div>
</template>

<script>
import { ethers } from "ethers";

export default {
  name: "Deposit",
  props: {
    contract: { type: Object, required: true },
  },
  emits: ["refresh"],
  data() {
    return {
      iznos:   "",
      poruka:  "",
      greska:  "",
      loading: false,
    };
  },
  methods: {
    async deposit() {
      this.poruka = "";
      this.greska = "";

      if (!this.iznos || Number(this.iznos) <= 0) {
        this.greska = "Unesite ispravan iznos.";
        return;
      }

      this.loading = true;
      try {
        const tx = await this.contract.deposit({
          value: ethers.parseEther(this.iznos.toString())
        });
        await tx.wait();
        this.poruka = "Uplata uspješna!";
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