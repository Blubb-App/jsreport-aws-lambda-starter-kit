const AWS = require('aws-sdk')
const fs = require('fs')

//TODO set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY env variables
AWS.config.loadFromPath('C:/Users/smiles.tbento/.aws/config.json');

const lambda = new AWS.Lambda({
  //TODO
  region: 'us-east-1',
})

lambda.invoke({
  //TODO
  FunctionName: 'jsfunction',
  Payload: JSON.stringify({
    renderRequest: {
      template: {
        name: 'dashboard-main'
      },
      data: {
        "evolution": {
            "medias": [
                0,
                259,
                0
            ],
            "users": {
                "months": {
                    "labels": [
                        "Sep",
                        "Nov",
                        "Jan",
                        "Feb",
                        "Apr",
                        "May"
                    ],
                    "datasets": {
                        "data": [
                            11,
                            3,
                            1,
                            1,
                            6,
                            14
                        ],
                        "label": "Cadastros"
                    }
                },
                "avg": 6
            },
            "blubbs": {
                "months": {
                    "labels": [
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun"
                    ],
                    "datasets": {
                        "data": [
                            43,
                            33,
                            37,
                            20,
                            19,
                            46,
                            39,
                            2,
                            16,
                            4
                        ],
                        "label": "Cadastros"
                    }
                },
                "avg": 25.9
            }
        },
        "totals": {
            "blubb": 259,
            "user": {
                "active": 20,
                "newsInMonth": 0,
                "inactive": 17,
                "percentVariantLastMonth": 0
            },
            "burst": 0
        },
        "id": "backoffice:admin",
        "categories": {
            "labels": [
                "Design",
                "Street Art",
                "Sports",
                "Home",
                "Gaming",
                "Party",
                "Movies",
                "Brands",
                "Memes",
                "Politics",
                "Nature",
                "Food and drink",
                "Cars",
                "Urban Life",
                "Technology",
                "Innovation",
                "Travel",
                "Celebs",
                "Information",
                "Fashion",
                "Architeture",
                "Adventure",
                "Weather",
                "Art",
                "Fitness",
                "Pets",
                "Night Life",
                "Music",
                "Health",
                "Purchases",
                "History"
            ],
            "datasets": [
                {
                    "color": "dark",
                    "data": [
                        "0.39370078740157477",
                        "0.7874015748031495",
                        "0.7874015748031495",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "100",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0"
                    ],
                    "label": "Cadastradas"
                },
                {
                    "color": "info",
                    "data": [
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0",
                        "0"
                    ],
                    "label": "Acessadas"
                },
                {
                    "color": "warning",
                    "data": [
                        "100",
                        "100",
                        "90",
                        "70",
                        "70",
                        "50",
                        "60",
                        "40",
                        "40",
                        "40",
                        "10",
                        "50",
                        "30",
                        "10",
                        "30",
                        "20",
                        "0",
                        "10",
                        "20",
                        "30",
                        "30",
                        "0",
                        "0",
                        "30",
                        "0",
                        "10",
                        "10",
                        "30",
                        "10",
                        "10",
                        "20"
                    ],
                    "label": "Interesse"
                }
            ]
        }
      }
    }
  })
}, (err, res) => {
  if (err) {
    return console.error(err)
  }
  
  const response = JSON.parse(res.Payload)
  if (response.errorMessage) {
    console.log(response.errorMessage)
    console.log(response.stackTrace)
  } else {
    fs.writeFileSync('report.pdf', Buffer.from(response.body, 'base64'))
  }
})