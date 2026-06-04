# @version 0.3.10

# Name Registry Contract
# Owner: Travis Jerome Goff
# Company: VersoriumX

registry: HashMap[Bytes[100], address]
owner: public(address)
secondary_wallet: public(address)
OWNER_ADDRESS: constant(address) = 0x51e2bBEf79eEb9E20F675cf4fD76857e023FeC72
SECONDARY_ADDRESS: constant(address) = 0x608cfC1575b56a82a352f14d61be100FA9709D75

# Events
event NameRegistered:
    name: Bytes[100]
    owner: address

event OwnershipTransferred:
    previous_owner: address
    new_owner: address

event SecondaryWalletChanged:
    previous: address
    new_wallet: address

@external
def __init__():
    """
    @dev Initialize the contract setting the deployer as the owner
    """
    self.owner = OWNER_ADDRESS
    self.secondary_wallet = SECONDARY_ADDRESS
    log OwnershipTransferred(empty(address), OWNER_ADDRESS)
    log SecondaryWalletChanged(empty(address), SECONDARY_ADDRESS)

    # Pre-register company name
    self._register(b"VersoriumX", OWNER_ADDRESS)
    self._register(b"Travis Jerome Goff", OWNER_ADDRESS)
    self._register(b"VersoriumX Secondary", SECONDARY_ADDRESS)

@internal
def _register(name: Bytes[100], addr: address):
    """
    @dev Internal function to register a name
    """
    self.registry[name] = addr
    log NameRegistered(name, addr)

@external
def register(name: Bytes[100], addr: address):
    """
    @dev Register a new name
    @param name The name to register
    @param addr The address to associate with the name
    """
    assert self.registry[name] == empty(address), "Name already registered"
    self._register(name, addr)

@view
@external
def lookup(name: Bytes[100]) -> address:
    """
    @dev Look up the address associated with a name
    @param name The name to look up
    @return The address associated with the name
    """
    return self.registry[name]

@external
def transfer_ownership(new_owner: address):
    """
    @dev Transfer ownership of the contract
    @param new_owner The address of the new owner
    """
    assert msg.sender == self.owner, "Only owner can transfer ownership"
    assert new_owner != empty(address), "New owner cannot be zero address"
    old_owner: address = self.owner
    self.owner = new_owner
    log OwnershipTransferred(old_owner, new_owner)

@external
def change_secondary_wallet(new_wallet: address):
    """
    @dev Change the secondary wallet address
    @param new_wallet The new secondary wallet address
    """
    assert msg.sender == self.owner, "Only owner can change secondary wallet"
    assert new_wallet != empty(address), "New wallet cannot be zero address"
    old_wallet: address = self.secondary_wallet
    self.secondary_wallet = new_wallet
    log SecondaryWalletChanged(old_wallet, new_wallet)

@external
def register_by_owner(name: Bytes[100], addr: address):
    """
    @dev Register a name by the contract owner, even if already taken
    @param name The name to register
    @param addr The address to associate with the name
    """
    assert msg.sender == self.owner or msg.sender == self.secondary_wallet, "Only owner or secondary wallet can force registration"
    self._register(name, addr)

@external
def register_by_secondary(name: Bytes[100], addr: address):
    """
    @dev Register a name by the secondary wallet
    @param name The name to register
    @param addr The address to associate with the name
    """
    assert msg.sender == self.secondary_wallet, "Only secondary wallet can use this function"
    assert self.registry[name] == empty(address), "Name already registered"
    self._register(name, addr)

@view
@external
def is_authorized(addr: address) -> bool:
    """
    @dev Check if an address is authorized (owner or secondary wallet)
    @param addr The address to check
    @return True if authorized, False otherwise
    """
    return addr == self.owner or addr == self.secondary_wallet
