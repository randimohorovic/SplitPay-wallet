const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SplitPayWallet", function () {
  it("Treba postaviti ispravno ime fonda", async function () {
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    expect(await contract.fundName()).to.equal("Zajednicki fond");
  });

  it("Treba postaviti ispravnog vlasnika", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    expect(await contract.owner()).to.equal(owner.address);
  });

  it("Vlasnik je automatski clan", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    expect(await contract.isMember(owner.address)).to.equal(true);
  });

  it("Vlasnik moze dodati clana", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await expect(contract.addMember(clan1.address))
      .to.emit(contract, "MemberAdded")
      .withArgs(clan1.address);
  });

  it("Clan ne moze dodati drugog clana", async function () {
    const [owner, clan1, clan2] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await expect(
      contract.connect(clan1).addMember(clan2.address),
    ).to.be.revertedWith("Nisi vlasnik");
  });

  it("Clan moze uplatiti ETH", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await contract.addMember(clan1.address);
    await expect(
      contract.connect(clan1).deposit({ value: ethers.parseEther("1.0") }),
    )
      .to.emit(contract, "Deposited")
      .withArgs(clan1.address, ethers.parseEther("1.0"));
  });

  it("Clan ne moze uplatiti", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await expect(
      contract.connect(clan1).deposit({ value: ethers.parseEther("1.0") }),
    ).to.be.revertedWith("Nisi clan");
  });

  it("Clan moze kreirati prijedlog", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await contract.addMember(clan1.address);
    await contract.connect(clan1).deposit({ value: ethers.parseEther("1.0") });
    await expect(
      contract
        .connect(clan1)
        .createProposal("Gorivo", ethers.parseEther("0.5")),
    )
      .to.emit(contract, "ProposalCreated")
      .withArgs(0, "Gorivo", ethers.parseEther("0.5"), clan1.address);
  });

  it("Glasanje izvrsava prijedlog kad ima dovoljno glasova", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await contract.addMember(clan1.address);
    await contract.deposit({ value: ethers.parseEther("1.0") });
    await contract.createProposal("Gorivo", ethers.parseEther("0.5"));

    await contract.vote(0);
    await contract.connect(clan1).vote(0);

    const [, , , , executed] = await contract.getProposal(0);
    expect(executed).to.equal(true);
  });

  it("Clan ne moze glasati dvaput", async function () {
    const [owner] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await contract.deposit({ value: ethers.parseEther("1.0") });
    await contract.createProposal("Gorivo", ethers.parseEther("0.5"));
    await contract.vote(0);

    await expect(contract.vote(0)).to.be.revertedWith("Vec si glasao");
  });

  it("Izvrseni prijedlog emitira Executed event", async function () {
    const [owner, clan1] = await ethers.getSigners();
    const contract = await ethers.deployContract("SplitPayWallet", [
      "Zajednicki fond",
      2,
    ]);
    await contract.addMember(clan1.address);
    await contract.deposit({ value: ethers.parseEther("1.0") });
    await contract.createProposal("Gorivo", ethers.parseEther("0.5"));

    await contract.vote(0);
    await expect(contract.connect(clan1).vote(0)).to.emit(contract, "Executed");
  });
});
