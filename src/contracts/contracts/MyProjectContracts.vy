# @version 0.3.10
# @title MyProjectContract

owner: public(address)
message: public(String[100])
ipfs_cid: public(String[100])

@external
def __init__(_initialMessage: String[100], _initialIpfsCid: String[100]):
    self.owner = msg.sender
    self.message = _initialMessage
    self.ipfs_cid = _initialIpfsCid

@external
def updateMessage(_newMessage: String[100]):
    assert msg.sender == self.owner, "Only owner can update message"
    self.message = _newMessage

@external
def updateIpfsCid(_newIpfsCid: String[100]):
    assert msg.sender == self.owner, "Only owner can update IPFS CID"
    self.ipfs_cid = _newIpfsCid

@view
@external
def getMessage() -> String[100]:
    return self.message

@view
@external
def getIpfsCid() -> String[100]:
    return self.ipfs_cid

@view
@external
def getOwner() -> address:
    return self.owner
