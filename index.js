/* jshint node:true */

// COPYPAGE Plugin for apostrophe 
// ------------------------------------
// aus der Technik - Simon & Simon GbR
// https://www.ausdertechnik.de
// written 2015

var _ = require('underscore')

// Prototyping String for use with variables, like "Hello $1, today its $2"
String.prototype.template = String.prototype.template ||
    function (){
        var args = Array.prototype.slice.call(arguments)
            ,str  = this
            ;
        function replacer(a){
            var aa = parseInt(a.substr(1),10)-1;
            return args[aa];
        }
        return  str.replace(/(\$\d+)/gm,replacer)
    };

module.exports = function(options, callback) {
    return new Construct(options, callback);
};

module.exports.Construct = Construct;
function Construct(options, callback) {
    var that = this;

    options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'copypage' } ]);

    that.name = options.name || 'copypage';
    that._apos = options.apos;
    that._action = '/apos-' + that._apos.cssName(that.name);
    that._app = options.app;
    that._options = options;

    that.defaultPageName = options['new-pagename'];

    // Mix in the ability to serve assets and templates
    that._apos.mixinModuleAssets(that, 'copypage', __dirname, options);

    // Include our editor template in the markup when aposTemplates is called
    //that.pushAsset('template', 'copypageEditor', { when: 'user' });
    that.pushAsset('script', 'apply', { when: 'user' });
     
    that._apos.pushGlobalCallWhen('user', 'AposCopypageApply(?)', {
          action: that._action
        , name: that.name
        , defaultPageName: that.defaultPageName
    });
    
    that.widget = true;
    that.label = 'Copy this page';
    that.css = 'copypage';
    that.icon = 'icon-copypage';
    that.renderWidget = function(data) {
        return that.render('copypage', data);
    };
    that._apos.addWidgetType('copypage', that);
        
    that.loader = function(req, callback) {
        that.req = req;
        that._apos.getPage(req, req.slug, function(e, page, bestPage, remainder) {
            if(page){
                that.sourcePage = page;
                that.defaultPageName = that.defaultPageName.template(page.title);
            }
            callback();
        });
    };
    
    that._app.get(that._action + '/editor', function(req, res) {
        var t = that.renderPage(req, 'copypageEditor', {defaultPageName: that.defaultPageName});
        return res.send(t);
    });
    
    that._app.post(that._action + '/copy', function(req, res) {
        var targetPage = _.clone(that.sourcePage);
        delete targetPage._id;
        targetPage.title = req.body['new-page-name'] || that.defaultPageName;
        targetPage.slug +=  "-copy";
        targetPage.published = false;
        that._apos.putPage(req, targetPage.slug, targetPage, function(err, page) {
            if(err){
                return res.send(500, err);
            }
            res.send(204);
        });

     });

    if (callback) {
        process.nextTick(function() {
            return callback();
        });
    }

};

