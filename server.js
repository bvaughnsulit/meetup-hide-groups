const express = require('express');
const app = express();
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');

const filterPath = './data/excluded_groups.txt'

var excluded_groups
refreshFilters()

function refreshFilters() {
    fs.readFile(filterPath, function(err, data){
        excluded_groups = data ? data.toString() : ''
    });
}


// todo add option to view excluded groups

require('dotenv').config();
const apiKey = process.env.apiKey;

const port = 5000;
app.listen(port, () => {
  console.log('Listening on http://localhost:' + port);
});

app.use(bodyParser.json({}));

const apiRoot = 'https://api.meetup.com'


app.post('/group_filter', (req, expressRes) => {

    if (typeof(req.body.groupId) == 'number') {
        fs.appendFile(filterPath, ',' + req.body.groupId, function (err) {
            expressRes.send();
            refreshFilters();
        });
    } else {
        expressRes.sendStatus(400)
    }
});


app.get('/groups', (req, expressRes) => {
// todo this isn't actually /groups, it should be /events
    if (req.query.filtered == 'true'){

        var endpoint = '/find/upcoming_events'
        var params = {
            "order": "time",
            "page": 999,
            "excluded_groups": excluded_groups,
            "radius": 15
        }

        var queryString = ''
        if (params){
            for (var key in params){
                queryString = queryString.concat('&' + key + '=' + params[key])
            }
        }

        var url = apiRoot + endpoint + '?key=' + apiKey + queryString

        console.log(url)

        axios.get(url).then(apiRes => {
            console.log(apiRes.status + ' ' + url)
            expressRes.send(apiRes.data.events)
        });

    } else if (req.query.showOnlyExcluded == 'true') {
        var endpoint = '/2/groups'

        const excludedArray = excluded_groups.split(",")
        paginatedArray = excludedArray.slice(0, 200)

        var params = {
            "offset": 0,
            "order": "location",
            "page": 200,
            "group_id": paginatedArray.toString(),
            "radius": 50
        }

        var queryString = ''
        if (params){
            for (var key in params){
                queryString = queryString.concat('&' + key + '=' + params[key])
            }
        }

        var url = apiRoot + endpoint + '?key=' + apiKey + queryString

        console.log(url)

        axios.get(url).then(apiRes => {
            console.log(apiRes.status + ' ' + url)
            expressRes.send(apiRes.data.results)
        }).catch((error) => {
            console.log(error)
            expressRes.send(apiRes.data)
        })

    } else {
        expressRes.send('must include query string')
    }

});


app.get('/groups/:groupUrl', (req, expressRes) => {


        var endpoint = '/' + req.params.groupUrl
        var params = {
            "fields": "plain_text_description"
        }

        var queryString = ''
        if (params){
            for (var key in params){
                queryString = queryString.concat('&' + key + '=' + params[key])
            }
        }

        var url = apiRoot + endpoint + '?key=' + apiKey + queryString

        axios.get(url).then(apiRes => {
            console.log(apiRes.status)
            expressRes.send(apiRes.data)
        });

});


