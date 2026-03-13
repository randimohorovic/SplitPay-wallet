<template>
  <div class="component-card">
    <h2>Informacije o fondu</h2>
    <ul class="details-list">
      <li><span>Naziv</span> <strong>{{ fundName }}</strong></li>
      <li><span>Vlasnik</span> <span class="address">{{ owner }}</span></li>
      <li><span>Stanje</span> <strong>{{ balance }} ETH</strong></li>
      <li><span>Potrebni glasovi</span> <strong>{{ requiredApprovals }}</strong></li>
    </ul>
  </div>
</template>

<script>
import { ethers } from "ethers";

export default {
  name: "FundInfo",
  props: {
    contract: { type: Object, required: true },
    refresh:  { type: Number, default: 0 },
  },
  watch: {
    refresh() {
        this.loadData();
    }
  },
  data() {
    return {
      fundName:          "",
      owner:             "",
      balance:           "0",
      requiredApprovals: 0,
    };
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        this.fundName          = await this.contract.fundName();
        this.owner             = await this.contract.owner();
        const bal              = await this.contract.balance();
        this.balance           = parseFloat(ethers.formatEther(bal)).toFixed(4);
        this.requiredApprovals = Number(await this.contract.requiredApprovals());
      } catch (e) {
        console.error("FundInfo greška:", e);
      }
    },
  },
};
</script>

<style scoped>
.details-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.95rem;
}
.details-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border-color);
}
.details-list li:last-child {
  border-bottom: none;
}
.details-list li span {
  color: var(--text-secondary);
}
.address {
  font-family: monospace;
  font-size: 0.85rem;
  max-width: 60%;
  word-break: break-all;
}
</style>