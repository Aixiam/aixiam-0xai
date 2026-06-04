# @version 0.3.10
# @title SimpleERC20Token

name: public(String[32])
symbol: public(String[10])
decimals: public(uint256)
totalSupply: public(uint256)
balances: public(HashMap[address, uint256])
allowances: public(HashMap[address, HashMap[address, uint256]])

event Transfer:
    _from: indexed(address)
    _to: indexed(address)
    _value: uint256

event Approval:
    _owner: indexed(address)
    _spender: indexed(address)
    _value: uint256

@external
def __init__(_name: String[32], _symbol: String[10], _decimals: uint256, _initialSupply: uint256):
    self.name = _name
    self.symbol = _symbol
    self.decimals = _decimals
    self.totalSupply = _initialSupply
    self.balances[msg.sender] = _initialSupply

@external
def transfer(_to: address, _value: uint256) -> bool:
    assert self.balances[msg.sender] >= _value, "Insufficient balance"
    self.balances[msg.sender] -= _value
    self.balances[_to] += _value
    log Transfer(msg.sender, _to, _value)
    return True

@external
def transferFrom(_from: address, _to: address, _value: uint256) -> bool:
    assert self.balances[_from] >= _value, "Insufficient balance"
    assert self.allowances[_from][msg.sender] >= _value, "Insufficient allowance"
    self.balances[_from] -= _value
    self.balances[_to] += _value
    self.allowances[_from][msg.sender] -= _value
    log Transfer(_from, _to, _value)
    return True

@external
def approve(_spender: address, _value: uint256) -> bool:
    self.allowances[msg.sender][_spender] = _value
    log Approval(msg.sender, _spender, _value)
    return True

@view
@external
def balanceOf(_owner: address) -> uint256:
    return self.balances[_owner]

@view
@external
def allowance(_owner: address, _spender: address) -> uint256:
    return self.allowances[_owner][_spender]
