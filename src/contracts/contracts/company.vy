# @version 0.3.10
# @title VersoriumX Company Token (Company Shares)
# @author VersoriumX Team

# Financial events the contract logs
event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    value: uint256

event Buy:
    buyer: indexed(address)
    buy_order: uint256 # Amount of shares bought

event Sell:
    seller: indexed(address)
    sell_order: uint256 # Amount of shares sold

event Pay:
    vendor: indexed(address)
    amount: uint256 # Amount in wei paid

# Initiate the variables for the company and its own shares.
company: public(address)
totalShares: public(uint256) # Total outstanding shares (constant after init)
price: public(uint256)       # Current price per share in wei

# Store a ledger of stockholder holdings.
holdings: HashMap[address, uint256] # Mapping from address to number of shares held

# Set up the company.
@external
def __init__(_company: address, _total_shares: uint256, _initial_price_wei_per_share: uint256):
    assert _total_shares > 0, "Total shares must be greater than zero."
    assert _initial_price_wei_per_share > 0, "Initial price must be greater than zero."

    self.company = _company
    self.totalShares = _total_shares
    self.price = _initial_price_wei_per_share

    # The company holds all the shares at first, but can sell them all.
    self.holdings[self.company] = _total_shares

# --- Internal View Functions ---
# Find out how much stock the company holds
@internal
@view
def _stockAvailable() -> uint256:
    return self.holdings[self.company]

# Find out how much stock any address (that's owned by someone) has.
@internal
@view
def _getHolding(_stockholder: address) -> uint256:
    return self.holdings[_stockholder]

# Return the amount in wei that a company has raised in stock offerings.
# This represents the total value of shares sold multiplied by their initial price.
# This could also be interpreted as the "debt" or "liability" of outstanding shares.
@internal
@view
def _share_liability() -> uint256:
    # (total shares issued - shares still held by company) * price
    return (self.totalShares - self._stockAvailable()) * self.price


# --- External View Functions ---

# Public function to allow external access to _stockAvailable
@external
@view
def stockAvailable() -> uint256:
    return self._stockAvailable()

# Public function to allow external access to _getHolding
@external
@view
def getHolding(_stockholder: address) -> uint256:
    return self._getHolding(_stockholder)

# Return the amount the company has on hand in cash (contract balance).
@external
@view
def cash() -> uint256:
    return self.balance

# Return the cash holdings minus the share liability of the company.
@external
@view
def worth() -> uint256:
    return self.balance - self._share_liability()


# --- External State-Changing Functions ---

# Give some value to the company and get stock in return.
@external
@payable
def buyStock():
    # Note: full amount is given to company (no fractional shares),
    #       so be sure to send exact amount to buy shares
    # `msg.value` is in wei. `self.price` is wei per share.
    buy_order: uint256 = msg.value / self.price # Integer division for shares

    # Check that there are enough shares to buy.
    assert self._stockAvailable() >= buy_order, "Not enough shares available to buy."
    assert buy_order > 0, "Must buy at least one share." # Ensure integer division didn't result in 0

    # Take the shares off the market and give them to the stockholder.
    self.holdings[self.company] -= buy_order
    self.holdings[msg.sender] += buy_order

    # Log the buy event.
    log Buy(msg.sender, buy_order)

# Give stock back to the company and get money back as ETH.
@external
def sellStock(sell_order: uint256):
    assert sell_order > 0, "Sell order must be greater than zero."
    # You can only sell as much stock as you own.
    assert self._getHolding(msg.sender) >= sell_order, "Insufficient holdings to sell."

    amount_to_send: uint256 = sell_order * self.price
    # Check that the company can pay you.
    assert self.balance >= amount_to_send, "Company does not have enough cash to buy back shares."

    # Sell the stock, send the proceeds to the user
    # and put the stock back on the market.
    self.holdings[msg.sender] -= sell_order
    self.holdings[self.company] += sell_order
    send(msg.sender, amount_to_send)

    # Log the sell event.
    log Sell(msg.sender, sell_order)

# Transfer stock from one stockholder to another. (Assume that the
# receiver is given some compensation, but this is not enforced by this contract.)
@external
def transferStock(receiver: address, transfer_order: uint256):
    assert transfer_order > 0, "Transfer order must be greater than zero."
    assert receiver != ZERO_ADDRESS, "Cannot transfer to zero address."
    assert receiver != msg.sender, "Cannot transfer to self." # Usually a good practice

    # Similarly, you can only trade as much stock as you own.
    assert self._getHolding(msg.sender) >= transfer_order, "Insufficient holdings to transfer."

    # Debit the sender's stock and add to the receiver's address.
    self.holdings[msg.sender] -= transfer_order
    self.holdings[receiver] += transfer_order

    # Log the transfer event.
    log Transfer(msg.sender, receiver, transfer_order)

# Allow the company to pay someone for services rendered.
@external
def payBill(vendor: address, amount: uint256):
    assert amount > 0, "Payment amount must be greater than zero."
    assert vendor != ZERO_ADDRESS, "Cannot pay to zero address."
    # Only the company (the address set during init) can pay people.
    assert msg.sender == self.company, "Only the designated company address can pay bills."
    # Also, it can pay only if there's enough to pay them with.
    assert self.balance >= amount, "Company does not have enough balance to pay the bill."

    # Pay the bill!
    send(vendor, amount)

    # Log the payment event.
    log Pay(vendor, amount)
