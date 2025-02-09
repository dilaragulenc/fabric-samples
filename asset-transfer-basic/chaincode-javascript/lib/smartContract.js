'use strict';

const { Contract } = require('fabric-contract-api');
const fetch = require('node-fetch'); 

class smartContract extends Contract {

   
    async CreateContract(ctx, id, customerID, companyName, startDate, endDate, monthlyPayment) {
        
        const customerInfo = await this.GetCustomerInfo(customerID);
        if (!customerInfo) {
            throw new Error(`Customer with ID ${customerID} does not exist in the external system`);
        }

        
        const contract = {
            ID: id,
            CustomerName: customerInfo.name,
            Address: customerInfo.address,
            Phone: customerInfo.phone,
            CompanyName: companyName,
            StartDate: startDate,
            EndDate: endDate,
            MonthlyPayment: parseFloat(monthlyPayment),
            Status: 'pending', 
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(contract)));
        return JSON.stringify(contract);
    }

    async GetCustomerInfo(customerID) {
        try {
            const response = await fetch(`https://external-system.example.com/customers/${customerID}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch customer data: ${response.statusText}`);
            }
            const customerInfo = await response.json();
            return customerInfo;
        } catch (error) {
            console.error('Error fetching customer info:', error);
            return null;
        }
    }

    async ApproveContract(ctx, id) {
        const contractJSON = await ctx.stub.getState(id);
        if (!contractJSON || contractJSON.length === 0) {
            throw new Error(`The contract ${id} does not exist`);
        }

        const contract = JSON.parse(contractJSON.toString());

        if (contract.Status !== 'pending') {
            throw new Error(`Only pending contracts can be approved`);
        }

        contract.Status = 'active'; 
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(contract)));
        return JSON.stringify(contract);
    }

  
    async SetInactive(ctx, id) {
        const contractJSON = await ctx.stub.getState(id);
        if (!contractJSON || contractJSON.length === 0) {
            throw new Error(`The contract ${id} does not exist`);
        }

        const contract = JSON.parse(contractJSON.toString());
        contract.Status = 'inactive'; 
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(contract)));
        return JSON.stringify(contract);
    }
}

module.exports = EarthquakeInsurance;
