/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'config.json');
const configJSON = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(configJSON);

var ccpPath = config.connection_file;
var appAdmin = config.appAdmin;
var channelName = config.channel_name;
var smartContractName = config.smart_contract_name;
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

async function main() {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(appAdmin);
        if (!userExists) {
            console.log(`An identity for the user ${appAdmin} does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: appAdmin , discovery: {enabled: true, asLocalhost:false }});

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(smartContractName);


        //Begin submitting transactions

        //Submit create a trader transaction
        console.log('\nSubmit AddTrader transaction.');
        var traderId = "traderA";
        var firstName = "Carlos";
        var lastName = "Roca";
        const addTraderAResponse = await contract.submitTransaction('AddTrader', traderId, firstName, lastName);
        console.log('addTraderAResponse: ');
        console.log(addTraderAResponse.toString('utf8'));
        console.log('addTraderAResponse_JSON.parse: ');
        console.log(JSON.parse(addTraderAResponse.toString()));

        
        //Submit create a second trader transaction
        console.log('\nSubmit AddTrader transaction.');
        var traderId = "traderB";
        var firstName = "Lisa";
        var lastName = "Smith";
        const addTraderBResponse = await contract.submitTransaction('AddTrader', traderId, firstName, lastName);
        console.log('addTraderBResponse: ');
        console.log(addTraderBResponse.toString('utf8'));
        console.log('addTraderBResponse_JSON.parse: ');
        console.log(JSON.parse(addTraderBResponse.toString()));

        
        //Submit create a commodity transaction
        console.log('\nSubmit AddCommodity transaction.');
        var tradingSymbol = "commodityA"; 
        var description = "farm-commodity"; 
        var traderId = "traderA"; 
        const addCommodityResponse = await contract.submitTransaction('AddCommodity', tradingSymbol, description, traderId);
        console.log('addCommodityResponse: ');
        console.log(addCommodityResponse.toString('utf8'));
        console.log('addCommodityResponse_JSON.parse: ');
        console.log(JSON.parse(addCommodityResponse.toString()));

        
        //Submit create transaction to reassign the owner of the commodity - hence simulating a trade
        console.log('\nSubmit Commodity trade transaction.');
        var tradingSymbol = "commodityA";
        var traderId = "traderB";
        const commodityTradeResponse = await contract.submitTransaction('commodityTrade', tradingSymbol, traderId);
        console.log('commodityTradeResponse: ')
        console.log(commodityTradeResponse.toString('utf8'));
        console.log('commodityTradeResponse_JSON.parse: ')
        console.log(JSON.parse(commodityTradeResponse.toString()));


        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();