var router = module.exports = require('express').Router();
var mysql = require('mysql');
var fs = require('fs');
var common = require('./common.js');

var et = require('elementtree');
var XML = et.XML;
var ElementTree = et.ElementTree;
var element = et.Element;
var subElement = et.SubElement;

var db = mysql.createPool({
    host: process.env['DB_HOST'],
    user: process.env['DB_USER'],
    password: process.env['DB_PASSWORD'],
    database: process.env['DB_DATABASE'],
    connectionLimit: 10
});

router.use(function(req, res, next) {
    console.log(req.url);
    next();
});

var pattern = '/0004f2[0-9a-f]{6}';
var url_base = '/';
var extra_configs = ['device.cfg', 'site.cfg', 'applications.cfg'];
extra_configs = extra_configs.map(function(file) {
    return '/files/' + file;
});
extra_configs.push('/server.cfg'); // Served by the API

router.route('/server.cfg').get(function(req, res) {
	fs.readFile('files/server.cfg', 'utf8', function(err, file) {
		if (!err) {
			var doc = et.parse(file);
			doc.findall('./voIpProt/voIpProt.server')[0].set('voIpProt.server.1.address', process.env['PBX_HOST']);
			res.send(doc.write({xml_declaration: true}));
		}
	});
});

router.route(pattern + '.cfg').get(function(req, res) {
    console.log('Serving request for a config file.');
    fs.readFile('files/mac-template.cfg', 'utf8', function(err, file) {
        if (!err) {
            var mac_address = req.url.match('[0-9a-f]{12}');
            common.getPhoneInfo(mac_address, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var doc = et.parse(file);
                    var config_url = url_base + 'ext/' + data.extension + '.cfg';
                    doc._root.set('CONFIG_FILES', [config_url].concat(extra_configs).join(', '));
                    res.send(doc.write({xml_declaration: true}));
                }
            });
        } else {
            res.status(500).send('Failed ' + err);
        }
    });
});

router.route('/ext/:extension_number').get(function(req, res) {
    fs.readFile('files/extension-template.cfg', 'utf8', function(err, file) {
        if (!err) {
            var doc = et.parse(file);
            common.getExtensionInfo(req.params.extension_number, function(err, data) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    var reg = doc.findall('./reg')[0];
                    reg.set('reg.1.address', data.extension);
                    reg.set('reg.1.auth.password', data.secret);
                    reg.set('reg.1.auth.userId', data.extension);
                    var label = ((data.extension + '|' + data.name).substring(0, 10));
                    reg.set('reg.1.label', label);
                    res.send(doc.write({xml_declaration: true}));
                }
            });
        } else {
            res.status(500).send('Failed ' + err);
        }
    });
});

router.route('000000000000-directory*').get(handleDirectory);
router.route(pattern + '-directory*').get(handleDirectory);

function handleDirectory(req, res) {
    var root = element('directory');
    //root.set('xmlns', 'http://www.w3.org/2005/Atom');
    var itemList = subElement(root, 'item_list');
    common.getDirectory(function(items) {
	for (var i = 0; i < items.length; i++) {
		var person = items[i];
		var item = subElement(itemList, 'item');
		item.set('ln', person.last_name);
		item.set('fn', person.first_name);
		item.set('ct', person.extension);
		item.set('sd', i);
	}
        res.send(new ElementTree(root).write({xml_declaration: true}));
    });
}

router.route('/files/:filename').get(function(req, res) {
    res.sendFile(req.params.filename, {root: 'static/files' });
});

router.route('/sip*').get(function(req, res) {
    res.redirect('http://10.1.10.15/sip' + req.url);
});
