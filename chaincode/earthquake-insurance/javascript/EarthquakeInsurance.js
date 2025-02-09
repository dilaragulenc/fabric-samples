'use strict';

const { Contract } = require('fabric-contract-api');

class EarthquakeInsurance extends Contract {
    async initLedger(ctx) {
        console.log('Deprem Sigortası Ağı Başlatıldı.');
    }

    async createPolicy(ctx, policyId, insuredName, address, coverageAmount, startDate) {
        const policy = {
            insuredName,
            address,
            coverageAmount,
            startDate,
            status: 'Active', // Başlangıçta poliçe aktif
        };
        await ctx.stub.putState(policyId, Buffer.from(JSON.stringify(policy)));
        return `Policy ${policyId} created successfully.`;
    }

    async reportDamage(ctx, policyId, damageDetails) {
        const policy = await ctx.stub.getState(policyId);
        if (!policy || policy.length === 0) {
            throw new Error(`Policy ${policyId} does not exist.`);
        }
        const updatedPolicy = JSON.parse(policy.toString());
        updatedPolicy.status = 'Damage Reported';
        updatedPolicy.damageDetails = damageDetails;
        await ctx.stub.putState(policyId, Buffer.from(JSON.stringify(updatedPolicy)));
        return `Damage reported for policy ${policyId}.`;
    }

    async queryPolicy(ctx, policyId) {
        const policy = await ctx.stub.getState(policyId);
        if (!policy || policy.length === 0) {
            throw new Error(`Policy ${policyId} does not exist.`);
        }
        return policy.toString();
    }
}

module.exports = EarthquakeInsurance;
