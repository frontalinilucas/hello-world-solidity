const Airline = artifacts.require('Airline');

let instance;

beforeEach(async () => {
    instance = await Airline.new();
});

contract('Airline', accounts => {
    it('should are available flights', async() => {
        let total = await instance.totalFlights();

        assert(total > 0);
    });

    it('should allow customers to buy a flight', async() => {
        let flight = await instance.flights(1);

        await instance.buyFlight(1, { from: accounts[0], value: flight[1] });

        let customerFlight = await instance.customerFlights(accounts[0], 0);
        let customerTotalFlights = await instance.customerTotalFlights(accounts[0]);
        let balance = await instance.getAirlineBalance({ from: accounts[0] });

        assert.equal(customerFlight[0], flight[0]);
        assert.equal(customerFlight[1].toNumber(), flight[1].toNumber());
        assert.equal(customerTotalFlights, 1);
        assert.equal(web3.fromWei(balance.toNumber(), 'ether'), 1);
    });

    it('should not allow customers to buy a flight', async() => {
        let flight = await instance.flights(1);

        try {
            await instance.buyFlight(1, { from: accounts[0], value: flight[1] - 5000 });
        }
        catch(e) { return; }
        assert.fail();
    });
});
