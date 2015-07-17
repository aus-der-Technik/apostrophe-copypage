
// COPYPAGE Plugin for apostrophe 
// ------------------------------------
// aus der Technik - Simon & Wolff GbR
// https://www.ausdertechnik.de
// written 2015

function AposCopypageApply(options) {
    var that = this;
    that.name = options.name;
    that.action = options.action;
    
    $( document ).ready(function() {
        $(".apos-pages-menu")
            .find('.apos-page-bar')
            .append('<li href="#" class="apos-control apos-accordion-item apos-button apos-copypage" data-copy-page>Copy Page</li>');
            
        $('body').on('click', '[data-copy-page]', function() {
            var url = that.action + '/editor';
            $.get(url, function(data) {
                apos.modal(data, {
                      init: that.init
                    , save: that.save
                });
            });
        });
  
        that.init = function(callback) {
            callback();
        };

        that.save = function(callback){
            var url = that.action + '/copy';
            var newName = $('.apos-copypage-name[name="newPageName"]');
            $.jsonCall(url, {'new-page-name': $(newName.last()).val()}, function(data){
                window.location.reload();
                return callback(null);
            });
        }
  
    });
    
}
