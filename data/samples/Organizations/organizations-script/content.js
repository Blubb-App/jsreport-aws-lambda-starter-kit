// server side script fetching remote data and preparing report data source
const https = require('https');

// call remote http rest api
function fetchOrganizations() {
    return new Promise((resolve, reject) => {
        https.get({
            host: 'api.blubb.com.br',
            port: 443,
            path: '/organization/report',
            headers: {
                'Authorization': 'c2rKc9DwlI7ZkyYy47o8Aet261UjGcgawW2R9cq7'
            }
        },
        (result) => {
            var str = '';
            result.on('data', (b) => str += b);
            result.on('error', reject);
            result.on('end', () => resolve(JSON.parse(str)));
        });
    })
}

// group the data for report
async function prepareDataSource() {
    const organizations = await fetchOrganizations()
    const response = organizations?.sort((a, b) => Number(b.active) - Number(a.active)).map(o => {
        const ownerUserEmail = o?.users?.find((u) => u.role === "OWNER")?.email;

        return {
            id: o.id,
            name: o.name,
            email: ownerUserEmail,
            status: o.active ? 'Ativo' : 'Inativo',
            updated: o.updatedAt.value.replace('T',' ').substr(0, 19)
        }
    });

    return response;
}

// add jsreport hook which modifies the report input data
async function beforeRender(req, res) {
    req.data.organizations = await prepareDataSource()
}