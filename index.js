const AWS = require('aws-sdk')
const chromium = require('@sparticuz/chrome-aws-lambda')
const JsReport = require('jsreport')
const FS = require('fs-extra')
const path = require('path')
const os = require('os')
let jsreport

console.log('starting')

const init = (async () => {    
    // this speeds up cold start by some ~500ms    
    precreateExtensionsLocationsCache()

    jsreport = JsReport({
        configFile: path.join(__dirname, 'prod.config.json'),        
        chrome: {
            launchOptions: {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            }         
        }
    })
    await FS.copy(path.join(__dirname, 'data'), '/tmp/data')
    return jsreport.init()
})()

exports.handler = async (event) => {  
  console.log('handling event', event)
  await init

  const template = JSON.parse(event.Records[0].body);
  
  const res = await jsreport.render({
    "template": {
      "name": template.id
    }
  });

  const s3 = new AWS.S3();
  await s3.upload({
    Bucket: template.bucket,
    Key: template.key,
    Body: res.content, // Buffer.from(JSON.stringify(listMaps)),
    // ContentEncoding: 'base64',
    ContentType: 'application/pdf',
    // ACL: 'public-read'
  }).promise()
  
  const response = {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      }), // res.content.toString('base64'),
  }

  return response
}

async function precreateExtensionsLocationsCache() {    
    const rootDir = path.join(path.dirname(require.resolve('jsreport')), '../../')    
    const locationsPath = path.join(rootDir, 'node_modules/locations.json')
    
    if (FS.existsSync(locationsPath)) {
        console.log('locations.json found, extensions crawling will be skipped')
        const locations = JSON.parse(FS.readFileSync(locationsPath)).locations
        const tmpLocationsPath = path.join(os.tmpdir(), 'jsreport', 'core', 'locations.json')
        FS.ensureFileSync(tmpLocationsPath)
        FS.writeFileSync(tmpLocationsPath, JSON.stringify({
            [path.join(rootDir, 'node_modules') + '/']: {
                rootDirectory: rootDir,
                locations: locations.map(l => path.join(rootDir, l).replace(/\\/g, '/')),
                lastSync: Date.now()
            }
        }))        
        
    } else {
        console.log('locations.json not found, the startup will be a bit slower')
    }
}