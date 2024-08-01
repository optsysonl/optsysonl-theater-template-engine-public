$(document).ready(function(){
// newsletter signup click or keydown
    $('#mod_subscribe .button').on('click keydown', function (e) {
        e.preventDefault();

        if (e.type === 'keydown' && e.keyCode !== 13) {
            return;
        }

        let $form = $(this).parent('form');
        let href = $form.attr('action') + '?' + $form.serialize();

        lightbox(href);
    });
    function lightbox(href) {
        type = "iframe";
        $.fancybox({
            type: type,
            href: href,
            width: 600,
            height: 700,
            padding: 0,
            margin: 10,
            fitToView: true,
            autoSize: true,
            closeClick: true,
            openEffect: 'fade',
            closeEffect: 'fade'
        });
    }
});

