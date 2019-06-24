const client = require('./dynamodb');
const moment = require('moment');
const HashMap = require('hashmap');
const API = require('./API');
const _ = require('lodash');

const getPortfolioUser = async (portfolio_name) => {
	const { data } = await API.get('/portfolios/projects/users/ids', {
		params: { name: portfolio_name }
	});

	let idNameHashMap = new HashMap();
	for (let i = 0; i < data.length; i++) {
		const line = data[i];
		const email = line['email'];
		if (String(email).endsWith('tcpinpoint.com')) continue;
		idNameHashMap.set(line['user_id'], line['name']);
	}
	return idNameHashMap;
};

// process the result data
const processData = async (data, idNameHashMap) => {
	// const idNameHashMap = await getPortfolioUserIds(name);
	const idCountHashMap = new HashMap();
	const items = data['Items'];
	let mauId = '';
	let maxQuant = 0;
	for (let i = 0; i < items.length; i++) {
		const one = items[i];
		const actor = one['actor'];
		const id = actor && actor['id'];
		// id is in this portfolio;
		if (_.indexOf(idNameHashMap.keys(), id) === -1) {
			continue;
		}

		// select the MAU
		let quant = 0;
		if (!idCountHashMap.has(id)) {
			quant = 1;
		} else {
			quant = idCountHashMap.get(id) + 1;
		}
		idCountHashMap.set(id, quant);

		if (quant > maxQuant) {
			maxQuant = quant;
			mauId = id;
		}
	}

	const mau_name = idNameHashMap.get(mauId);
	return { mauId, mau_name };
};

// date constraints
const current = new Date().toISOString();
const last = moment(current).subtract(7, 'days').toDate().toISOString();
// scan parameters
const params = {
	TableName: 'resource-actions',
	FilterExpression: 'created_at >= :last and created_at <= :curr',
	ExpressionAttributeValues: {
		':last': `${last}`,
		':curr': `${current}`
	},
	ProjectionExpression: [ 'actor.id' ]
};

const getMauInfo = async (portfolios_name) => {
	const idNameHashMap = await getPortfolioUser(portfolios_name);
	let mau = {};
	try {
		const request = await client.scan(params);
		const data = await request.promise();
		mau = await processData(data, idNameHashMap);
	} catch (err) {
		console.log(err);
	}

	return mau;
};

getMauInfo('adelaide airport');
