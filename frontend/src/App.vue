<template>
  <div>
    <button v-if="!account" @click="connect">Spoji MetaMask</button>
    <p v-if="account">Račun: {{ account }}</p>
    
    <div v-if="account">
      <FundInfo :contract="contract" :refresh="refreshKey" />

      <Deposit :contract="contract" @refresh="refreshKey++" />

      <AddMember :contract="contract" @refresh="refreshKey++" />

      <CreateProposal :contract="contract" @refresh="refreshKey++" />

      <ProposalList :contract="contract" :refresh="refreshKey++" />


    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ethers } from "ethers";
import FundInfo from "./components/FundInfo.vue";
import Deposit from "./components/Deposit.vue";
import AddMember from "./components/AddMember.vue";
import CreateProposal from "./components/CreateProposal.vue";
import ProposalList from "./components/ProposalList.vue";




const refreshKey = ref(0);
const account         = ref(null);
const contract        = ref(null);
const contractAddress = ref(null);
//const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const ABI = [
  "function deposit() payable",
  "function fundName() view returns (string)",
  "function owner() view returns (address)",
  "function balance() view returns (uint256)",
  "function requiredApprovals() view returns (uint256)",
  "function addMember(address member)",
  "function isMember(address) view returns (bool)",
  "function createProposal(string description, uint256 amount)",
  "function vote(uint256 id)",
  "function proposalCount() view returns (uint256)",
  "function getProposal(uint256 id) view returns (string, uint256, address, uint256, bool)",
];

onMounted(async () => {
  try {
    const resp = await fetch("/contractAddress.json");
    const json = await resp.json();
    contractAddress.value = json.address;
    console.log("Adresa učitana:", contractAddress.value);
  } catch (e) {
    console.error("Ne mogu učitati contractAddress.json:", e);
  }
});

const connect = async () => {
  if (!window.ethereum) return alert("Instaliraj MetaMask!");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  account.value  = await signer.getAddress();
  contract.value = new ethers.Contract(contractAddress.value, ABI, signer);
};

</script>