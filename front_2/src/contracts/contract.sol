// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PharmaSupplyChain {
    address public admin;
    enum Role { None, Manufacturer, Distributor, PublicPharmacy, PrivatePharmacy, CentralPharmacy }
    enum DrugStatus { Pending, Approved, Rejected }

    struct User {
        address wallet;
        Role role;
        bool isApproved;
    }

    struct HolderHistory {
        address holder;
        uint256 timestamp;
        string role; // e.g., "Manufacturer", "CentralPharmacy", etc.
    }

    struct Drug {
        uint256 id;
        string pctCode; // can be empty
        HolderHistory[] history; // current holder and history
        DrugStatus status;
    }

    mapping(address => User) public users;
    mapping(uint256 => Drug) public drugs;
    uint256 public drugCount;

    event UserRegistered(address indexed wallet, Role role);
    event UserApproved(address indexed wallet, Role role);
    event UserRejected(address indexed wallet);
    event DrugSubmitted(uint256 indexed drugId, address indexed manufacturer);
    event DrugSubmittedByAdmin(uint256 indexed drugId, string pctCode, address indexed submittedBy);

    event DrugApproved(uint256 indexed drugId, string pctCode, address indexed approvedBy);
    event DrugRejected(uint256 indexed drugId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
        // Initialize admin as CentralPharmacy
        users[admin] = User(admin, Role.CentralPharmacy, true);
    }

    function registerUser(address wallet, Role role) external {
        require(users[wallet].wallet == address(0), "User already registered");
        users[wallet] = User(wallet, role, false);
        emit UserRegistered(wallet, role);
    }

    function isUserRegistered(address wallet) public view returns (bool) {
        return users[wallet].wallet != address(0);
    }

    function approveUser(address wallet) external onlyAdmin {
        require(users[wallet].wallet != address(0), "User not found");
        users[wallet].isApproved = true;
        emit UserApproved(wallet, users[wallet].role);
    }

    function rejectUser(address wallet) external onlyAdmin {
        require(users[wallet].wallet != address(0), "User not found");
        delete users[wallet];
        emit UserRejected(wallet);
    }

    function submitDrug() external {
        require(users[msg.sender].isApproved && users[msg.sender].role == Role.Manufacturer, "Not an approved manufacturer");
        drugCount++;
        
        Drug storage newDrug = drugs[drugCount];
        newDrug.id = drugCount;
        newDrug.pctCode = ""; // Initialize as empty
        newDrug.status = DrugStatus.Pending;
        
        // Add initial holder (manufacturer)
        newDrug.history.push(HolderHistory({
            holder: msg.sender,
            timestamp: block.timestamp,
            role: "Manufacturer"
        }));
        
        emit DrugSubmitted(drugCount, msg.sender);
    }
    function submitDrugAsAdmin(string memory pctCode) external onlyAdmin {
    drugCount++;
    
    Drug storage newDrug = drugs[drugCount];
    newDrug.id = drugCount;
    newDrug.pctCode = pctCode;
    newDrug.status = DrugStatus.Approved;
    
    // Add initial holder (central pharmacy)
    newDrug.history.push(HolderHistory({
        holder: msg.sender,
        timestamp: block.timestamp,
        role: "CentralPharmacy"
    }));
    
    emit DrugApproved(drugCount, pctCode, msg.sender);
}


    function approveDrug(uint256 drugId, string memory pctCode) external onlyAdmin {
        require(drugs[drugId].id != 0, "Drug not found");
        require(drugs[drugId].status == DrugStatus.Pending, "Drug already processed");
        
        drugs[drugId].status = DrugStatus.Approved;
        drugs[drugId].pctCode = pctCode;
        
        // Add Central Pharmacy to the history
        drugs[drugId].history.push(HolderHistory({
            holder: msg.sender,
            timestamp: block.timestamp,
            role: "CentralPharmacy"
        }));
        
        emit DrugApproved(drugId, pctCode, msg.sender);
    }

    function rejectDrug(uint256 drugId) external onlyAdmin {
        require(drugs[drugId].id != 0, "Drug not found");
        require(drugs[drugId].status == DrugStatus.Pending, "Drug already processed");
        
        drugs[drugId].status = DrugStatus.Rejected;
        
        // Add Central Pharmacy rejection to history
        drugs[drugId].history.push(HolderHistory({
            holder: msg.sender,
            timestamp: block.timestamp,
            role: "CentralPharmacy-Rejected"
        }));
        
        emit DrugRejected(drugId);
    }

    function getDrugHistory(uint256 drugId) external view returns (HolderHistory[] memory) {
        require(drugs[drugId].id != 0, "Drug not found");
        return drugs[drugId].history;
    }

    function getCurrentHolder(uint256 drugId) external view returns (address) {
        require(drugs[drugId].id != 0, "Drug not found");
        uint256 lastIndex = drugs[drugId].history.length - 1;
        return drugs[drugId].history[lastIndex].holder;
    }

    function getDrugCount() public view returns (uint256) {
    return drugCount;
}
}