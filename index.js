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

const s3 = new AWS.S3();

const createAndUploadReport = async(template) => {
  console.log('createAndUploadReport id', template.id);

  const res = await jsreport.render({
    "template": {
      "name": template.id
    },
    "data": template.hasOwnProperty("data") ? template.data : undefined
  });
  
  console.log('start upload s3', template.id);
  const rS3 = await s3.upload({
    Bucket: template.bucket,
    Key: template.key,
    Body: res.content,
    ContentType: 'application/pdf',
    CacheControl: 'no-cache'
  }).promise();
  console.log('end upload s3', template.id, rS3);
}

exports.handler = async (event) => {  
  console.log('handling event', event)
  await init

  const promise = [];
  event.Records.forEach(message => {
    promise.push(JSON.parse(message.body))
  });
  await Promise.all(
    promise.map(p => createAndUploadReport(p))
  );

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