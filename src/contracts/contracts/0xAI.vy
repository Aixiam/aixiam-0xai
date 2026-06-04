# @version 0.3.10
# @title 0xAI Token
# @author VersoriumX Team (based on ERC20 example by Javaweh)

###########################################################################
## THIS IS EXAMPLE CODE, NOT MEANT TO BE USED IN PRODUCTION WITHOUT AUDIT!
###########################################################################

# @dev example implementation of an ERC20 token
# https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md

# if `ethereum.ercs` is not a globally recognized Vyper library.
# For simplicity, we'll manually define the events and views if `from ethereum.ercs import IERC20` fails.
# If `from ethereum.ercs import IERC20` works, keep it. If not, comment out and use explicit definitions.

# Manual ERC20 events for compatibility
event Transfer:
    _from: indexed(address)
    _to: indexed(address)
    _value: uint256

event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

# Contract State Variables
name: public(String[32])
symbol: public(String[32])
decimals: public(uint8)

# NOTE: By declaring `balanceOf` as public, vyper automatically generates a 'balanceOf()' getter
#       method to allow access to account balances.
balanceOf: public(HashMap[address, uint256])

# By declaring `allowance` as public, vyper automatically generates the `allowance()` getter
allowance: public(HashMap[address, HashMap[address, uint256]])

# By declaring `totalSupply` as public, we automatically create the `totalSupply()` getter
totalSupply: public(uint256)

minter: public(address) # Making minter public for clarity

# --- Constructor ---
# Make constructor payable as requested, though unusual for ERC20 tokens.
@external
@payable
def __init__(_initialRecipient: address): # Recipient of the initial supply
    assert _initialRecipient != ZERO_ADDRESS, "Initial recipient cannot be zero address"

    # Token Details
    self.name = "0xAI Token"
    self.symbol = "0xAI"
    self.decimals = 18

    # Token Supply (1,000,000,000 tokens with 18 decimals)
    _total_supply_tokens: uint256 = 1_000_000_000 # 1 Billion
    initial_supply_wei: uint256 = _total_supply_tokens * 10 ** convert(self.decimals, uint256)

    # Mint initial supply to the specified recipient
    self.balanceOf[_initialRecipient] = initial_supply_wei
    self.totalSupply = initial_supply_wei

    # Set the deployer as the initial minter
    self.minter = msg.sender

    # Log the initial minting event
    log Transfer(empty(address), _initialRecipient, initial_supply_wei)

    # If ETH was sent to the constructor, it remains in the contract balance.
    # Typically, an ERC20 constructor is not payable.
    if msg.value > 0:
        log Transfer(msg.sender, self, msg.value) # Optional: log ETH sent to contract


# --- External Functions (ERC20 Standard) ---

@external
def transfer(_to : address, _value : uint256) -> bool:
    """
    @dev Transfer token for a specified address
    @param _to The address to transfer to.
    @param _value The amount to be transferred.
    """
    assert _to != ZERO_ADDRESS, "Cannot transfer to zero address"
    assert self.balanceOf[msg.sender] >= _value, "Insufficient balance" # Vyper's uint subtraction handles underflow

    self.balanceOf[msg.sender] -= _value
    self.balanceOf[_to] += _value
    log Transfer(msg.sender, _to, _value)
    return True

@external
def transferFrom(_from : address, _to : address, _value : uint256) -> bool:
    """
    @dev Transfer tokens from one address to another.
    @param _from address The address which you want to send tokens from
    @param _to address The address which you want to transfer to
    @param _value uint256 the amount of tokens to be transferred
    """
    assert _from != ZERO_ADDRESS, "Cannot transfer from zero address"
    assert _to != ZERO_ADDRESS, "Cannot transfer to zero address"
    assert self.balanceOf[_from] >= _value, "Insufficient balance from sender"
    assert self.allowance[_from][msg.sender] >= _value, "Insufficient allowance" # Vyper's uint subtraction handles underflow

    self.balanceOf[_from] -= _value
    self.balanceOf[_to] += _value
    self.allowance[_from][msg.sender] -= _value
    log Transfer(_from, _to, _value)
    return True

@external
def approve(_spender : address, _value : uint256) -> bool:
    """
    @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
         Beware that changing an allowance with this method brings the risk that someone may use both the old
         and the new allowance by unfortunate transaction ordering.
    @param _spender The address which will spend the funds.
    @param _value The amount of tokens to be spent.
    """
    assert _spender != ZERO_ADDRESS, "Cannot approve zero address"
    self.allowance[msg.sender][_spender] = _value
    log Approval(msg.sender, _spender, _value)
    return True


# --- Minter Functions (Only Minter can call) ---

@external
def mint(_to: address, _value: uint256):
    """
    @dev Mints an amount of the token and assigns it to an account.
         Only the designated minter can call this.
    @param _to The account that will receive the created tokens.
    @param _value The amount that will be created.
    """
    assert msg.sender == self.minter, "Only minter can mint tokens"
    assert _to != ZERO_ADDRESS, "Cannot mint to zero address"
    assert _value > 0, "Cannot mint zero value"

    self.totalSupply += _value
    self.balanceOf[_to] += _value
    log Transfer(empty(address), _to, _value)

@internal
def _burn(_from: address, _value: uint256):
    """
    @dev Internal function that burns an amount of the token of a given account.
    @param _from The account whose tokens will be burned.
    @param _value The amount that will be burned.
    """
    assert _from != ZERO_ADDRESS, "Cannot burn from zero address"
    assert self.balanceOf[_from] >= _value, "Insufficient balance to burn" # Vyper's uint subtraction handles underflow
    assert _value > 0, "Cannot burn zero value"

    self.totalSupply -= _value
    self.balanceOf[_from] -= _value
    log Transfer(_from, empty(address), _value)

@external
def burn(_value: uint256):
    """
    @dev Burn an amount of the token of msg.sender.
    @param _value The amount that will be burned.
    """
    self._burn(msg.sender, _value)

@external
def burnFrom(_from: address, _value: uint256):
    """
    @dev Burn an amount of the token from a given account.
    @param _from The account whose tokens will be burned.
    @param _value The amount that will be burned.
    """
    assert self.allowance[_from][msg.sender] >= _value, "Insufficient allowance to burnFrom" # Vyper's uint subtraction handles underflow
    self.allowance[_from][msg.sender] -= _value
    self._burn(_from, _value)

# --- Ownership/Minter Transfer (Optional but good practice) ---
@external
def transferMinter(newMinter: address):
    """
    @dev Transfers mintership of the token to a new address.
         Only the current minter can call this.
    @param newMinter The address to transfer mintership to.
    """
    assert msg.sender == self.minter, "Only current minter can transfer mintership"
    assert newMinter != ZERO_ADDRESS, "Cannot transfer mintership to zero address"
    self.minter = newMinter
