pragma solidity ^0.4.24;

import './Ownable.sol';

contract Airline is Ownable {

    struct Customer {
        uint loyaltyPoint;
        uint totalFlights;
    }

    struct Flight {
        string name;
        uint price;
    }

    uint etherPerPoint = 0.25 ether;

    Flight[] public flights;
    mapping(address => Customer) public customers;
    mapping (address => Flight[]) public customerFlights;
    mapping(address => uint) public customerTotalFlights;

    event FlightPurchased(address indexed customer, uint price, string flight);

    constructor() public {
        flights.push(Flight('Tokio', 4 ether));
        flights.push(Flight('Germany', 5 ether));
        flights.push(Flight('Madrid', 3 ether));
    }

    function buyFlight(uint flightIndex) public payable {
        Flight memory flight = flights[flightIndex];
        require(msg.value >= flight.price);

        Customer storage customer = customers[msg.sender];
        customer.loyaltyPoint += 5;
        customer.totalFlights += 1;
        customerFlights[msg.sender].push(flight);
        customerTotalFlights[msg.sender]++;

        emit FlightPurchased(msg.sender, flight.price, flight.name);
    }

    function totalFlights() public view returns (uint) {
        return flights.length;
    }

    function getRefundableEther() public view returns(uint) {
        return customers[msg.sender].loyaltyPoint * etherPerPoint;
    }

    function redeemLoyaltyPoints() public {
        Customer storage customer = customers[msg.sender];
        uint etherToRefund = customer.loyaltyPoint * etherPerPoint;
        msg.sender.transfer(etherToRefund);
        customer.loyaltyPoint = 0;
    }

    function getAirlineBalance() public onlyOwner view returns(uint) {
        address airlineAddress = this;
        return airlineAddress.balance;
    }

}