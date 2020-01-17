/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');


//Standard class to instantiate for creating a smart contract
class MyContract extends Contract {


    async instantiate(ctx) {
        console.info('instantiate');

        // Define participant
        let emptyList = [];
        await ctx.stub.putState('traders', Buffer.from(JSON.stringify(emptyList)));
    }


    // define participant function
    async AddTrader(ctx, traderId, firstName, lastName) {

        let trader = {
            traderId: traderId,
            firstName: firstName,
            lastName: lastName
        };


        await ctx.stub.putState(traderId, Buffer.from(JSON.stringify(trader)));

        //add traderId to 'trader' key
        const data = await ctx.stub.getState('traders');
        let traders = JSON.parse(data.toString());
        traders.push(traderId);
        await ctx.stub.putState('traders', Buffer.from(JSON.stringify(traders)));

        return JSON.stringify(trader);
    }

    // define creating the asset function
    async AddCommodity(ctx, tradingSymbol, description, traderId) {

        // verify trader id exists and retrieve it
        let traderData = await ctx.stub.getState(traderId);
        let trader;
        if (traderData) {
            trader = JSON.parse(traderData.toString());
            if (trader.traderId !== traderId) {
                throw new Error('trader not identified');
            }
        } else {
            throw new Error('trader not found');
        }

        let commodity = {
            tradingSymbol: tradingSymbol,
            description: description,
            traderId: traderId
        };


        await ctx.stub.putState(tradingSymbol, Buffer.from(JSON.stringify(commodity)));


        return JSON.stringify(commodity);
    }




    // Define performing a trade where a new owner of the asset is assigned
    async commodityTrade(ctx, tradingSymbol, traderId) {

        // verify id
        let traderData = await ctx.stub.getState(traderId);
        if (!traderData)  //{
        {throw new Error('trader not found');}

        //update owner of Trade/Commodity
        const commodityData = await ctx.stub.getState(tradingSymbol);
        let commodity;
        if (commodityData) {
            commodity = JSON.parse(commodityData.toString());
            commodity.traderId = traderId;
        }
        else {
            throw new Error('commodity not found');
        }

        await ctx.stub.putState(tradingSymbol, Buffer.from(JSON.stringify(commodity)));

        return JSON.stringify(commodity);

    }

    // get the state from key
    async GetState(ctx, key) {

        const data = await ctx.stub.getState(key);
        let jsonData = JSON.parse(data.toString());
        return JSON.stringify(jsonData);

    }

}

module.exports = MyContract;
