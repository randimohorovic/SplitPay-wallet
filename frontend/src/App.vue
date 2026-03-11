<template>
  <div>
    <button @click="connect">Spoji MetaMask</button>
    <p v-if="account">Account: {{ account }}</p>
    <div v-if="account">
      <input v-model="depositAmt" placeholder="Iznos ETH" />
      <button @click="deposit">Uplati</button>
      <p>{{ poruka }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const ABI = ["function deposit() payable"];

const account    = ref(null);
const depositAmt = ref("");
const poruka     = ref("");

let contract = null;

const connect = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  account.value = await signer.getAddress();
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  poruka.value = "Spojen!";
};

const deposit = async () => {
  try {
    const tx = await contract.deposit({ 
      value: ethers.parseEther(depositAmt.value.toString()) 
    });
    await tx.wait();
    poruka.value = "Uplata uspješna!";
  } catch (e) {
    poruka.value = e.reason || e.message;
  }
};
</script>