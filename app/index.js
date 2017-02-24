var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

urls = ['https://webcat.hkpl.gov.hk/lib/item?id=chamo:3131423',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3194831',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:468395',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1736238',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:908927',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3024854',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1057308',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1929966',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:892353',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1011089',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2129582',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2451278',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2129563',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3137395',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2917338',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3346187',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3376480',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3125559',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3364347',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2856166',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1157983',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2590865',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:510135',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:1843695',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2512698',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:2895374',
        'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3319528',
        ]

var results = [];

app.get('/scrape', function(req, res){

    results = [];

  // The URL we will scrape from - in our example Anchorman 2.

    url = 'https://webcat.hkpl.gov.hk/lib/item?id=chamo:3281396&fromLocationLink=false&theme=WEB&locale=en';

    parsePageRecursive(0, res);
})

function parsePageRecursive(index, res) {

    // check if we are done with the list
    if (index == urls.length) {
        var libraries = invertResults();
        
        fs.writeFile('output.json', JSON.stringify(libraries, null, 4), function(err){
            console.log('Written to output.json. Happy reading!');
        })

        render(libraries, res);
        // res.send(libraries);
        return;
    }

    console.log(index+1 + " / " + urls.length);

    var url = urls[index] + '&locale=en';

    request(url, function(error, response, html){

        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);
            var result = {};

            result.url = url;

            $('.title').filter(function(){
                result.title = $(this).text();
            });

            $('.table').filter(function(){

            // Let's store the data we filter into a variable so we can easily see what's going on.

                var table = $(this);

                var listings = [];

                table.children().eq(1).children().each(function () {
                    var listing = $(this);

                    var listingObj = {};

                    listingObj.library = listing.children().eq(0).children().first().text();
                    listingObj.availability = listing.children().eq(4).children().first().text();

                    listings.push(listingObj);
                });

                result.listings = listings;

            })
        
            results.push(result);

            parsePageRecursive(index+1, res);
        }
    })
}

function invertResults() {
    var libraries = {};
    for (var i=0; i<results.length; i++) {
        var result = results[i];

        for (var j=0; j<result.listings.length; j++) {
            var listing = result.listings[j];

            if (listing.availability == "Available") {

                if (!(listing.library in libraries)) {
                    libraries[listing.library] = [];
                }

                var entry = {}
                entry.title = result.title;
                entry.url = result.url;

                libraries[listing.library].push(entry);
            }
        }
    }

    return libraries;
}

function render(libraries, res) {
    var output = "";

    for (var library in libraries) {
        output += "<h3>" + library + "</h3>";

        var entries = libraries[library];

        output += "<ul>";

        for (var i=0; i<entries.length; i++) {
            var entry = entries[i];
            output += "<li><a href='" + entry.url + "'>" + entry.title + "</a></li>" 
        }

        output += "</ul>";
    }

    res.send(output);

}


app.listen('8081')

console.log('Server running on port 8081');

exports = module.exports = app;