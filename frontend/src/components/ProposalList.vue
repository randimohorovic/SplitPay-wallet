<template>
  <div class="component-card">
    <h2>Prijedlozi troškova ({{ prijedlozi.length }})</h2>

    <div v-if="prijedlozi.length === 0">
      <p>Nema prijedloga.</p>
    </div>

    <div v-for="(p, i) in prijedlozi" :key="i" class="proposal-card">
      <div class="proposal-header">
        <strong>{{ p.opis }}</strong>
        <span :class="p.izvrseno ? 'badge-ok' : 'badge-pending'">
          {{ p.izvrseno ? "Izvršeno" : "Na čekanju.." }}
        </span>
      </div>
      <ul class="details-list">
        <li><span>Iznos</span> <strong>{{ p.iznos }} ETH</strong></li>
        <li><span>Predložio</span> <span class="address">{{ p.predlozio }}</span></li>
        <li><span>Glasovi</span> <strong>{{ p.glasovi }} / {{ requiredApprovals }}</strong></li>
      </ul>
      <button v-if="!p.izvrseno" @click="glasaj(i)" :disabled="loading">
        {{ loading ? "Glasam..." : "Glasaj" }}
      </button>
      <p v-if="greska" class="error">{{ greska }}</p>
    </div>
  </div>
</template>

<script>
import { ethers } from "ethers";

export default {
  name: "ProposalList",
  props: {
    contract: { type: Object, required: true },
    refresh:  { type: Number, default: 0 },
  },
  watch: {
    refresh() {
      this.ucitajPrijedloge();
    },
  },
  data() {
    return {
      prijedlozi:        [],
      requiredApprovals: 0,
      loading:           false,
      greska:            "",
    };
  },
  async created() {
    await this.ucitajPrijedloge();
  },
  methods: {
    async ucitajPrijedloge() {
      try {
        this.requiredApprovals = Number(await this.contract.requiredApprovals());
        const count = Number(await this.contract.proposalCount());
        const lista = [];
        for (let i = 0; i < count; i++) {
          const [opis, iznos, predlozio, glasovi, izvrseno] =
            await this.contract.getProposal(i);
          lista.push({
            opis,
            iznos:     parseFloat(ethers.formatEther(iznos)).toFixed(4),
            predlozio,
            glasovi:   Number(glasovi),
            izvrseno,
          });
        }
        this.prijedlozi = lista;
      } catch (e) {
        console.error("Greška pri učitavanju prijedloga:", e);
      }
    },
    async glasaj(id) {
      this.greska  = "";
      this.loading = true;
      try {
        const tx = await this.contract.vote(id);
        await tx.wait();
        await this.ucitajPrijedloge();
      } catch (e) {
        this.greska = e.reason || e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.proposal-card {
  background: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.badge-ok {
  color: var(--success-color);
  font-weight: 600;
}
.badge-pending {
  color: var(--text-secondary);
  font-weight: 600;
}
.details-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}
.details-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border-color);
}
.details-list li:last-child { border-bottom: none; }
.details-list li span { color: var(--text-secondary); }
.address {
  font-family: monospace;
  font-size: 0.8rem;
  word-break: break-all;
  max-width: 60%;
}
</style>