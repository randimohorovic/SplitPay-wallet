// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract SplitPayWallet {

    address public owner;
    string  public fundName;
    uint    public requiredApprovals;
    uint    public balance;

    address[] public members;
    mapping(address => bool)    public isMember;
    mapping(address => uint)    public contributions;

    struct Proposal {
        string  description;
        uint    amount;
        address proposedBy;
        uint    approvalCount;
        bool    executed;
        mapping(address => bool) voted;
    }

    uint public proposalCount;
    mapping(uint => Proposal) public proposals;

    event MemberAdded(address indexed member);
    event Deposited(address indexed from, uint amount);
    event ProposalCreated(uint id, string description, uint amount, address proposedBy);
    event Voted(uint id, address indexed voter, uint approvalCount);
    event Executed(uint id, string description, uint amount, address proposedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Nisi vlasnik");
        _;
    }

    modifier onlyMember() {
        require(isMember[msg.sender], "Nisi clan");
        _;
    }

    constructor(string memory _fundName, uint _requiredApprovals) {
        require(_requiredApprovals > 0, "Potreban barem 1 glas");

        owner              = msg.sender;
        fundName           = _fundName;
        requiredApprovals  = _requiredApprovals;

        // vlasnik je automatski clan
        isMember[msg.sender] = true;
        members.push(msg.sender);

        
    }

    function addMember(address _member) external onlyOwner {
        require(_member != address(0), "Neispravna adresa");
        require(!isMember[_member], "Vec je clan");

        isMember[_member] = true;
        members.push(_member);

       
        emit MemberAdded(_member);
    }

    function deposit() external payable onlyMember {
        require(msg.value > 0, "Iznos mora biti veci od 0");

        balance                    += msg.value;
        contributions[msg.sender]  += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    function createProposal(string calldata _description, uint _amount) external onlyMember {
        require(bytes(_description).length > 0, "Opis ne smije biti prazan");
        require(_amount > 0, "Iznos mora biti veci od 0");
        require(balance >= _amount, "Nedovoljno sredstava u fondu");

        uint id = proposalCount;
        proposalCount++;

        Proposal storage p = proposals[id];
        p.description = _description;
        p.amount      = _amount;
        p.proposedBy  = msg.sender;
        p.approvalCount = 0;
        p.executed    = false;

        emit ProposalCreated(id, _description, _amount, msg.sender);
    }

    function vote(uint _id) external onlyMember {
        require(_id < proposalCount, "Prijedlog ne postoji");

        Proposal storage p = proposals[_id];
        require(!p.executed,          "Prijedlog je vec izveden");
        require(!p.voted[msg.sender], "Vec si glasao");

        p.voted[msg.sender] = true;
        p.approvalCount++;

        emit Voted(_id, msg.sender, p.approvalCount);

        //n ako je dovoljno glasova
        if (p.approvalCount >= requiredApprovals) {
            _execute(_id);
        }
    }

    function _execute(uint _id) internal {
        Proposal storage p = proposals[_id];
        require(!p.executed,    "Vec izvrseno");
        require(balance >= p.amount, "Nedovoljno sredstava");

        p.executed  = true;
        balance    -= p.amount;

        (bool success, ) = payable(p.proposedBy).call{value: p.amount}("");
        require(success, "Transfer nije uspio");

        emit Executed(_id, p.description, p.amount, p.proposedBy);
    }

    function getMembers() external view returns (address[] memory) {
        return members;
    }

    function getMemberCount() external view returns (uint) {
        return members.length;
    }

    function getProposal(uint _id) external view returns (
        string memory description,
        uint amount,
        address proposedBy,
        uint approvalCount,
        bool executed
    ) {
        require(_id < proposalCount, "Prijedlog ne postoji");
        Proposal storage p = proposals[_id];
        return (p.description, p.amount, p.proposedBy, p.approvalCount, p.executed);
    }

    function hasVoted(uint _id, address _member) external view returns (bool) {
        return proposals[_id].voted[_member];
    }
}