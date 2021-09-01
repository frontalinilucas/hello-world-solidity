import React, { Component } from "react";
import Panel from "./Panel";
import Web3 from "web3";
import AirlineContract from "./airline";
import { AirlineService } from './airlineService';
import { ToastContainer } from "react-toastr";

const converter = (web3) => {
    return (value) => {
        return web3.utils.fromWei(value.toString(), 'ether');
    }
}

export class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: undefined,
            balance: 0,
            flights: [],
            customerFlights: [],
            refundableEther: 0,
        };
    }

    async componentDidMount() {
        /*if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        } else {
            console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
        }*/
        
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        this.airline = await AirlineContract(window.web3.currentProvider);
        this.toEther = converter(web3);
        this.airlineService = new AirlineService(this.airline);

        let flightPurchased = this.airline.FlightPurchased();
        flightPurchased.watch(function(error, result) {
            const { customer, price, flight } = result.args;

            if (customer === this.state.account) {
                console.log(`you purchased a flight to ${flight} with a cost of ${price}`);
                this.load();
            } else {
                this.container.success(`Last customer purchased a flight to ${flight} with a cost of ${price}`, `Flight information`);
            }

        }.bind(this));

        window.ethereum.on('accountsChanged', async function(accounts){
            if (accounts.length >= 0 && accounts[0] !== this.state.account) {
                this.setState({
                    account: accounts[0].toLowerCase(),
                }, () => {
                    this.load();
                });
            }
        }.bind(this));

        console.log(accounts);
        this.setState({
            account: accounts[0].toLowerCase(),
        }, () => {
            this.load();
        });
    }

    async getBalance() {
        let balance = await web3.eth.getBalance(this.state.account);
        console.log(balance);
        this.setState({
            balance: this.toEther(balance),
        });
    }

    async getFlights() {
        let flights = await this.airlineService.getFlights();
        this.setState({
            flights,
        });
    }

    async getRefundableEther() {
        let refundableEther = this.toEther(await this.airlineService.getRefundableEther(this.state.account));
        this.setState({
            refundableEther,
        })
    }

    async redeemLoyaltyPoints() {
        await this.airlineService.redeemLoyaltyPoints(this.state.account);
    }

    async getCustomerFlights() {
        let customerFlights = await this.airlineService.getCustomerFlights(this.state.account);
        this.setState({
            customerFlights,
        });
    }

    async load() {
        this.getBalance();
        this.getFlights();
        this.getCustomerFlights();
        this.getRefundableEther();
    }

    async buyFlight(flightIndex, flight) {
        await this.airlineService.buyFlight(flightIndex, this.state.account, flight.price);
    }

    render() {
        return <React.Fragment>
            <div className="jumbotron">
                <h4 className="display-4">Welcome to the Airline!</h4>
            </div>

            <div className="row">
                <div className="col-sm">
                    <Panel title="Balance">
                        <p><strong>{this.state.account}</strong></p>
                        <span><strong>Balance: {this.state.balance}</strong></span>
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Loyalty points - refundable ether">
                        <span>{this.state.refundableEther} ETH</span>
                        <button className="btn btn-sm btn-success text-white" onClick={() => this.redeemLoyaltyPoints()}>Refund</button>
                    </Panel>
                </div>
            </div>
            <div className="row">
                <div className="col-sm">
                    <Panel title="Available flights">
                        {this.state.flights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                                <button className="btn btn-sm btn-success text-white" onClick={() => this.buyFlight(i, flight)}>Purchase</button>
                            </div>
                        })}
                    </Panel>
                </div>
                <div className="col-sm">
                    <Panel title="Your flights">
                        {this.state.customerFlights.map((flight, i) => {
                            return <div key={i}>
                                <span>{flight.name} - cost: {this.toEther(flight.price)}</span>
                            </div>
                        })}
                    </Panel>
                </div>
            </div>
            <ToastContainer ref={(input) => this.container = input} 
                className="toast-top-right"/>
        </React.Fragment>
    }
}