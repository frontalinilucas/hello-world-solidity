const assert = require('assert');
const AssertionError = require('assert').AssertionError;
const Web3 = require('web3');

const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

const { interface, bytecode } = require('../scripts/compile');

let accounts;
let usersContract;

// Lo ejecuta antes de cada test
beforeEach(async() => {
    accounts = await web3.eth.getAccounts();
    usersContract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('UsersContract', async() => {
    it('shouldDeploy', () => {
        console.log(usersContract.options.address);
        assert.ok(usersContract.options.address);
    });

    it('should join a user', async() => {
        await usersContract.methods.join("Lucas", "Frontalini")
            .send({ from: accounts[0], gas: '500000' });
    });

    it('should retrieve a user', async() => {
        let name = "Lucas";
        let surName = "Frontalini";

        await usersContract.methods.join(name, surName)
            .send({ from: accounts[0], gas: '500000' });

        let user = await usersContract.methods.getUser(accounts[0]).call();

        assert.strictEqual(name, user[0]);
        assert.strictEqual(surName, user[1]);
    });

    it('should not allow joining an account twice', async() => {
        await usersContract.methods.join("Lucas", "Frontalini")
            .send({ from: accounts[1], gas: '500000' });

        try {
            await usersContract.methods.join("Juan", "Perez")
                .send({ from: accounts[1], gas: '500000' });
            assert.fail('same account cant join twice');
        }
        catch(e) {
            if(e instanceof AssertionError) {
                assert.fail(e.message);
            }
        }
    });

    it('user not found', async() => {
        await usersContract.methods.join("Lucas", "Frontalini")
            .send({ from: accounts[0], gas: '500000' });

        try {
            await usersContract.methods.getUser(accounts[1]).call();
            assert.fail('account not found');
        }
        catch(e) {
            if(e instanceof AssertionError) {
                assert.fail(e.message);
            }
        }
    });

    it('test totalUsers', async () => {
        await usersContract.methods.join("Lucas", "Frontalini")
            .send({ from: accounts[0], gas: '500000' });

        await usersContract.methods.join("Juan", "Perez")
            .send({ from: accounts[1], gas: '500000' });

        let total = await usersContract.methods.totalUsers().call();

        assert.equal(total, 2);
    });
});
