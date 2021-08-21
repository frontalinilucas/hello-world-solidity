pragma solidity ^0.4.24;

contract UsersContract {

    struct User {
        string name;
        string surName;
    }

    mapping(address => User) private users;
    address[] total;

    function join(string memory _name, string memory _surName) public {
        require(bytes(_name).length > 0 && bytes(_surName).length > 0);
        require(!userJoined(msg.sender));
        User storage user = users[msg.sender];
        user.name = _name;
        user.surName = _surName;
        total.push(msg.sender);
    }

    function getUser(address _addr) public view returns (string memory, string memory) {
        require(userJoined(_addr));
        User memory user = users[_addr];
        return (user.name, user.surName);
    }

    function userJoined(address _addr) private view returns (bool) {
        User memory user = users[_addr];
        return bytes(user.name).length > 0 && bytes(user.surName).length > 0;
    }

    function totalUsers() public view returns (uint) {
        return total.length;
    }

}